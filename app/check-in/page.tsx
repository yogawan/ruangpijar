// @app/check-in/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckInForm,
  type CheckInFormValues,
} from "@/components/check-in-form";
import NavbarGlobal from "@/components/NavbarGlobal";
import StreakPopup from "@/components/StreakPopup";

const ERROR_BY_STATUS: Record<number, string> = {
  400: "Ada isian yang belum sesuai. Coba periksa lagi.",
};

const ALERT_CLASS =
  "mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

type CheckInResponse = {
  streak: { current: number; increased: boolean } | null;
};

export default function CheckInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Non-null only when the streak actually grew, so the pop-up (and the
  // redirect it defers) is skipped for an ordinary second check-in.
  const [celebrateStreak, setCelebrateStreak] = useState<number | null>(null);

  function goToJejak() {
    router.push("/jejak");
    router.refresh();
  }

  async function handleSubmit(values: CheckInFormValues) {
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // checkedInAt is left out; the schema defaults it to now.
        body: JSON.stringify(values),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(
          ERROR_BY_STATUS[response.status] ??
            "Check-in belum tersimpan. Coba lagi sebentar lagi.",
        );
        setPending(false);
        return;
      }

      const data = (await response.json()) as CheckInResponse;

      if (data.streak?.increased) {
        setPending(false);
        setCelebrateStreak(data.streak.current);
        return;
      }

      goToJejak();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksimu.");
      setPending(false);
    }
  }

  return (
    <>
      <NavbarGlobal variant="app" />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Check-in hari ini
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Tidak ada jawaban yang salah. Isi seadanya saja.
            </p>
          </div>

          {error ? (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          ) : null}

          <CheckInForm
            pending={pending}
            submitLabel="Simpan check-in"
            pendingLabel="Menyimpan…"
            onSubmit={handleSubmit}
          />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ingin melihat yang sudah lewat?{" "}
            <Link
              href="/jejak"
              className="font-medium text-primary hover:underline"
            >
              Jejak
            </Link>
          </p>
        </div>
      </main>

      <StreakPopup
        streak={celebrateStreak}
        onClose={() => {
          setCelebrateStreak(null);
          goToJejak();
        }}
      />
    </>
  );
}
