// @/app/ruang/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavbarGlobal from "@/components/NavbarGlobal";
import OnboardingTour from "@/components/OnboardingTour";
import {
  ACTION_TYPES,
  type Action,
  type ActionLogStatus,
  actionTypeLabel,
} from "@/lib/action-labels";
import { factorLabel } from "@/lib/check-in-labels";

// GET /api/actions/recommended returns basedOnFactors alongside items;
// GET /api/actions returns the paginated catalogue. Both share `items`.
type ActionListResponse = {
  items: Action[];
  basedOnFactors?: string[];
};

type LogState = { id: string; status: ActionLogStatus };

const LOAD_ERROR = "Ruangmu belum bisa dimuat. Coba muat ulang halaman.";
const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";
const ACTION_ERROR = "Belum bisa diperbarui. Coba lagi sebentar lagi.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const CHIP_CLASS =
  "rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const SMALL_BUTTON_CLASS =
  "flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const STATUS_NOTE: Record<ActionLogStatus, string> = {
  STARTED: "Sedang berjalan.",
  COMPLETED: "Sudah kamu selesaikan.",
  SKIPPED: "Kamu lewati kali ini.",
};

export default function RuangPage() {
  const router = useRouter();
  // null while loading; the filter drives which endpoint is read.
  const [actions, setActions] = useState<Action[] | null>(null);
  const [basedOnFactors, setBasedOnFactors] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  // actionId -> the log opened for it in this session.
  const [logs, setLogs] = useState<Record<string, LogState>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setActions(null);
      setError(null);

      const url = filter
        ? `/api/actions?type=${encodeURIComponent(filter)}`
        : "/api/actions/recommended";

      try {
        const response = await fetch(url);

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!response.ok) {
          if (active) setError(LOAD_ERROR);
          return;
        }

        const data = (await response.json()) as ActionListResponse;
        if (!active) return;

        setActions(data.items);
        setBasedOnFactors(data.basedOnFactors ?? []);
      } catch {
        if (active) setError(NETWORK_ERROR);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [filter, router]);

  async function startAction(actionId: string) {
    setError(null);
    setBusy(actionId);

    try {
      const response = await fetch("/api/action-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId }),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(ACTION_ERROR);
        return;
      }

      const log = (await response.json()) as { _id: string };
      setLogs((current) => ({
        ...current,
        [actionId]: { id: log._id, status: "STARTED" },
      }));
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(null);
    }
  }

  async function closeAction(
    actionId: string,
    status: Extract<ActionLogStatus, "COMPLETED" | "SKIPPED">,
  ) {
    const log = logs[actionId];
    if (!log) return;

    setError(null);
    setBusy(actionId);

    try {
      const response = await fetch(`/api/action-logs/${log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(ACTION_ERROR);
        return;
      }

      setLogs((current) => ({
        ...current,
        [actionId]: { ...log, status },
      }));
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <NavbarGlobal variant="app" />

      <main className="flex flex-1 justify-center px-6 py-12 sm:px-8 lg:py-16">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Ruang
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Hal-hal kecil yang bisa kamu coba, sesuai yang sedang kamu
              rasakan.
            </p>
          </div>

          {/* Filter: no type means the personalised list */}
          <div
            data-tour="ruang-filter"
            className="mb-5 flex flex-wrap justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setFilter(null)}
              aria-pressed={filter === null}
              className={`${CHIP_CLASS} ${
                filter === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border"
              }`}
            >
              Untuk kamu
            </button>

            {ACTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFilter(type.value)}
                aria-pressed={filter === type.value}
                className={`${CHIP_CLASS} ${
                  filter === type.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {error ? (
            <p role="alert" className={`mx-auto mb-5 max-w-2xl ${ALERT_CLASS}`}>
              {error}
            </p>
          ) : null}

          {filter === null && basedOnFactors.length > 0 ? (
            <p className={`mb-4 text-center ${HINT_CLASS}`}>
              Disarankan dari check-in terakhirmu:{" "}
              {basedOnFactors.map(factorLabel).join(", ")}.
            </p>
          ) : null}

          {actions === null ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Memuat ruangmu…
            </p>
          ) : actions.length === 0 ? (
            // The empty state and the list below both answer to `ruang-list`,
            // so the walk-through has the same thing to point at either way.
            <div
              data-tour="ruang-list"
              className="mx-auto max-w-md rounded-xl border border-border px-4 py-10 text-center"
            >
              <Image
                src="/maskot-pijar/Empty State.webp"
                alt=""
                width={280}
                height={280}
                className="mx-auto h-40 w-40 object-contain"
              />

              <p className="mt-4 text-sm font-medium">
                Belum ada yang bisa ditampilkan
              </p>

              <p className={`mt-2 ${HINT_CLASS}`}>
                {filter === null
                  ? "Coba check-in dulu supaya kami bisa menyarankan sesuatu."
                  : "Belum ada latihan untuk kategori ini."}
              </p>

              {filter === null ? (
                <Link
                  href="/check-in"
                  className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Mulai check-in
                </Link>
              ) : null}
            </div>
          ) : (
            <ul data-tour="ruang-list" className="grid gap-4 md:grid-cols-2">
              {actions.map((action) => {
                const log = logs[action._id];
                const isBusy = busy === action._id;

                return (
                  <li
                    key={action._id}
                    className="rounded-xl border border-border px-4 py-4"
                  >
                    <div className={`flex flex-wrap gap-2 ${HINT_CLASS}`}>
                      <span>{actionTypeLabel(action.type)}</span>

                      {action.durationMinutes !== null ? (
                        <span>· {action.durationMinutes} menit</span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm font-medium">{action.title}</p>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {action.description}
                    </p>

                    {!log ? (
                      <button
                        type="button"
                        onClick={() => startAction(action._id)}
                        disabled={isBusy}
                        className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? "Memulai…" : "Mulai"}
                      </button>
                    ) : log.status === "STARTED" ? (
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => closeAction(action._id, "SKIPPED")}
                          disabled={isBusy}
                          className={SMALL_BUTTON_CLASS}
                        >
                          Lewati
                        </button>

                        <button
                          type="button"
                          onClick={() => closeAction(action._id, "COMPLETED")}
                          disabled={isBusy}
                          className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? "Menyimpan…" : "Selesai"}
                        </button>
                      </div>
                    ) : (
                      <p className={`mt-4 ${HINT_CLASS}`}>
                        {STATUS_NOTE[log.status]}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Yang sudah kamu lakukan tercatat di{" "}
            <Link
              href="/jejak"
              className="font-medium text-primary hover:underline"
            >
              Jejak
            </Link>
          </p>
        </div>
      </main>

      <OnboardingTour />
    </>
  );
}
