// app/api/jejak/route.ts
// "Jejak" (trail) is a unified, chronological activity feed for the current
// user, merging check-ins, action logs, and insights into one timeline.
import type { NextRequest } from "next/server";
import { handleApiError, jsonError, parsePagination } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { ActionModel } from "@/models/Action";
import { ActionLogModel } from "@/models/ActionLog";
import { CheckInModel } from "@/models/CheckIn";
import { InsightModel } from "@/models/Insight";

const ALL_TYPES = ["CHECK_IN", "ACTION_LOG", "INSIGHT"] as const;

type JejakType = (typeof ALL_TYPES)[number];

type JejakEntry = {
  type: JejakType;
  id: string;
  occurredAt: Date;
  data: unknown;
};

/**
 * Optional `?types=ACTION_LOG,INSIGHT` narrows the feed to certain kinds.
 *
 * Omitting it keeps the original behaviour of returning all three, so
 * existing callers are unaffected. An unrecognised value falls back to all
 * three as well — answering an empty feed would read as "you have no
 * history" rather than "that filter was a typo".
 */
function parseTypes(searchParams: URLSearchParams): readonly JejakType[] {
  const raw = searchParams.get("types");
  if (!raw) return ALL_TYPES;

  const requested = raw.split(",").map((value) => value.trim().toUpperCase());
  const matched = ALL_TYPES.filter((type) => requested.includes(type));

  return matched.length > 0 ? matched : ALL_TYPES;
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);
  const fetchCount = skip + limit;

  const types = parseTypes(searchParams);
  const wants = (type: JejakType) => types.includes(type);

  try {
    await connectDB();

    const [checkIns, actionLogs, insights] = await Promise.all([
      wants("CHECK_IN")
        ? CheckInModel.find({ userId })
            .sort({ checkedInAt: -1 })
            .limit(fetchCount)
            .lean()
        : [],
      wants("ACTION_LOG")
        ? ActionLogModel.find({ userId })
            .sort({ startedAt: -1 })
            .limit(fetchCount)
            // The model is passed explicitly rather than looked up by name:
            // this route does not otherwise touch ActionModel, so in a fresh
            // server process the schema would be unregistered and populate
            // would throw MissingSchemaError.
            .populate({
              path: "actionId",
              select: "title type durationMinutes",
              model: ActionModel,
            })
            .lean()
        : [],
      wants("INSIGHT")
        ? InsightModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(fetchCount)
            .lean()
        : [],
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
