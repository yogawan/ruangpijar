// app/api/jejak/route.ts
// "Jejak" (trail) is a unified, chronological activity feed for the current
// user, merging check-ins, action logs, and insights into one timeline.
import type { NextRequest } from "next/server";
import { handleApiError, jsonError, parsePagination } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { ActionLogModel } from "@/models/ActionLog";
import { CheckInModel } from "@/models/CheckIn";
import { InsightModel } from "@/models/Insight";

type JejakEntry = {
  type: "CHECK_IN" | "ACTION_LOG" | "INSIGHT";
  id: string;
  occurredAt: Date;
  data: unknown;
};

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { page, limit, skip } = parsePagination(request.nextUrl.searchParams);
  const fetchCount = skip + limit;

  try {
    await connectDB();

    const [checkIns, actionLogs, insights] = await Promise.all([
      CheckInModel.find({ userId })
        .sort({ checkedInAt: -1 })
        .limit(fetchCount)
        .lean(),
      ActionLogModel.find({ userId })
        .sort({ startedAt: -1 })
        .limit(fetchCount)
        .populate("actionId", "title type durationMinutes")
        .lean(),
      InsightModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(fetchCount)
        .lean(),
    ]);

    const entries: JejakEntry[] = [
      ...checkIns.map((doc) => ({
        type: "CHECK_IN" as const,
        id: doc._id.toString(),
        occurredAt: new Date(doc.checkedInAt),
        data: doc,
      })),
      ...actionLogs.map((doc) => ({
        type: "ACTION_LOG" as const,
        id: doc._id.toString(),
        occurredAt: new Date(doc.startedAt ?? doc.createdAt),
        data: doc,
      })),
      ...insights.map((doc) => ({
        type: "INSIGHT" as const,
        id: doc._id.toString(),
        occurredAt: new Date(doc.createdAt),
        data: doc,
      })),
    ];

    entries.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const items = entries.slice(skip, skip + limit);

    return Response.json({ items, page, limit });
  } catch (error) {
    return handleApiError(error);
  }
}
