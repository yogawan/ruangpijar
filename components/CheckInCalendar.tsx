"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  addMonths,
  buildMonthGrid,
  DAY_LABEL_FORMAT,
  isSameMonth,
  monthLabel,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import { type CheckIn, moodFor } from "@/lib/check-in-labels";

type CheckInCalendarProps = {
  /** First day of the month being shown. */
  month: Date;
  onMonthChange: (month: Date) => void;
  /** Local day key (`YYYY-MM-DD`) -> the check-ins recorded that day. */
  checkInsByDay: Map<string, CheckIn[]>;
  onSelectDay: (key: string) => void;
  /** Dims the grid while a month is still loading, without collapsing it. */
  loading: boolean;
};

const NAV_BUTTON_CLASS =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

export default function CheckInCalendar({
  month,
  onMonthChange,
  checkInsByDay,
  onSelectDay,
  loading,
}: CheckInCalendarProps) {
  const days = buildMonthGrid(month);
  const today = new Date();

  // Nothing is ever recorded ahead of today, so paging into the future would
  // only ever show empty grids.
  const atCurrentMonth = isSameMonth(month, today);

  return (
    <section aria-label="Kalender check-in">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          className={NAV_BUTTON_CLASS}
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* The month name changes as you page, so it is announced. */}
        <h2 aria-live="polite" className="text-lg font-semibold capitalize">
          {monthLabel(month)}
        </h2>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={atCurrentMonth}
          className={NAV_BUTTON_CLASS}
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div
        className={`rounded-xl border border-border p-2 transition-opacity sm:p-3 ${
          loading ? "opacity-50" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className="grid grid-cols-7 gap-1 pb-1 text-center text-xs font-medium text-muted-foreground"
        >
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-1">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, key, inMonth, isToday }) => {
            const entries = inMonth ? checkInsByDay.get(key) : undefined;
            const mood = entries ? moodFor(entries[0].mood) : undefined;

            const base =
              "relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors";

            // Days from the neighbouring months are shown for grid shape
            // only — they are not this month's data, so they stay inert.
            if (!inMonth) {
              return (
                <span
                  key={key}
                  aria-hidden="true"
                  className={`${base} text-muted-foreground/30`}
                >
                  {date.getDate()}
                </span>
              );
            }

            if (!entries) {
              return (
                <span
                  key={key}
                  className={`${base} text-muted-foreground/60 ${
                    isToday ? "ring-1 ring-inset ring-primary/40" : ""
                  }`}
                >
                  {date.getDate()}
                </span>
              );
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDay(key)}
                aria-label={`${DAY_LABEL_FORMAT.format(date)} — ${
                  mood?.label ?? `mood ${entries[0].mood}`
                }${
                  entries.length > 1 ? `, ${entries.length} check-in` : ""
                }. Lihat detail.`}
                // Filled in solid primary so the days holding a check-in
                // read as the month's shape at a glance. Everything inside
                // therefore has to invert: today's ring, the day number and
                // the count below were all primary-coloured, which would
                // disappear against this.
                className={`${base} cursor-pointer border border-primary bg-primary text-primary-foreground hover:bg-brand-hover ${
                  isToday ? "ring-1 ring-inset ring-primary-foreground/70" : ""
                }`}
              >
                <span className="text-[0.6875rem] leading-none text-primary-foreground/75">
                  {date.getDate()}
                </span>

                {/* The illustrated faces are plum on transparent, within a
                    hair of this cell's own fill — dropped straight on they
                    vanish. The light disc restores the contrast they were
                    drawn for without giving up the filled cell. */}
                {mood ? (
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-background"
                  >
                    <Image
                      src={mood.image}
                      alt=""
                      width={128}
                      height={128}
                      className="h-10 w-10 object-contain"
                    />
                  </span>
                ) : (
                  <span aria-hidden="true" className="text-lg leading-none">
                    •
                  </span>
                )}

                {/* More than one check-in that day: the face shows the
                    first, this says there is more behind it. */}
                {entries.length > 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 rounded-full bg-primary-foreground px-1 text-[0.5625rem] font-medium leading-tight text-primary"
                  >
                    {entries.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
