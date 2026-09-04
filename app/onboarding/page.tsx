// @/app/onboarding/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

type Personalization = {
  focusAreas: string[];
  checkInFrequency: string;
  preferredCheckInTime: string | null;
};

// Values mirror the enums in models/Personalization.ts; the API rejects
// anything outside them.
const FOCUS_AREAS = [
  { value: "MOOD", label: "Suasana hati" },
  { value: "STRESS", label: "Stres" },
  { value: "ENERGY", label: "Energi" },
  { value: "SLEEP", label: "Tidur" },
  { value: "ACADEMIC", label: "Akademik" },
  { value: "SOCIAL", label: "Sosial" },
  { value: "RELATIONSHIP", label: "Relasi" },
  { value: "SELF", label: "Diri sendiri" },
] as const;

const CHECK_IN_FREQUENCIES = [
  { value: "DAILY", label: "Setiap hari" },
  { value: "FEW_TIMES_A_WEEK", label: "Beberapa kali seminggu" },
] as const;

const ERROR_BY_STATUS: Record<number, string> = {
  400: "Ada pilihan yang belum sesuai. Coba periksa lagi.",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const CHOICE_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10";

const ALERT_CLASS =
  "mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300";

export default function OnboardingPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Personalization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // GET upserts, so a first-time user still gets a defaulted document back
  // and the form below always has something to prefill from.
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/personalization");

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!response.ok) {
          if (active) {
            setError(
              "Preferensimu belum bisa dimuat. Coba muat ulang halaman.",
            );
          }
          return;
        }

        const data = (await response.json()) as Personalization;
        if (active) setSettings(data);
      } catch {
        if (active) {
          setError("Tidak bisa terhubung ke server. Periksa koneksimu.");
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const preferredCheckInTime = String(
      formData.get("preferredCheckInTime") ?? "",
    );

    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/personalization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusAreas: formData.getAll("focusAreas"),
          checkInFrequency: formData.get("checkInFrequency"),
          // The field is nullable — an empty time input means "no preference"
          // rather than an empty string.
          preferredCheckInTime: preferredCheckInTime || null,
          onboardingCompleted: true,
        }),
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok) {
        setError(
          ERROR_BY_STATUS[response.status] ??
            "Preferensimu belum tersimpan. Coba lagi sebentar lagi.",
        );
        setPending(false);
        return;
      }

      router.push("/check-in");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksimu.");
      setPending(false);
    }
  }

  if (!settings) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {error ? (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Menyiapkan ruangmu…</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            RuangPijar
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Atur ruangmu
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Beberapa pilihan singkat supaya kami tahu cara menemanimu.
          </p>
        </div>

        {error ? (
          <p role="alert" className={ALERT_CLASS}>
            {error}
          </p>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Apa yang ingin kamu perhatikan?
            </legend>

            <p className="text-xs text-muted-foreground">
              Pilih yang paling terasa. Bisa lebih dari satu, bisa juga
              dilewati.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {FOCUS_AREAS.map((area) => (
                <label key={area.value} className={CHOICE_CLASS}>
                  <input
                    type="checkbox"
                    name="focusAreas"
                    value={area.value}
                    defaultChecked={settings.focusAreas.includes(area.value)}
                    className="size-4 accent-primary"
                  />
                  {area.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Seberapa sering ingin check-in?
            </legend>

            <div className="space-y-2 pt-1">
              {CHECK_IN_FREQUENCIES.map((frequency) => (
                <label key={frequency.value} className={CHOICE_CLASS}>
                  <input
                    type="radio"
                    name="checkInFrequency"
                    value={frequency.value}
                    defaultChecked={
                      settings.checkInFrequency === frequency.value
                    }
                    required
                    className="size-4 accent-primary"
                  />
                  {frequency.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor="preferredCheckInTime"
              className="text-sm font-medium"
            >
              Waktu yang paling pas
            </label>

            <input
              id="preferredCheckInTime"
              name="preferredCheckInTime"
              type="time"
              defaultValue={settings.preferredCheckInTime ?? ""}
              className={FIELD_CLASS}
            />

            <p className="text-xs text-muted-foreground">
              Boleh dikosongkan kalau belum yakin.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan…" : "Selesai"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Semua ini bisa kamu ubah kapan saja lewat{" "}
          <Link
            href="/profile"
            className="font-medium text-primary hover:underline"
          >
            Profil
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
