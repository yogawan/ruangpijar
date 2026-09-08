// lib/check-in-labels.ts
// Shared by the check-in form and the jejak history, so the enums in
// models/CheckIn.ts only have to be relabelled in one place.

// Emoji and labels follow the check-in component spec in the README; the
// values are the 1-5 mood scale the model validates.
//
// `image` is the illustrated face, now used everywhere a mood is shown to the
// user: the check-in picker, the calendar cell and the day modal on /jejak.
// `emoji` is kept as the compact written form for anywhere a mood has to sit
// inside running text or an aria-label.
//
// These point at `public/moods/*.webp`, cut out from the source renders in
// `public/*.webp`. The originals are drawn on an opaque cream backdrop, which
// showed as a pale square once a card tints on select; the cut-outs are
// transparent and scaled so all five faces read at the same size in a row.
//
// The faces are plum on transparency, so they need a light surface behind
// them — see the disc the calendar cell puts under one, since that cell is
// itself filled with almost exactly the same plum.
export const MOODS = [
  { value: 1, emoji: "😣", label: "Berat", image: "/moods/berat.webp" },
  { value: 2, emoji: "😞", label: "Rendah", image: "/moods/rendah.webp" },
  { value: 3, emoji: "😐", label: "Biasa", image: "/moods/biasa.webp" },
  { value: 4, emoji: "🙂", label: "Baik", image: "/moods/baik.webp" },
  {
    value: 5,
    emoji: "😄",
    label: "Sangat baik",
    image: "/moods/sangat-baik.webp",
  },
] as const;

export const FACTORS = [
  { value: "ACADEMIC", label: "Akademik" },
  { value: "WORK", label: "Pekerjaan" },
  { value: "SOCIAL", label: "Sosial" },
  { value: "FAMILY", label: "Keluarga" },
  { value: "FINANCIAL", label: "Keuangan" },
  { value: "SLEEP", label: "Tidur" },
  { value: "RELATIONSHIP", label: "Relasi" },
  { value: "SELF", label: "Diri sendiri" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export type CheckIn = {
  _id: string;
  mood: number;
  energy: number;
  stress: number;
  sleepHours: number | null;
  academicLoad: number | null;
  socialLoad: number | null;
  factors: string[];
  reflection: string | null;
  checkedInAt: string;
};

export function moodFor(value: number) {
  return MOODS.find((mood) => mood.value === value);
}

// Only what was actually recorded — the optional loads stay out entirely
// when the user skipped them, rather than showing a placeholder.
export function statsFor(checkIn: CheckIn) {
  const stats = [
    { label: "Energi", value: `${checkIn.energy}/10` },
    { label: "Stres", value: `${checkIn.stress}/10` },
  ];

  if (checkIn.sleepHours !== null) {
    stats.push({ label: "Tidur", value: `${checkIn.sleepHours} jam` });
  }
  if (checkIn.academicLoad !== null) {
    stats.push({ label: "Akademik", value: `${checkIn.academicLoad}/10` });
  }
  if (checkIn.socialLoad !== null) {
    stats.push({ label: "Sosial", value: `${checkIn.socialLoad}/10` });
  }

  return stats;
}

// Falls back to the raw value so a factor added to the model shows up as
// something rather than disappearing from a past check-in.
export function factorLabel(value: string) {
  return FACTORS.find((factor) => factor.value === value)?.label ?? value;
}
