// @/app/check-in/[id]/edit/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckInForm,
  type CheckInFormValues,
} from "@/components/check-in-form";
import LoadingState from "@/components/LoadingState";
import type { CheckIn } from "@/lib/check-in-labels";

// "missing" covers both a 404 and the 400 a malformed id produces.
type Status = "loading" | "ready" | "missing" | "error";

const NETWORK_ERROR = "Tidak bisa terhubung ke server. Periksa koneksimu.";

const ERROR_BY_STATUS: Record<number, string> = {
  400: "Ada isian yang belum sesuai. Coba periksa lagi.",
};

const ALERT_CLASS =
  "rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

const HINT_CLASS = "text-xs text-muted-foreground";

export default function EditCheckInPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<CheckInFormValues | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/check-ins/${id}`, {
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (response.status === 404 || response.status === 400) {
          setStatus("missing");
          return;
        }

        if (!response.ok) {
          setError("Check-in ini belum bisa dimuat. Coba muat ulang halaman.");
          setStatus("error");
          return;
        }

        const data = (await response.json()) as CheckIn;

        // Only the editable fields; checkedInAt is deliberately left alone so
        // editing never moves an entry to a different day.
        setInitial({
          mood: data.mood,
          energy: data.energy,
          stress: data.stress,
          sleepHours: data.sleepHours,
          academicLoad: data.academicLoad,
          socialLoad: data.socialLoad,
          factors: data.factors,
          reflection: data.reflection,
        });
        setStatus("ready");
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(NETWORK_ERROR);
        setStatus("error");
      }
    }

    load();

    return () => controller.abort();
  }, [id, router]);

  async function handleSubmit(values: CheckInFormValues) {
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/check-ins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(
          ERROR_BY_STATUS[response.status] ??
            "Perubahanmu belum tersimpan. Coba lagi sebentar lagi.",
        );
        setPending(false);
        return;
      }

      router.push(`/check-in/${id}`);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
      setPending(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <LoadingState label="Memuat check-in…" />
      </main>
    );
  }

  if (!initial) {
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

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
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
            Ubah check-in
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Perbaiki yang terasa keliru. Tanggalnya tetap seperti semula.
          </p>
        </div>

        {error ? (
          <p role="alert" className={`mb-5 ${ALERT_CLASS}`}>
            {error}
          </p>
        ) : null}

        <CheckInForm
          initial={initial}
          pending={pending}
          submitLabel="Simpan perubahan"
          pendingLabel="Menyimpan…"
          onSubmit={handleSubmit}
        />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Batal dan{" "}
          <Link
            href={`/check-in/${id}`}
            className="font-medium text-primary hover:underline"
          >
            kembali
          </Link>
        </p>
      </div>
    </main>
  );
}
