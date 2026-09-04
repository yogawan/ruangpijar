// lib/personalization-labels.ts
// Shared by onboarding and the profile page, so the enums in
// models/Personalization.ts only have to be relabelled in one place.

export type Personalization = {
  focusAreas: string[];
  checkInFrequency: string;
  preferredCheckInTime: string | null;
};

export const FOCUS_AREAS = [
  { value: "MOOD", label: "Suasana hati" },
  { value: "STRESS", label: "Stres" },
  { value: "ENERGY", label: "Energi" },
  { value: "SLEEP", label: "Tidur" },
  { value: "ACADEMIC", label: "Akademik" },
  { value: "SOCIAL", label: "Sosial" },
  { value: "RELATIONSHIP", label: "Relasi" },
  { value: "SELF", label: "Diri sendiri" },
] as const;

export const CHECK_IN_FREQUENCIES = [
  { value: "DAILY", label: "Setiap hari" },
  { value: "FEW_TIMES_A_WEEK", label: "Beberapa kali seminggu" },
] as const;

// Keeps only the fields both pages edit. The API also returns _id, userId and
// timestamps, which must not be echoed back in a PATCH.
export function editablePersonalization(
  source: Personalization,
): Personalization {
  return {
    focusAreas: source.focusAreas,
    checkInFrequency: source.checkInFrequency,
    preferredCheckInTime: source.preferredCheckInTime,
  };
}
