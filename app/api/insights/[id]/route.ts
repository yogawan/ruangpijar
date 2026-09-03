// app/api/insights/[id]/route.ts
// PATCH here is a "mark as read" action: send { isRead: false } to unmark,
// otherwise it defaults to true (including when called with no body).
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { InsightModel } from "@/models/Insight";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const isRead = typeof body?.isRead === "boolean" ? body.isRead : true;

  try {
    await connectDB();
    const insight = await InsightModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead },
      { new: true, runValidators: true },
    ).lean();
    if (!insight) return jsonError("Insight not found", 404);

    return Response.json(insight);
  } catch (error) {
    return handleApiError(error);
  }
}
