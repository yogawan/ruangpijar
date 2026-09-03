// app/api/action-logs/[id]/route.ts
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { ActionLogModel } from "@/models/ActionLog";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = ["COMPLETED", "SKIPPED"] as const;

export async function PATCH(request: Request, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!ALLOWED_STATUSES.includes(status)) {
    return jsonError(
      `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      400,
    );
  }

  try {
    await connectDB();
    const actionLog = await ActionLogModel.findOneAndUpdate(
      { _id: id, userId },
      { status, completedAt: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!actionLog) return jsonError("Action log not found", 404);

    return Response.json(actionLog);
  } catch (error) {
    return handleApiError(error);
  }
}
