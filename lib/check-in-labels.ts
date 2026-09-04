// lib/check-in-labels.ts
// Shared by the check-in form and the jejak history, so the enums in
// models/CheckIn.ts only have to be relabelled in one place.

// Emoji and labels follow the check-in component spec in the README; the
// values are the 1-5 mood scale the model validates.
export const MOODS = [
  { value: 1, emoji: "😣", label: "Berat" },
  { value: 2, emoji: "😞", label: "Rendah" },
  { value: 3, emoji: "😐", label: "Biasa" },
  { value: 4, emoji: "🙂", label: "Baik" },
  { value: 5, emoji: "😄", label: "Sangat baik" },
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
