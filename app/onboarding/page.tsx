// @/app/onboarding/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import NavbarGlobal from "@/components/NavbarGlobal";
import {
  CHECK_IN_FREQUENCIES,
  editablePersonalization,
  FOCUS_AREAS,
  type Personalization,
} from "@/lib/personalization-labels";

// One step per personalization field. Nothing is submitted until the last
// one, so the whole thing stays a single PATCH.
const STEPS = [
  "focusAreas",
  "checkInFrequency",
  "preferredCheckInTime",
] as const;
const LAST_STEP = STEPS.length - 1;

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
  // Answers live here for the whole walk-through: a step that scrolls out of
  // view is unmounted, so its inputs cannot hold the value themselves.
  const [form, setForm] = useState<Personalization | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // GET upserts, so a first-time user still gets a defaulted document back
  // and every step always has something to prefill from.
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

        // Keep only what the walk-through edits — the last step submits this
        // object wholesale.
        const data = (await response.json()) as Personalization;
        if (active) setForm(editablePersonalization(data));
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

  function toggleFocusArea(value: string) {
    setForm((current) =>
      current === null
        ? current
        : {
            ...current,
            focusAreas: current.focusAreas.includes(value)
              ? current.focusAreas.filter((area) => area !== value)
              : [...current.focusAreas, value],
          },
    );
  }

  function goBack() {
    setError(null);
    setStep((current) => current - 1);
  }

  // Submitting advances until the last step, so Enter moves forward too.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < LAST_STEP) {
      setStep((current) => current + 1);
      return;
    }

    if (!form) return;

    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/personalization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, onboardingCompleted: true }),
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

  if (!form) {
    return (
      <>
        <NavbarGlobal variant="app" />

        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            {error ? (
              <p role="alert" className={ALERT_CLASS}>
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Menyiapkan ruangmu…
              </p>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavbarGlobal variant="app" />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Atur ruangmu</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Beberapa pilihan singkat supaya kami tahu cara menemanimu.
            </p>
          </div>

          {/* Progress. The bar repeats what the counter already says, so it
              is decorative — the count is what gets announced. */}
          <div className="mb-6">
            <p
              aria-live="polite"
              className="mb-3 text-xs text-muted-foreground"
            >
              Langkah {step + 1} dari {STEPS.length}
            </p>

            <div aria-hidden="true" className="flex gap-2">
              {STEPS.map((name, index) => (
                <span
                  key={name}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= step ? "bg-primary" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className={ALERT_CLASS}>
              {error}
            </p>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 0 ? (
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
                        checked={form.focusAreas.includes(area.value)}
                        onChange={() => toggleFocusArea(area.value)}
                        className="size-4 accent-primary"
                      />
                      {area.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Seberapa sering ingin check-in?
                </legend>

                <p className="text-xs text-muted-foreground">
                  Tidak mengikat — ini hanya jadi patokan pengingat.
                </p>

                <div className="space-y-2 pt-1">
                  {CHECK_IN_FREQUENCIES.map((frequency) => (
                    <label key={frequency.value} className={CHOICE_CLASS}>
                      <input
                        type="radio"
                        name="checkInFrequency"
                        value={frequency.value}
                        checked={form.checkInFrequency === frequency.value}
                        onChange={() =>
                          setForm({
                            ...form,
                            checkInFrequency: frequency.value,
                          })
                        }
                        className="size-4 accent-primary"
                      />
                      {frequency.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <div className="space-y-2">
                <label
                  htmlFor="preferredCheckInTime"
                  className="text-sm font-medium"
                >
                  Waktu yang paling pas
                </label>

                <p className="text-xs text-muted-foreground">
                  Boleh dikosongkan kalau belum yakin.
                </p>

                <input
                  id="preferredCheckInTime"
                  name="preferredCheckInTime"
                  type="time"
                  value={form.preferredCheckInTime ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      // The field is nullable — an emptied input means "no
                      // preference" rather than an empty string.
                      preferredCheckInTime: event.target.value || null,
                    })
                  }
                  className={FIELD_CLASS}
                />
              </div>
            ) : null}

            <div className="flex gap-3 pt-1">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={pending}
                  className="flex-1 rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Kembali
                </button>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {step < LAST_STEP
                  ? "Lanjut"
                  : pending
                    ? "Menyimpan…"
                    : "Selesai"}
              </button>
            </div>
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
    </>
  );
}
