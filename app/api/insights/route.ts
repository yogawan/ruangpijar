// app/api/insights/route.ts
import type { NextRequest } from "next/server";
import { handleApiError, jsonError, parsePagination } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { InsightModel } from "@/models/Insight";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);

  const filter: Record<string, unknown> = { userId };
  const isRead = searchParams.get("isRead");
  if (isRead === "true") filter.isRead = true;
  if (isRead === "false") filter.isRead = false;

  const type = searchParams.get("type");
  if (type) filter.type = type;

  try {
    await connectDB();
    const [items, total] = await Promise.all([
      InsightModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InsightModel.countDocuments(filter),
    ]);

    return Response.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
