// lib/calendar.ts
// Date maths for the monthly check-in calendar on /jejak.
//
// Everything here works in the viewer's local timezone on purpose. A
// check-in is stored as a UTC instant, but "hari ini" means the local day it
// happened on — grouping by UTC would slide a 23:30 WIB check-in onto the
// next day in the grid.

/** Monday-first, matching how Indonesian calendars are usually laid out. */
export const WEEKDAY_LABELS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
] as const;

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

export const DAY_LABEL_FORMAT = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export type CalendarDay = {
  date: Date;
  /** Key into a day -> check-ins map; see `dayKey`. */
  key: string;
  /** False for the leading/trailing days borrowed from adjacent months. */
  inMonth: boolean;
  isToday: boolean;
};

/**
 * Stable `YYYY-MM-DD` key for a date, in local time.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that converts to UTC first,
 * which would file a late-evening check-in under the following day for any
 * timezone ahead of UTC.
 */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function monthLabel(date: Date): string {
  return MONTH_LABEL_FORMAT.format(date);
}

/** First day of the month `date` falls in, at local midnight. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Local bounds of a month as ISO instants, for `/api/check-ins?from&to`.
 *
 * Both ends are inclusive there, so `to` is the last millisecond of the
 * final day rather than midnight on the 1st of the next month — otherwise
 * everything recorded on the last day would be missed.
 */
export function monthRange(date: Date): { from: string; to: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Day 0 of the next month is the last day of this one, which sidesteps
  // any leap-year or 30/31 special-casing.
  return {
    from: new Date(year, month, 1, 0, 0, 0, 0).toISOString(),
    to: new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

/**
 * The grid cells for a month, padded out to whole Monday–Sunday weeks.
 *
 * Only as many weeks as the month actually spans (4-6), so there is never a
 * trailing row belonging entirely to the next month.
 */
export function buildMonthGrid(date: Date): CalendarDay[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // getDay() is 0=Sunday; shift so Monday=0 to line up with WEEKDAY_LABELS.
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const todayKey = dayKey(new Date());

  return Array.from({ length: cells }, (_, index) => {
    // The Date constructor normalises out-of-range days, so this walks
    // cleanly backwards into the previous month and on into the next.
    const cellDate = new Date(year, month, index + 1 - leading);
    const key = dayKey(cellDate);

    return {
      date: cellDate,
      key,
      inMonth: cellDate.getMonth() === month,
      isToday: key === todayKey,
    };
  });
}
