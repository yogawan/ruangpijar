// app/api/action-logs/route.ts
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { ActionModel } from "@/models/Action";
import { ActionLogModel } from "@/models/ActionLog";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.actionId) {
    return jsonError("actionId is required", 400);
  }

  try {
    await connectDB();

    const actionExists = await ActionModel.exists({ _id: body.actionId });
    if (!actionExists) return jsonError("Action not found", 404);

    const actionLog = await ActionLogModel.create({
      userId,
      actionId: body.actionId,
      status: "STARTED",
    });

    return Response.json(actionLog, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
