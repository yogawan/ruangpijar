// app/api/actions/recommended/route.ts
// Recommends actions whose relatedFactors intersect with the factors the
// user has logged most often in their recent check-ins, topped up with
// generic active actions if there aren't enough factor-matched ones.
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { ActionModel } from "@/models/Action";
import { CheckInModel } from "@/models/CheckIn";

const RECENT_CHECK_INS = 5;
const RECOMMENDATION_LIMIT = 6;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    await connectDB();

    const recentCheckIns = await CheckInModel.find({ userId })
      .sort({ checkedInAt: -1 })
      .limit(RECENT_CHECK_INS)
      .select("factors")
      .lean();

    const factorCounts = new Map<string, number>();
    for (const checkIn of recentCheckIns) {
      for (const factor of checkIn.factors ?? []) {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
      }
    }

    const topFactors = [...factorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([factor]) => factor);

    let items = topFactors.length
      ? await ActionModel.find({
          isActive: true,
          relatedFactors: { $in: topFactors },
        })
          .limit(RECOMMENDATION_LIMIT)
          .lean()
      : [];

    if (items.length < RECOMMENDATION_LIMIT) {
      const excludeIds = items.map((item) => item._id);
      const fallback = await ActionModel.find({
        isActive: true,
        _id: { $nin: excludeIds },
      })
        .sort({ createdAt: -1 })
        .limit(RECOMMENDATION_LIMIT - items.length)
        .lean();
      items = [...items, ...fallback];
    }

    return Response.json({ items, basedOnFactors: topFactors });
  } catch (error) {
    return handleApiError(error);
  }
}
