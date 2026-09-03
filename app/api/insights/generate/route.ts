// app/api/insights/generate/route.ts

import { handleApiError, jsonError } from "@/lib/http";
import { generateInsightsForUser } from "@/lib/insight-generator";
import { getCurrentUserId } from "@/lib/session";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const insights = await generateInsightsForUser(userId);

    return Response.json(
      {
        insights,
        message:
          insights.length > 0
            ? `Berhasil membuat ${insights.length} insight baru.`
            : "Belum cukup data untuk membuat insight baru.",
      },
      { status: insights.length > 0 ? 201 : 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
