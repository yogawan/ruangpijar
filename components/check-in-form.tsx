// components/check-in-form.tsx
// Shared by /check-in (create) and /check-in/[id]/edit (update). Both send the
// same field set, to POST /api/check-ins and PATCH /api/check-ins/{id}.
"use client";

import { type FormEvent, useState } from "react";
import { FACTORS, MOODS } from "@/lib/check-in-labels";

export type CheckInFormValues = {
  mood: number;
  energy: number;
  stress: number;
  sleepHours: number | null;
  academicLoad: number | null;
  socialLoad: number | null;
  factors: string[];
  reflection: string | null;
};

/**
 * Answers for the whole walk-through.
 *
 * Every field is held here rather than read back from the DOM on submit: a
 * step that is not the current one is unmounted, so its inputs cannot keep
 * the value themselves.
 *
 * The three optional numbers stay as raw strings until submit. Storing them
 * as `number | null` would fight the user mid-typing — "6." is not a number
 * yet, and an emptied field has to stay empty rather than snapping to 0.
 */
type FormState = {
  mood: number | null;
  energy: number;
  stress: number;
  sleepHours: string;
  academicLoad: string;
  socialLoad: string;
  factors: string[];
  reflection: string;
};

// One entry per step; the walk-through submits only on the last.
const STEPS = ["mood", "levels", "load", "factors", "reflection"] as const;
const LAST_STEP = STEPS.length - 1;

const REFLECTION_MAX = 2000;
const DEFAULT_SCALE = 5;

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const CHOICE_CLASS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10";

// The mood radio is sr-only so the emoji reads as the control, which means
// the label has to carry the focus ring or keyboard users see nothing move.
const MOOD_CHOICE_CLASS =
  "flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 text-center transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40";

const QUESTION_CLASS = "text-sm font-medium";
const HINT_CLASS = "text-xs text-muted-foreground";

// Blank optional numbers are sent as null, not 0 — the fields are nullable
// and Number("") would otherwise coerce to a real answer.
function optionalNumber(value: string): number | null {
  const text = value.trim();
  if (text === "") return null;

  const parsed = Number(text);
  return Number.isNaN(parsed) ? null : parsed;
}

function toFormState(initial?: CheckInFormValues): FormState {
  return {
    mood: initial?.mood ?? null,
    energy: initial?.energy ?? DEFAULT_SCALE,
    stress: initial?.stress ?? DEFAULT_SCALE,
    // `?? ""` rather than `|| ""` so a recorded 0 survives as "0".
    sleepHours: initial?.sleepHours?.toString() ?? "",
    academicLoad: initial?.academicLoad?.toString() ?? "",
    socialLoad: initial?.socialLoad?.toString() ?? "",
    factors: initial?.factors ?? [],
    reflection: initial?.reflection ?? "",
  };
}

export function CheckInForm({
  initial,
  pending,
  submitLabel,
  pendingLabel,
  onSubmit,
}: {
  initial?: CheckInFormValues;
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: CheckInFormValues) => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [step, setStep] = useState(0);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleFactor(value: string) {
    setForm((current) => ({
      ...current,
      factors: current.factors.includes(value)
        ? current.factors.filter((factor) => factor !== value)
        : [...current.factors, value],
    }));
  }

  function goBack() {
    setStep((current) => current - 1);
  }

  // Submitting advances until the last step, so Enter moves forward too.
  // Going through the form element also means the browser runs the current
  // step's own constraints first — the mood radio is `required`, so step one
  // will not advance unanswered.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < LAST_STEP) {
      setStep((current) => current + 1);
      return;
    }

    onSubmit({
      mood: Number(form.mood),
      energy: form.energy,
      stress: form.stress,
      sleepHours: optionalNumber(form.sleepHours),
      academicLoad: optionalNumber(form.academicLoad),
      socialLoad: optionalNumber(form.socialLoad),
      factors: form.factors,
      reflection: form.reflection.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress. The bar repeats what the counter already says, so it is
          decorative — the count is what gets announced. */}
      <div>
        <p aria-live="polite" className="mb-3 text-xs text-muted-foreground">
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

      {step === 0 ? (
        <fieldset className="space-y-2">
          <legend className={QUESTION_CLASS}>
            Bagaimana perasaanmu hari ini?
          </legend>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {MOODS.map((mood) => (
              <label key={mood.value} className={MOOD_CHOICE_CLASS}>
                <input
                  type="radio"
                  name="mood"
                  value={mood.value}
                  checked={form.mood === mood.value}
                  onChange={() => update("mood", mood.value)}
                  required
                  className="sr-only"
                />
                <span aria-hidden="true" className="text-2xl">
                  {mood.emoji}
                </span>
                <span className="text-[11px] leading-tight">{mood.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 1 ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="energy" className={QUESTION_CLASS}>
                Seberapa penuh energimu?
              </label>

              <span className="text-sm font-medium text-primary">
                {form.energy}
              </span>
            </div>

            <input
              id="energy"
              name="energy"
              type="range"
              min={1}
              max={10}
              step={1}
              value={form.energy}
              onChange={(event) => update("energy", Number(event.target.value))}
              className="w-full accent-primary"
            />

            <div className={`flex justify-between ${HINT_CLASS}`}>
              <span>1 — kosong</span>
              <span>10 — penuh</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="stress" className={QUESTION_CLASS}>
                Seberapa berat stresmu?
              </label>

              <span className="text-sm font-medium text-primary">
                {form.stress}
              </span>
            </div>

            <input
              id="stress"
              name="stress"
              type="range"
              min={1}
              max={10}
              step={1}
              value={form.stress}
              onChange={(event) => update("stress", Number(event.target.value))}
              className="w-full accent-primary"
            />

            <div className={`flex justify-between ${HINT_CLASS}`}>
              <span>1 — ringan</span>
              <span>10 — berat</span>
            </div>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <div className="space-y-2">
            <label htmlFor="sleepHours" className={QUESTION_CLASS}>
              Berapa jam kamu tidur semalam?
            </label>

            <input
              id="sleepHours"
              name="sleepHours"
              type="number"
              min={0}
              max={24}
              step={0.5}
              inputMode="decimal"
              placeholder="Misalnya 6.5"
              value={form.sleepHours}
              onChange={(event) => update("sleepHours", event.target.value)}
              className={FIELD_CLASS}
            />

            <p className={HINT_CLASS}>Boleh dikosongkan.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="academicLoad" className={QUESTION_CLASS}>
                Beban akademik
              </label>

              <input
                id="academicLoad"
                name="academicLoad"
                type="number"
                min={1}
                max={10}
                step={1}
                inputMode="numeric"
                placeholder="1–10"
                value={form.academicLoad}
                onChange={(event) => update("academicLoad", event.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="socialLoad" className={QUESTION_CLASS}>
                Beban sosial
              </label>

              <input
                id="socialLoad"
                name="socialLoad"
                type="number"
                min={1}
                max={10}
                step={1}
                inputMode="numeric"
                placeholder="1–10"
                value={form.socialLoad}
                onChange={(event) => update("socialLoad", event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <fieldset className="space-y-2">
          <legend className={QUESTION_CLASS}>
            Ada yang terasa memengaruhi?
          </legend>

          <p className={HINT_CLASS}>
            Bisa lebih dari satu, bisa juga dilewati.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {FACTORS.map((factor) => (
              <label key={factor.value} className={CHOICE_CLASS}>
                <input
                  type="checkbox"
                  name="factors"
                  value={factor.value}
                  checked={form.factors.includes(factor.value)}
                  onChange={() => toggleFactor(factor.value)}
                  className="size-4 accent-primary"
                />
                {factor.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 4 ? (
        <div className="space-y-2">
          <label htmlFor="reflection" className={QUESTION_CLASS}>
            Mau cerita sedikit?
          </label>

          <textarea
            id="reflection"
            name="reflection"
            rows={4}
            maxLength={REFLECTION_MAX}
            placeholder="Tulis apa pun yang terasa. Ruang ini milikmu."
            value={form.reflection}
            onChange={(event) => update("reflection", event.target.value)}
            className={`${FIELD_CLASS} resize-y`}
          />

          <p className={HINT_CLASS}>
            Boleh dikosongkan. Maksimal {REFLECTION_MAX} karakter.
          </p>
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
          {step < LAST_STEP ? "Lanjut" : pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
