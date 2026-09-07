// lib/streak.ts
// Streak bookkeeping shared by the check-in POST route (extends the streak)
// and the /api/cron/streak-check sweep (reminds, then resets). Day math goes
// through `dayKey` from lib/calendar.ts so "today" means the same thing here
// as it does on the /jejak calendar grid.
import { dayKey } from "@/lib/calendar";

/** Days without a check-in before a streak is forfeited. */
export const STREAK_GRACE_DAYS = 3;

const MS_PER_DAY = 86_400_000;

function keyToLocalDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Whole days between two `dayKey` strings (`b - a`). Both sides are local
 * midnights, so this stays exact across DST transitions rather than dividing
 * a raw millisecond difference that could land on a 23- or 25-hour day.
 */
export function daysBetweenDayKeys(a: string, b: string): number {
  return Math.round(
    (keyToLocalDate(b).getTime() - keyToLocalDate(a).getTime()) / MS_PER_DAY,
  );
}

/** Days since `date`, relative to `now` (defaults to the current instant). */
export function daysSince(date: Date, now: Date = new Date()): number {
  return daysBetweenDayKeys(dayKey(date), dayKey(now));
}

export type StreakState = {
  currentStreak: number;
  lastCheckInAt: Date | null;
};

/**
 * Streak after a check-in lands on `checkInAt`.
 *
 * - No prior check-in: starts at 1.
 * - Same calendar day as the last one: unchanged (a second check-in on the
 *   same day doesn't count twice).
 * - Exactly one day later: extends the streak.
 * - Two or more days later: any streak had already lapsed, so it restarts
 *   at 1 rather than jumping straight back to its old value.
 * - Earlier than the last recorded day (a backdated check-in): left alone
 *   rather than rewriting history.
 */
export function nextStreakState(
  current: StreakState,
  checkInAt: Date,
): StreakState {
  if (!current.lastCheckInAt) {
    return { currentStreak: 1, lastCheckInAt: checkInAt };
  }

  const gap = daysBetweenDayKeys(
    dayKey(current.lastCheckInAt),
    dayKey(checkInAt),
  );

  if (gap < 0) return current;
  if (gap === 0)
    return { currentStreak: current.currentStreak, lastCheckInAt: checkInAt };
  if (gap === 1) {
    return {
      currentStreak: current.currentStreak + 1,
      lastCheckInAt: checkInAt,
    };
  }

  return { currentStreak: 1, lastCheckInAt: checkInAt };
}
