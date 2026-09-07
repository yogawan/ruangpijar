// app/api/cron/streak-check/route.ts
//
// Swept once a day by an external scheduler (see vercel.json) rather than a
// signed-in user, so it checks a shared secret instead of the session
// cookie every other route relies on. Vercel Cron sends this back
// automatically as `Authorization: Bearer <CRON_SECRET>` when that env var
// is set on the project.
import { sendMail } from "@/lib/email";
import { handleApiError, jsonError } from "@/lib/http";
import { connectDB } from "@/lib/mongodb";
import { daysSince, STREAK_GRACE_DAYS } from "@/lib/streak";
import { UserModel } from "@/models/User";

function reminderEmailHtml(name: string, streak: number, daysMissed: number) {
  const daysLeft = STREAK_GRACE_DAYS - daysMissed;

  return `
    <p>Hai ${name},</p>
    <p>Sudah ${daysMissed} hari kamu belum check-in di RuangPijar. Streak kamu saat ini
    <strong>${streak} hari</strong> akan hangus dalam ${daysLeft} hari lagi kalau belum check-in.</p>
    <p>Yuk luangkan waktu sebentar untuk check-in hari ini.</p>
  `;
}

function streakResetEmailHtml(name: string, lostStreak: number) {
  return `
    <p>Hai ${name},</p>
    <p>Streak ${lostStreak} harimu di RuangPijar sudah hangus karena ${STREAK_GRACE_DAYS} hari
    berturut-turut tidak check-in.</p>
    <p>Tidak apa-apa — check-in hari ini untuk mulai streak baru.</p>
  `;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return jsonError("Unauthorized", 401);
  }

  try {
    await connectDB();

    const now = new Date();
    const atRiskUsers = await UserModel.find({
      currentStreak: { $gt: 0 },
      lastCheckInAt: { $ne: null },
    });

    let remindersSent = 0;
    let streaksReset = 0;

    for (const user of atRiskUsers) {
      if (!user.lastCheckInAt) continue;

      const gap = daysSince(user.lastCheckInAt, now);
      if (gap <= 0) continue;

      if (gap >= STREAK_GRACE_DAYS) {
        const lostStreak = user.currentStreak;
        user.currentStreak = 0;
        user.lastReminderSentAt = null;
        await user.save();
        streaksReset += 1;

        await sendMail({
          to: user.email,
          subject: "Streak-mu di RuangPijar sudah hangus",
          html: streakResetEmailHtml(user.name, lostStreak),
        }).catch((error) =>
          console.error(`Failed to email ${user.email}`, error),
        );

        continue;
      }

      const remindedToday =
        user.lastReminderSentAt &&
        daysSince(user.lastReminderSentAt, now) === 0;
      if (remindedToday) continue;

      user.lastReminderSentAt = now;
      await user.save();
      remindersSent += 1;

      await sendMail({
        to: user.email,
        subject:
          gap === 1
            ? "Jangan sampai putus, lanjutkan streak-mu hari ini"
            : "Streak-mu terancam hangus besok!",
        html: reminderEmailHtml(user.name, user.currentStreak, gap),
      }).catch((error) =>
        console.error(`Failed to email ${user.email}`, error),
      );
    }

    return Response.json({
      checked: atRiskUsers.length,
      remindersSent,
      streaksReset,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
