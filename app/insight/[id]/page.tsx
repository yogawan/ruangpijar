// @/app/insight/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type Insight,
  insightTypeLabel,
  metricLabel,
} from "@/lib/insight-labels";

type InsightPage = {
  items: Insight[];
  page: number;
  totalPages: number;
};

// "missing" also covers an id that simply is not among this user's insights.
type Status = "loading" | "ready" | "missing" | "error";

const PERIOD_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const OUTLINE_BUTTON_CLASS =
  "flex-1 rounded-xl border border-border px-4 py-3 text-center font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const PAGE_SIZE = 100;

export default function InsightDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [insight, setInsight] = useState<Insight | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // There is no GET /api/insights/{id}, so the list is walked instead:
    // 100 at a time, stopping as soon as the id turns up. For a realistic
    // history that is a single request.
    async function load() {
      try {
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          const response = await fetch(
            `/api/insights?page=${page}&limit=${PAGE_SIZE}`,
            { signal: controller.signal },
          );

          if (response.status === 401) {
            router.replace("/auth/login");
            return;
          }

          if (!response.ok) {
            setError("Insight ini belum bisa dimuat. Coba muat ulang halaman.");
            setStatus("error");
            return;
          }

          const data = (await response.json()) as InsightPage;
          const found = data.items.find((item) => item._id === id);

          if (found) {
            setInsight(found);
            setStatus("ready");
            return;
          }

          totalPages = data.totalPages;
          page += 1;
        }

        setStatus("missing");
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(NETWORK_ERROR);
        setStatus("error");
      }
    }

    load();

    return () => controller.abort();
  }, [id, router]);

  // PATCH defaults to true but also accepts false, so this toggles both ways.
  async function setRead(isRead: boolean) {
    setError(null);
    setMarking(true);

    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(
          "Belum bisa memperbarui insight ini. Coba lagi sebentar lagi.",
        );
        return;
      }

      const updated = (await response.json()) as Insight;
      setInsight(updated);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setMarking(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <p className="text-sm text-muted-foreground">Memuat insight…</p>
      </main>
    );
  }

  if (!insight) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {status === "missing" ? (
            <>
              <p className="text-sm font-medium">Insight tidak ditemukan</p>

              <p className={`mt-2 ${HINT_CLASS}`}>
                Mungkin tautannya sudah tidak berlaku.
              </p>
            </>
          ) : (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          )}

          <Link
            href="/insight"
            className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Kembali ke Insight
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/ruang_pijar_logo.png"
              alt="RuangPijar"
              width={478}
              height={476}
              className="h-20 w-20 object-contain"
            />
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Satu insight
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {PERIOD_FORMAT.format(new Date(insight.periodStart))} –{" "}
            {PERIOD_FORMAT.format(new Date(insight.periodEnd))}
          </p>
        </div>

        {error ? (
          <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-border px-4 py-5">
          <div className={`flex flex-wrap gap-2 ${HINT_CLASS}`}>
            <span>{insightTypeLabel(insight.type)}</span>

            <span>
              · {metricLabel(insight.metric)}
              {insight.relatedMetric
                ? ` & ${metricLabel(insight.relatedMetric)}`
                : ""}
            </span>

            {insight.confidence !== null ? (
              <span>· keyakinan {Math.round(insight.confidence * 100)}%</span>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium">{insight.title}</p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {insight.description}
          </p>

          <p className={`mt-4 ${HINT_CLASS}`}>
            {insight.isRead ? "Sudah dibaca." : "Belum dibaca."}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Link href="/insight" className={OUTLINE_BUTTON_CLASS}>
            Kembali
          </Link>

          <button
            type="button"
            onClick={() => setRead(!insight.isRead)}
            disabled={marking}
            className={OUTLINE_BUTTON_CLASS}
          >
            {marking
              ? "Menyimpan…"
              : insight.isRead
                ? "Tandai belum dibaca"
                : "Tandai sudah dibaca"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Semua catatanmu ada di{" "}
          <Link
            href="/jejak"
            className="font-medium text-primary hover:underline"
          >
            Jejak
          </Link>
        </p>
      </div>
    </main>
  );
}
