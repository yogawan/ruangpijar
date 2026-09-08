// @/app/check-in/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import {
  type CheckIn,
  factorLabel,
  moodFor,
  statsFor,
} from "@/lib/check-in-labels";

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

const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

const OUTLINE_BUTTON_CLASS =
  "flex-1 rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

// "missing" covers both a 404 and the 400 a malformed id produces — to someone
// following a stale link those read the same.
type Status = "loading" | "ready" | "missing" | "error";

export default function CheckInDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/check-ins/${id}`);

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (response.status === 404 || response.status === 400) {
          if (active) setStatus("missing");
          return;
        }

        if (!response.ok) {
          if (active) {
            setError(
              "Check-in ini belum bisa dimuat. Coba muat ulang halaman.",
            );
            setStatus("error");
          }
          return;
        }

        const data = (await response.json()) as CheckIn;
        if (!active) return;

        setCheckIn(data);
        setStatus("ready");
      } catch {
        if (active) {
          setError(NETWORK_ERROR);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id, router]);

  async function handleDelete() {
    setError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/check-ins/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError("Check-in ini belum bisa dihapus. Coba lagi sebentar lagi.");
        setDeleting(false);
        setConfirmingDelete(false);
        return;
      }

      router.push("/jejak");
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <LoadingState label="Memuat check-in…" />
      </main>
    );
  }

  if (!checkIn) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {status === "missing" ? (
            <>
              <p className="text-sm font-medium">Check-in tidak ditemukan</p>

              <p className={`mt-2 ${HINT_CLASS}`}>
                Mungkin sudah dihapus, atau tautannya sudah tidak berlaku.
              </p>
            </>
          ) : (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          )}

          <Link
            href="/jejak"
            className="mt-5 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Kembali ke Jejak
          </Link>
        </div>
      </main>
    );
  }

  const mood = moodFor(checkIn.mood);
  const checkedInAt = new Date(checkIn.checkedInAt);

  return (
    <main className="flex min-h-screen justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/ruang_pijar_logo.webp"
              alt="RuangPijar"
              width={478}
              height={476}
              className="h-20 w-20 object-contain"
            />
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Satu check-in
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {DATE_FORMAT.format(checkedInAt)} ·{" "}
            {TIME_FORMAT.format(checkedInAt)}
          </p>
        </div>

        {error ? (
          <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-border px-4 py-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <span aria-hidden="true" className="text-4xl">
              {mood?.emoji ?? "•"}
            </span>

            <p className="text-sm font-medium">
              {mood?.label ?? `Mood ${checkIn.mood}`}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {statsFor(checkIn).map((stat) => (
              <div key={stat.label}>
                <dt className={HINT_CLASS}>{stat.label}</dt>
                <dd className="text-sm font-medium">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {checkIn.factors.length > 0 ? (
            <div className="mt-6 space-y-2">
              <p className={HINT_CLASS}>Yang terasa memengaruhi</p>

              <ul className="flex flex-wrap gap-2">
                {checkIn.factors.map((factor) => (
                  <li
                    key={factor}
                    className="rounded-full border border-border px-3 py-1 text-xs"
                  >
                    {factorLabel(factor)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {checkIn.reflection ? (
            <div className="mt-6 space-y-2">
              <p className={HINT_CLASS}>Catatanmu</p>

              <p className="whitespace-pre-line text-sm leading-relaxed">
                {checkIn.reflection}
              </p>
            </div>
          ) : null}
        </div>

        {confirmingDelete ? (
          <div className="mt-4 space-y-3">
            <p className="text-center text-sm">
              Hapus check-in ini? Catatannya tidak bisa dikembalikan.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className={OUTLINE_BUTTON_CLASS}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-medium text-red-700 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
              >
                {deleting ? "Menghapus…" : "Ya, hapus"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/check-in/${id}/edit`}
                className={`${OUTLINE_BUTTON_CLASS} text-center`}
              >
                Ubah
              </Link>

              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={OUTLINE_BUTTON_CLASS}
              >
                Hapus
              </button>
            </div>

            <Link
              href="/jejak"
              className="mt-3 block text-center text-sm text-muted-foreground hover:underline"
            >
              Kembali ke Jejak
            </Link>
          </>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Ingin menulis yang baru?{" "}
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
