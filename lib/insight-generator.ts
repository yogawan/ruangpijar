// lib/insight-generator.ts
// Rule-based insight generation over a user's recent check-ins. No ML/LLM
// involved: trends compare first vs. second half of the window, correlation
// uses Pearson's r between stress and sleep, and pattern flags a dominant
// stressor factor.
import { connectDB } from "@/lib/mongodb";
import { CheckInModel } from "@/models/CheckIn";
import { InsightModel } from "@/models/Insight";

const WINDOW_DAYS = 14;
const MIN_CHECK_INS = 3;
const TREND_THRESHOLD = 0.75;
const CORRELATION_THRESHOLD = 0.4;
const PATTERN_SHARE_THRESHOLD = 0.4;

type Metric =
  | "MOOD"
  | "STRESS"
  | "ENERGY"
  | "SLEEP"
  | "ACADEMIC_LOAD"
  | "SOCIAL_LOAD";

const FACTOR_LABELS: Record<string, string> = {
  ACADEMIC: "Beban akademik",
  WORK: "Pekerjaan",
  SOCIAL: "Kehidupan sosial",
  FAMILY: "Keluarga",
  FINANCIAL: "Keuangan",
  SLEEP: "Tidur",
  RELATIONSHIP: "Hubungan",
  SELF: "Diri sendiri",
  OTHER: "Faktor lain",
};

function factorToMetric(factor: string): Metric {
  switch (factor) {
    case "ACADEMIC":
    case "WORK":
      return "ACADEMIC_LOAD";
    case "SOCIAL":
    case "FAMILY":
    case "RELATIONSHIP":
      return "SOCIAL_LOAD";
    case "SLEEP":
      return "SLEEP";
    default:
      return "MOOD";
  }
}

function average(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const meanX = average(xs);
  const meanY = average(ys);
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

type Candidate = {
  type: "CORRELATION" | "TREND" | "PATTERN";
  title: string;
  description: string;
  metric: Metric;
  relatedMetric?: Metric;
  confidence?: number;
};

export async function generateInsightsForUser(userId: string) {
  await connectDB();

  const periodEnd = new Date();
  const periodStart = new Date(
    periodEnd.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const checkIns = await CheckInModel.find({
    userId,
    checkedInAt: { $gte: periodStart, $lte: periodEnd },
  })
    .sort({ checkedInAt: 1 })
    .lean();

  if (checkIns.length < MIN_CHECK_INS) {
    return [];
  }

  const candidates: Candidate[] = [];

  const mid = Math.floor(checkIns.length / 2) || 1;
  const firstHalf = checkIns.slice(0, mid);
  const secondHalf = checkIns.slice(mid);

  const trendChecks: Array<{
    key: "mood" | "stress" | "energy";
    metric: Metric;
    label: string;
  }> = [
    { key: "mood", metric: "MOOD", label: "mood" },
    { key: "stress", metric: "STRESS", label: "stres" },
    { key: "energy", metric: "ENERGY", label: "energi" },
  ];

  for (const { key, metric, label } of trendChecks) {
    if (secondHalf.length === 0) break;

    const before = average(firstHalf.map((c) => c[key]));
    const after = average(secondHalf.map((c) => c[key]));
    const delta = after - before;

    if (Math.abs(delta) >= TREND_THRESHOLD) {
      const direction = delta > 0 ? "naik" : "turun";
      candidates.push({
        type: "TREND",
        metric,
        title: `Tren ${label} kamu ${direction}`,
        description: `Rata-rata ${label} kamu ${direction} dari ${before.toFixed(1)} menjadi ${after.toFixed(1)} dalam ${WINDOW_DAYS} hari terakhir.`,
        confidence: Math.min(1, Math.abs(delta) / 4),
      });
    }
  }

  const withSleep = checkIns.filter((c) => typeof c.sleepHours === "number");
  if (withSleep.length >= MIN_CHECK_INS) {
    const sleepValues = withSleep.map((c) => c.sleepHours as number);
    const stressValues = withSleep.map((c) => c.stress);
    const correlation = pearsonCorrelation(sleepValues, stressValues);

    if (Math.abs(correlation) >= CORRELATION_THRESHOLD) {
      candidates.push({
        type: "CORRELATION",
        metric: "STRESS",
        relatedMetric: "SLEEP",
        title: "Tidur berkaitan dengan tingkat stres kamu",
        description: `Semakin ${correlation < 0 ? "sedikit" : "banyak"} jam tidur kamu, stres cenderung ${correlation < 0 ? "lebih tinggi" : "lebih rendah"}. Korelasi terdeteksi: ${correlation.toFixed(2)}.`,
        confidence: Math.min(1, Math.abs(correlation)),
      });
    }
  }

  const factorCounts = new Map<string, number>();
  for (const checkIn of checkIns) {
    for (const factor of checkIn.factors ?? []) {
      factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
    }
  }

  let topFactor: string | null = null;
  let topCount = 0;
  for (const [factor, count] of factorCounts) {
    if (count > topCount) {
      topFactor = factor;
      topCount = count;
    }
  }

  if (topFactor && topCount / checkIns.length >= PATTERN_SHARE_THRESHOLD) {
    const share = Math.round((topCount / checkIns.length) * 100);
    const label = FACTOR_LABELS[topFactor] ?? topFactor;
    candidates.push({
      type: "PATTERN",
      metric: factorToMetric(topFactor),
      title: `${label} sering muncul sebagai faktor`,
      description: `${label} muncul di ${share}% check-in kamu dalam ${WINDOW_DAYS} hari terakhir.`,
      confidence: Math.min(1, topCount / checkIns.length),
    });
  }

  if (candidates.length === 0) {
    return [];
  }

  return InsightModel.insertMany(
    candidates.map((candidate) => ({
      userId,
      type: candidate.type,
      title: candidate.title,
      description: candidate.description,
      metric: candidate.metric,
      relatedMetric: candidate.relatedMetric ?? null,
      confidence: candidate.confidence ?? null,
      periodStart,
      periodEnd,
      isRead: false,
    })),
  );
}
