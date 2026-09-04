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
function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim();
  if (text === "") return null;

  const parsed = Number(text);
  return Number.isNaN(parsed) ? null : parsed;
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
  // Only the sliders are controlled, so their current value can be read out
  // beside the question. Everything else is read from FormData on submit.
  const [energy, setEnergy] = useState(initial?.energy ?? DEFAULT_SCALE);
  const [stress, setStress] = useState(initial?.stress ?? DEFAULT_SCALE);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const reflection = String(formData.get("reflection") ?? "").trim();

    onSubmit({
      mood: Number(formData.get("mood")),
      energy,
      stress,
      sleepHours: optionalNumber(formData.get("sleepHours")),
      academicLoad: optionalNumber(formData.get("academicLoad")),
      socialLoad: optionalNumber(formData.get("socialLoad")),
      factors: formData.getAll("factors").map(String),
      reflection: reflection || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                defaultChecked={initial?.mood === mood.value}
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="energy" className={QUESTION_CLASS}>
            Seberapa penuh energimu?
          </label>

          <span className="text-sm font-medium text-primary">{energy}</span>
        </div>

        <input
          id="energy"
          name="energy"
          type="range"
          min={1}
          max={10}
          step={1}
          value={energy}
          onChange={(event) => setEnergy(Number(event.target.value))}
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

          <span className="text-sm font-medium text-primary">{stress}</span>
        </div>

        <input
          id="stress"
          name="stress"
          type="range"
          min={1}
          max={10}
          step={1}
          value={stress}
          onChange={(event) => setStress(Number(event.target.value))}
          className="w-full accent-primary"
        />

        <div className={`flex justify-between ${HINT_CLASS}`}>
          <span>1 — ringan</span>
          <span>10 — berat</span>
        </div>
      </div>

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
          defaultValue={initial?.sleepHours ?? ""}
          className={FIELD_CLASS}
        />
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
            defaultValue={initial?.academicLoad ?? ""}
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
            defaultValue={initial?.socialLoad ?? ""}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className={QUESTION_CLASS}>Ada yang terasa memengaruhi?</legend>

        <p className={HINT_CLASS}>Bisa lebih dari satu, bisa juga dilewati.</p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {FACTORS.map((factor) => (
            <label key={factor.value} className={CHOICE_CLASS}>
              <input
                type="checkbox"
                name="factors"
                value={factor.value}
                defaultChecked={initial?.factors.includes(factor.value)}
                className="size-4 accent-primary"
              />
              {factor.label}
            </label>
          ))}
        </div>
      </fieldset>

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
          defaultValue={initial?.reflection ?? ""}
          className={`${FIELD_CLASS} resize-y`}
        />

        <p className={HINT_CLASS}>
          Boleh dikosongkan. Maksimal {REFLECTION_MAX} karakter.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
