// @/app/jejak/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CheckInCalendar from "@/components/CheckInCalendar";
import CheckInDayModal from "@/components/CheckInDayModal";
import NavbarGlobal from "@/components/NavbarGlobal";
import { actionTypeLabel } from "@/lib/action-labels";
import { dayKey, monthRange, startOfMonth } from "@/lib/calendar";
import type { CheckIn } from "@/lib/check-in-labels";
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

// The calendar above owns check-ins, so this feed asks for the other two.
type JejakEntry =
  | { type: "ACTION_LOG"; id: string; occurredAt: string; data: ActionLogEntry }
  | { type: "INSIGHT"; id: string; occurredAt: string; data: Insight };

// Note the absence of total/totalPages — this endpoint does not count.
type JejakResponse = {
  items: JejakEntry[];
  page: number;
  limit: number;
};

type CheckInPage = {
  items: CheckIn[];
  totalPages: number;
};

const JEJAK_URL = "/api/jejak?types=ACTION_LOG,INSIGHT";

// A month of check-ins fits well inside the API's 100 cap, but the response
// is still paged through rather than assumed to be complete.
const CHECK_IN_PAGE_SIZE = 100;

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
const CALENDAR_ERROR = "Kalendermu belum bisa dimuat. Coba muat ulang halaman.";
const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const CARD_CLASS = "rounded-xl border border-border px-4 py-4";
const LINK_CARD_CLASS = `block ${CARD_CLASS} transition-colors hover:border-primary/40`;

const ENTRY_LABEL: Record<JejakEntry["type"], string> = {
  ACTION_LOG: "Latihan",
  INSIGHT: "Insight",
};

const ACTION_STATUS_LABEL: Record<ActionLogEntry["status"], string> = {
  STARTED: "Dimulai",
  COMPLETED: "Selesai",
  SKIPPED: "Dilewati",
};

function isAbort(cause: unknown) {
  return cause instanceof Error && cause.name === "AbortError";
}

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

  // --- Calendar -----------------------------------------------------------
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // null while the month is in flight, which is what separates "loading"
  // from "this month is genuinely empty".
  const [checkIns, setCheckIns] = useState<CheckIn[] | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // --- Latihan & insight feed ---------------------------------------------
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
      setCheckIns(null);
      setCalendarError(null);

      const { from, to } = monthRange(month);
      const collected: CheckIn[] = [];

      try {
        let current = 1;
        let totalPages = 1;

        while (current <= totalPages) {
          const response = await fetch(
            `/api/check-ins?from=${encodeURIComponent(
              from,
            )}&to=${encodeURIComponent(
              to,
            )}&page=${current}&limit=${CHECK_IN_PAGE_SIZE}`,
            { signal: controller.signal },
          );

          if (response.status === 401) {
            router.replace("/auth/login");
            return;
          }

          if (!response.ok) {
            setCalendarError(CALENDAR_ERROR);
            return;
          }

          const data = (await response.json()) as CheckInPage;

          collected.push(...data.items);
          totalPages = data.totalPages;
          current += 1;
        }

        setCheckIns(collected);
      } catch (cause) {
        // Switching months aborts the previous month's request; that is not
        // an error worth showing.
        if (isAbort(cause)) return;
        setCalendarError(NETWORK_ERROR);
      }
    }

    load();

    return () => controller.abort();
  }, [month, router]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${JEJAK_URL}&page=1`, {
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
        if (isAbort(cause)) return;
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
      const response = await fetch(`${JEJAK_URL}&page=${page + 1}`);

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

  const checkInsByDay = useMemo(() => {
    const map = new Map<string, CheckIn[]>();

    for (const checkIn of checkIns ?? []) {
      const key = dayKey(new Date(checkIn.checkedInAt));
      const existing = map.get(key);

      if (existing) existing.push(checkIn);
      else map.set(key, [checkIn]);
    }

    // The API sorts newest first; within a single day, reading top-to-bottom
    // in the modal is more natural chronologically.
    for (const entries of map.values()) {
      entries.sort(
        (a, b) =>
          new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime(),
      );
    }

    return map;
  }, [checkIns]);

  const selectedCheckIns = selectedDay
    ? (checkInsByDay.get(selectedDay) ?? [])
    : [];

  return (
    <>
      <NavbarGlobal variant="app" />

      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Jejak</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Pilih tanggal untuk melihat check-in hari itu.
            </p>
          </div>

          {calendarError ? (
            <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
              {calendarError}
            </p>
          ) : null}

          <CheckInCalendar
            month={month}
            onMonthChange={setMonth}
            checkInsByDay={checkInsByDay}
            onSelectDay={setSelectedDay}
            loading={checkIns === null && calendarError === null}
          />

          {checkIns !== null && checkIns.length === 0 ? (
            <p className={`mt-4 text-center ${HINT_CLASS}`}>
              Belum ada check-in di bulan ini.{" "}
              <Link
                href="/check-in"
                className="font-medium text-primary hover:underline"
              >
                Mulai check-in
              </Link>
            </p>
          ) : null}

          {/* Latihan & insight — everything on this page that is not a
              check-in, still in one chronological list. */}
          <section aria-labelledby="jejak-lainnya" className="mt-10">
            <h2 id="jejak-lainnya" className="text-lg font-semibold">
              Latihan &amp; Insight
            </h2>

            <p className={`mt-1 mb-4 ${HINT_CLASS}`}>
              Latihan yang kamu jalani dan pola yang ditemukan, terbaru dulu.
            </p>

            {error ? (
              <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
                {error}
              </p>
            ) : null}

            {items === null ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Memuat jejakmu…
              </p>
            ) : items.length === 0 ? (
              <div className={`${CARD_CLASS} py-10 text-center`}>
                <p className="text-sm font-medium">Belum ada latihan</p>

                <p className={`mt-2 ${HINT_CLASS}`}>
                  Latihan yang kamu jalani dari Ruang akan tercatat di sini.
                </p>

                <Link
                  href="/ruang"
                  className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Lihat Ruang
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((entry) => {
                  if (entry.type === "ACTION_LOG") {
                    const log = entry.data;

                    return (
                      <li
                        key={`${entry.type}-${entry.id}`}
                        className={CARD_CLASS}
                      >
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

                        <p className="mt-2 text-sm font-medium">
                          {insight.title}
                        </p>

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
          </section>

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

      <CheckInDayModal
        day={selectedDay ? new Date(`${selectedDay}T00:00:00`) : null}
        checkIns={selectedCheckIns}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
