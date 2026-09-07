// app/api/check-ins/route.ts
import type { NextRequest } from "next/server";
import { handleApiError, jsonError, parsePagination } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/session";
import { nextStreakState } from "@/lib/streak";
import { CheckInModel } from "@/models/CheckIn";
import { UserModel } from "@/models/User";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);

  const filter: Record<string, unknown> = { userId };
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    const checkedInAt: Record<string, Date> = {};
    if (from) checkedInAt.$gte = new Date(from);
    if (to) checkedInAt.$lte = new Date(to);
    filter.checkedInAt = checkedInAt;
  }

  try {
    await connectDB();
    const [items, total] = await Promise.all([
      CheckInModel.find(filter)
        .sort({ checkedInAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CheckInModel.countDocuments(filter),
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

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return jsonError("Invalid JSON body", 400);
  }

  try {
    await connectDB();
    const checkIn = await CheckInModel.create({
      userId,
      mood: body.mood,
      energy: body.energy,
      stress: body.stress,
      sleepHours: body.sleepHours,
      academicLoad: body.academicLoad,
      socialLoad: body.socialLoad,
      factors: body.factors,
      reflection: body.reflection,
      checkedInAt: body.checkedInAt,
    });

    // Best-effort: the check-in itself already succeeded above, so a streak
    // bookkeeping failure here shouldn't turn into an error response for it.
    try {
      const user = await UserModel.findById(userId);
      if (user) {
        const { currentStreak, lastCheckInAt } = nextStreakState(
          {
            currentStreak: user.currentStreak,
            lastCheckInAt: user.lastCheckInAt,
          },
          checkIn.checkedInAt,
        );
        user.currentStreak = currentStreak;
        user.lastCheckInAt = lastCheckInAt;
        user.lastReminderSentAt = null;
        await user.save();
      }
    } catch (error) {
      console.error("Failed to update check-in streak", error);
    }

    return Response.json(checkIn, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
