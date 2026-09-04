// @/app/Insight/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  type Insight,
  insightTypeLabel,
  metricLabel,
} from "@/lib/insight-labels";

// Shape returned by GET /api/insights.
type InsightPage = {
  items: Insight[];
  page: number;
  total: number;
  totalPages: number;
};

type Filter = "all" | "unread";

const PERIOD_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const LOAD_ERROR = "Insight-mu belum bisa dimuat. Coba muat ulang halaman.";
const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const CHIP_CLASS =
  "rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const OUTLINE_BUTTON_CLASS =
  "w-full rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

// Module level so it stays referentially stable across renders and can be
// used inside the effect without becoming a dependency.
function insightsUrl(page: number, filter: Filter) {
  return `/api/insights?page=${page}${
    filter === "unread" ? "&isRead=false" : ""
  }`;
}

function isAbort(cause: unknown) {
  return cause instanceof Error && cause.name === "AbortError";
}

export default function InsightPage() {
  const router = useRouter();
  const [items, setItems] = useState<Insight[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generating, setGenerating] = useState(false);
  // The generate endpoint returns its own Indonesian message for both the
  // "made some" and "not enough data" cases, so it is shown verbatim.
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  // Shared by the initial load, the filter switch and the post-generate
  // refresh, so all three go through exactly the same response handling.
  const loadFirstPage = useCallback(
    async (signal?: AbortSignal) => {
      setItems(null);
      setError(null);

      try {
        const response = await fetch(insightsUrl(1, filter), { signal });

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!response.ok) {
          setError(LOAD_ERROR);
          return;
        }

        const data = (await response.json()) as InsightPage;

        setItems(data.items);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (cause) {
        // A superseded filter switch aborts its own request; that is not an
        // error worth showing.
        if (isAbort(cause)) return;
        setError(NETWORK_ERROR);
      }
    },
    [filter, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadFirstPage(controller.signal);

    return () => controller.abort();
  }, [loadFirstPage]);

  async function loadMore() {
    setError(null);
    setLoadingMore(true);

    try {
      const response = await fetch(insightsUrl(page + 1, filter));

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(LOAD_ERROR);
        return;
      }

      const data = (await response.json()) as InsightPage;
      setItems((current) => [...(current ?? []), ...data.items]);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoadingMore(false);
    }
  }

  async function generate() {
    setError(null);
    setGenerateMessage(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError("Belum bisa mencari pola baru. Coba lagi sebentar lagi.");
        return;
      }

      const data = (await response.json()) as { message: string };
      setGenerateMessage(data.message);
      await loadFirstPage();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setGenerating(false);
    }
  }

  async function markRead(id: string) {
    setError(null);
    setMarking(id);

    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError("Belum bisa menandai insight ini. Coba lagi sebentar lagi.");
        return;
      }

      // Updated in place rather than removed, so the list does not jump out
      // from under the tap. It drops out of the unread filter on next load.
      setItems((current) =>
        (current ?? []).map((insight) =>
          insight._id === id ? { ...insight, isRead: true } : insight,
        ),
      );
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setMarking(null);
    }
  }

  return (
    <main className="flex min-h-screen justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            RuangPijar
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">Insight</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Pola yang mulai terlihat dari check-in kamu.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`${CHIP_CLASS} ${
              filter === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
          >
            Semua
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            aria-pressed={filter === "unread"}
            className={`${CHIP_CLASS} ${
              filter === "unread"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border"
            }`}
          >
            Belum dibaca
          </button>
        </div>

        {error ? (
          <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
            {error}
          </p>
        ) : null}

        {generateMessage ? (
          <p
            aria-live="polite"
            className="mb-5 rounded-xl border border-border px-4 py-3 text-sm"
          >
            {generateMessage}
          </p>
        ) : null}

        {items === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Memuat insight…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border px-4 py-10 text-center">
            <p className="text-sm font-medium">
              {filter === "unread"
                ? "Semua sudah kamu baca"
                : "Belum ada insight"}
            </p>

            <p className={`mt-2 ${HINT_CLASS}`}>
              {filter === "unread"
                ? "Tidak ada yang tersisa di sini."
                : "Insight muncul setelah ada cukup check-in untuk dibaca polanya."}
            </p>

            {filter === "all" ? (
              <Link
                href="/check-in"
                className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Mulai check-in
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <p className={`mb-3 ${HINT_CLASS}`}>
              {total} insight{filter === "unread" ? " belum dibaca" : ""}.
            </p>

            <ul className="space-y-3">
              {items.map((insight) => (
                <li
                  key={insight._id}
                  className="rounded-xl border border-border px-4 py-4"
                >
                  <div className={`flex flex-wrap gap-2 ${HINT_CLASS}`}>
                    <span>{insightTypeLabel(insight.type)}</span>

                    <span>
                      · {metricLabel(insight.metric)}
                      {insight.relatedMetric
                        ? ` & ${metricLabel(insight.relatedMetric)}`
                        : ""}
                    </span>

                    {insight.confidence !== null ? (
                      <span>
                        · keyakinan {Math.round(insight.confidence * 100)}%
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm font-medium">{insight.title}</p>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>

                  <p className={`mt-3 ${HINT_CLASS}`}>
                    {PERIOD_FORMAT.format(new Date(insight.periodStart))} –{" "}
                    {PERIOD_FORMAT.format(new Date(insight.periodEnd))}
                  </p>

                  {insight.isRead ? (
                    <p className={`mt-4 ${HINT_CLASS}`}>Sudah dibaca.</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(insight._id)}
                      disabled={marking === insight._id}
                      className="mt-4 w-full rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {marking === insight._id
                        ? "Menyimpan…"
                        : "Tandai sudah dibaca"}
                    </button>
                  )}

                  {/* A separate link rather than wrapping the card, which
                      would nest the button above inside an anchor. */}
                  <Link
                    href={`/insight/${insight._id}`}
                    className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
                  >
                    Lihat detail
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {page < totalPages ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className={`mt-4 ${OUTLINE_BUTTON_CLASS}`}
          >
            {loadingMore ? "Memuat…" : "Muat lebih banyak"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className={`mt-4 ${OUTLINE_BUTTON_CLASS}`}
        >
          {generating ? "Mencari pola…" : "Cari pola baru"}
        </button>

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
