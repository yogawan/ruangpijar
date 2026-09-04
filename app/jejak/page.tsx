// @/app/jejak/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { actionTypeLabel } from "@/lib/action-labels";
import {
  type CheckIn,
  factorLabel,
  moodFor,
  statsFor,
} from "@/lib/check-in-labels";
import { type Insight, insightTypeLabel } from "@/lib/insight-labels";

type ActionLogEntry = {
  _id: string;
  status: "STARTED" | "COMPLETED" | "SKIPPED";
  startedAt: string;
  completedAt: string | null;
  // Populated by the API with a subset of the action; null if it was removed.
  actionId: {
    _id: string;
    title: string;
    type: string;
    durationMinutes: number | null;
  } | null;
};

// GET /api/jejak merges three collections into one chronological feed.
type JejakEntry =
  | { type: "CHECK_IN"; id: string; occurredAt: string; data: CheckIn }
  | { type: "ACTION_LOG"; id: string; occurredAt: string; data: ActionLogEntry }
  | { type: "INSIGHT"; id: string; occurredAt: string; data: Insight };

// Note the absence of total/totalPages — this endpoint does not count.
type JejakResponse = {
  items: JejakEntry[];
  page: number;
  limit: number;
};

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const LOAD_ERROR = "Riwayatmu belum bisa dimuat. Coba muat ulang halaman.";
const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const CARD_CLASS = "rounded-xl border border-border px-4 py-4";
const LINK_CARD_CLASS = `block ${CARD_CLASS} transition-colors hover:border-primary/40`;

const ENTRY_LABEL: Record<JejakEntry["type"], string> = {
  CHECK_IN: "Check-in",
  ACTION_LOG: "Latihan",
  INSIGHT: "Insight",
};

const ACTION_STATUS_LABEL: Record<ActionLogEntry["status"], string> = {
  STARTED: "Dimulai",
  COMPLETED: "Selesai",
  SKIPPED: "Dilewati",
};

function EntryHeader({ entry, extra }: { entry: JejakEntry; extra?: string }) {
  const occurredAt = new Date(entry.occurredAt);

  return (
    <div className={`flex flex-wrap gap-2 ${HINT_CLASS}`}>
      <span>{ENTRY_LABEL[entry.type]}</span>
      {extra ? <span>· {extra}</span> : null}
      <span>
        · {DATE_FORMAT.format(occurredAt)} · {TIME_FORMAT.format(occurredAt)}
      </span>
    </div>
  );
}

export default function JejakPage() {
  const router = useRouter();
  // null until the first page resolves, which is what tells loading apart
  // from a genuinely empty history.
  const [items, setItems] = useState<JejakEntry[] | null>(null);
  const [page, setPage] = useState(1);
  // The endpoint reports no total, so "there may be more" is inferred from a
  // page coming back full.
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/jejak?page=1", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!response.ok) {
          setError(LOAD_ERROR);
          return;
        }

        const data = (await response.json()) as JejakResponse;

        setItems(data.items);
        setPage(data.page);
        setHasMore(data.items.length === data.limit);
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(NETWORK_ERROR);
      }
    }

    load();

    return () => controller.abort();
  }, [router]);

  async function loadMore() {
    setError(null);
    setLoadingMore(true);

    try {
      const response = await fetch(`/api/jejak?page=${page + 1}`);

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(LOAD_ERROR);
        return;
      }

      const data = (await response.json()) as JejakResponse;
      setItems((current) => [...(current ?? []), ...data.items]);
      setPage(data.page);
      setHasMore(data.items.length === data.limit);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoadingMore(false);
    }
  }

  if (items === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {error ? (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Memuat jejakmu…</p>
          )}
        </div>
      </main>
    );
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

          <h1 className="mt-8 text-3xl font-bold tracking-tight">Jejak</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Check-in, latihan, dan insight kamu dalam satu urutan.
          </p>
        </div>

        {error ? (
          <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
            {error}
          </p>
        ) : null}

        {items.length === 0 ? (
          <div className={`${CARD_CLASS} py-10 text-center`}>
            <p className="text-sm font-medium">Belum ada jejak</p>

            <p className={`mt-2 ${HINT_CLASS}`}>
              Begitu kamu menulis check-in pertama, jejaknya muncul di sini.
            </p>

            <Link
              href="/check-in"
              className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Mulai check-in
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((entry) => {
              if (entry.type === "CHECK_IN") {
                const checkIn = entry.data;
                const mood = moodFor(checkIn.mood);

                return (
                  <li key={`${entry.type}-${entry.id}`}>
                    <Link
                      href={`/check-in/${checkIn._id}`}
                      className={LINK_CARD_CLASS}
                    >
                      <EntryHeader entry={entry} />

                      <div className="mt-2 flex items-center gap-3">
                        <span aria-hidden="true" className="text-2xl">
                          {mood?.emoji ?? "•"}
                        </span>

                        <p className="text-sm font-medium">
                          {mood?.label ?? `Mood ${checkIn.mood}`}
                        </p>
                      </div>

                      <dl className="mt-4 grid grid-cols-3 gap-3">
                        {statsFor(checkIn).map((stat) => (
                          <div key={stat.label}>
                            <dt className={HINT_CLASS}>{stat.label}</dt>
                            <dd className="text-sm font-medium">
                              {stat.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {checkIn.factors.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {checkIn.factors.map((factor) => (
                            <li
                              key={factor}
                              className="rounded-full border border-border px-3 py-1 text-xs"
                            >
                              {factorLabel(factor)}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {checkIn.reflection ? (
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">
                          {checkIn.reflection}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              }

              if (entry.type === "ACTION_LOG") {
                const log = entry.data;

                return (
                  <li key={`${entry.type}-${entry.id}`} className={CARD_CLASS}>
                    <EntryHeader
                      entry={entry}
                      extra={ACTION_STATUS_LABEL[log.status]}
                    />

                    <p className="mt-2 text-sm font-medium">
                      {log.actionId?.title ?? "Latihan yang sudah dihapus"}
                    </p>

                    {log.actionId ? (
                      <p className={`mt-2 ${HINT_CLASS}`}>
                        {actionTypeLabel(log.actionId.type)}
                        {log.actionId.durationMinutes !== null
                          ? ` · ${log.actionId.durationMinutes} menit`
                          : ""}
                      </p>
                    ) : null}
                  </li>
                );
              }

              const insight = entry.data;

              return (
                <li key={`${entry.type}-${entry.id}`}>
                  <Link
                    href={`/insight/${insight._id}`}
                    className={LINK_CARD_CLASS}
                  >
                    <EntryHeader
                      entry={entry}
                      extra={insightTypeLabel(insight.type)}
                    />

                    <p className="mt-2 text-sm font-medium">{insight.title}</p>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {insight.description}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-4 w-full rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Memuat…" : "Muat lebih banyak"}
          </button>
        ) : null}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ingin menulis lagi?{" "}
          <Link
            href="/check-in"
            className="font-medium text-primary hover:underline"
          >
            Check-in
          </Link>
        </p>
      </div>
    </main>
  );
}
