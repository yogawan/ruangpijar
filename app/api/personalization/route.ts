// app/api/personalization/route.ts
// Personalization is a 1:1 settings resource per user (no separate create
// endpoint), so both GET and PATCH upsert: a user always gets a valid
// settings object back, defaulted from the schema on first access.
import { handleApiError, jsonError, pickFields } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { PersonalizationModel } from "@/models/Personalization";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    await connectDB();
    const personalization = await PersonalizationModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    return Response.json(personalization);
  } catch (error) {
    return handleApiError(error);
  }
}

const UPDATABLE_FIELDS = [
  "focusAreas",
  "checkInFrequency",
  "preferredCheckInTime",
  "onboardingCompleted",
] as const;

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body", 400);
  }

  const updates = pickFields(body, UPDATABLE_FIELDS);
  if (updates.onboardingCompleted === true) {
    updates.onboardingCompletedAt = new Date();
  } else if (updates.onboardingCompleted === false) {
    updates.onboardingCompletedAt = null;
  }

  try {
    await connectDB();
    const personalization = await PersonalizationModel.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return Response.json(personalization);
  } catch (error) {
    return handleApiError(error);
  }
}
