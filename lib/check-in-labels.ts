// lib/check-in-labels.ts
// Shared by the check-in form and the jejak history, so the enums in
// models/CheckIn.ts only have to be relabelled in one place.

// Emoji and labels follow the check-in component spec in the README; the
// values are the 1-5 mood scale the model validates.
//
// `image` is the illustrated face used by the check-in picker, where the mood
// is the whole question and deserves the room. The emoji stays for the places
// a mood is only a detail in a denser layout — a calendar cell, a card in a
// list — where an illustration would be unreadable at that size.
//
// These point at `public/moods/*.png`, cut out from the source renders in
// `public/*.jpeg`. The originals are drawn on an opaque cream backdrop, which
// showed as a pale square once a card tints on select; the cut-outs are
// transparent and scaled so all five faces read at the same size in a row.
export const MOODS = [
  { value: 1, emoji: "😣", label: "Berat", image: "/moods/berat.png" },
  { value: 2, emoji: "😞", label: "Rendah", image: "/moods/rendah.png" },
  { value: 3, emoji: "😐", label: "Biasa", image: "/moods/biasa.png" },
  { value: 4, emoji: "🙂", label: "Baik", image: "/moods/baik.png" },
  {
    value: 5,
    emoji: "😄",
    label: "Sangat baik",
    image: "/moods/sangat-baik.png",
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
