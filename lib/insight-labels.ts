// lib/insight-labels.ts
// Mirrors the type and metric enums in models/Insight.ts.

export type Insight = {
  _id: string;
  type: string;
  title: string;
  description: string;
  metric: string;
  relatedMetric: string | null;
  confidence: number | null;
  periodStart: string;
  periodEnd: string;
  isRead: boolean;
};

export const INSIGHT_TYPES = [
  { value: "CORRELATION", label: "Keterkaitan" },
  { value: "TREND", label: "Tren" },
  { value: "PATTERN", label: "Pola" },
  { value: "REFLECTION", label: "Refleksi" },
] as const;

const METRIC_LABELS: Record<string, string> = {
  MOOD: "Suasana hati",
  STRESS: "Stres",
  ENERGY: "Energi",
  SLEEP: "Tidur",
  ACADEMIC_LOAD: "Beban akademik",
  SOCIAL_LOAD: "Beban sosial",
};

// Both fall back to the raw value so an enum added to the model still renders.
export function insightTypeLabel(value: string) {
  return INSIGHT_TYPES.find((type) => type.value === value)?.label ?? value;
}

export function metricLabel(value: string) {
  return METRIC_LABELS[value] ?? value;
}
