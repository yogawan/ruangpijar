// app/api/check-ins/[id]/route.ts
import { handleApiError, jsonError, pickFields } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { CheckInModel } from "@/models/CheckIn";

type RouteParams = { params: Promise<{ id: string }> };

const UPDATABLE_FIELDS = [
  "mood",
  "energy",
  "stress",
  "sleepHours",
  "academicLoad",
  "socialLoad",
  "factors",
  "reflection",
  "checkedInAt",
] as const;

export async function GET(_request: Request, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;

  try {
    await connectDB();
    const checkIn = await CheckInModel.findOne({ _id: id, userId }).lean();
    if (!checkIn) return jsonError("Check-in not found", 404);

    return Response.json(checkIn);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body", 400);
  }

  const updates = pickFields(body, UPDATABLE_FIELDS);

  try {
    await connectDB();
    const checkIn = await CheckInModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true },
    ).lean();
    if (!checkIn) return jsonError("Check-in not found", 404);

    return Response.json(checkIn);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;

  try {
    await connectDB();
    const checkIn = await CheckInModel.findOneAndDelete({
      _id: id,
      userId,
    }).lean();
    if (!checkIn) return jsonError("Check-in not found", 404);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
