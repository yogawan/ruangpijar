// app/api/me/route.ts
import { handleApiError, jsonError, pickFields } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { UserModel } from "@/models/User";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    await connectDB();
    const user = await UserModel.findById(userId).lean();
    if (!user) return jsonError("User not found", 404);

    return Response.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body", 400);
  }

  const updates = pickFields(body, [
    "name",
    "avatarUrl",
    "onboardingCompleted",
  ]);

  try {
    await connectDB();
    const user = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!user) return jsonError("User not found", 404);

    return Response.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
