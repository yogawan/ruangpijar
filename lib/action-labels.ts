// lib/action-labels.ts
// Mirrors the type enum in models/Action.ts.

export type Action = {
  _id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number | null;
  relatedFactors: string[];
};

export type ActionLogStatus = "STARTED" | "COMPLETED" | "SKIPPED";

export const ACTION_TYPES = [
  { value: "REFLECTION", label: "Refleksi" },
  { value: "BREATHING", label: "Napas" },
  { value: "RECOVERY", label: "Pemulihan" },
  { value: "PLANNING", label: "Perencanaan" },
  { value: "EDUCATION", label: "Belajar" },
  { value: "SUPPORT", label: "Dukungan" },
] as const;

// Falls back to the raw value so a type added to the model still renders.
export function actionTypeLabel(value: string) {
  return ACTION_TYPES.find((type) => type.value === value)?.label ?? value;
}
