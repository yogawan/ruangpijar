"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { DAY_LABEL_FORMAT } from "@/lib/calendar";
import {
  type CheckIn,
  factorLabel,
  moodFor,
  statsFor,
} from "@/lib/check-in-labels";

type CheckInDayModalProps = {
  /** The selected day, or null when nothing is open. */
  day: Date | null;
  checkIns: CheckIn[];
  onClose: () => void;
};

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const HINT_CLASS = "text-xs text-muted-foreground";

const ACTION_LINK_CLASS =
  "flex-1 rounded-xl border border-border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-muted";

/**
 * Detail for one day of the check-in calendar.
 *
 * Built on the native `<dialog>` so the focus trap, Esc-to-close and inert
 * background come from the platform rather than being reimplemented.
 */
export default function CheckInDayModal({
  day,
  checkIns,
  onClose,
}: CheckInDayModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = day !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // showModal() throws if the dialog is already open, and close() on an
    // already-closed dialog fires a stray `close` event.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click handler only implements dismiss-on-backdrop, which is inherently pointer-only. The keyboard equivalent is Esc, which <dialog> handles natively and reports through onClose, and there is an explicit close button besides.
    <dialog
      ref={ref}
      // Esc and the form-method=dialog button both surface here, so parent
      // state is synced from one place.
      onClose={onClose}
      onClick={(event) => {
        // A click only lands on the dialog itself when it hits the backdrop;
        // anything inside the panel below stops at that div.
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="check-in-day-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      {day ? (
        <div className="max-h-[80vh] overflow-y-auto p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2
                id="check-in-day-title"
                className="text-lg font-semibold leading-snug"
              >
                {DAY_LABEL_FORMAT.format(day)}
              </h2>

              <p className={`mt-1 ${HINT_CLASS}`}>
                {checkIns.length > 1
                  ? `${checkIns.length} check-in hari ini.`
                  : "Satu check-in hari ini."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            {checkIns.map((checkIn) => {
              const mood = moodFor(checkIn.mood);

              return (
                <article
                  key={checkIn._id}
                  className="rounded-xl border border-border px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    {/* No disc needed here: the modal sits on the page's own
                        light background, which is what these were drawn for. */}
                    {mood ? (
                      <Image
                        src={mood.image}
                        alt=""
                        width={128}
                        height={128}
                        className="h-12 w-12 shrink-0 object-contain"
                      />
                    ) : (
                      <span aria-hidden="true" className="text-3xl">
                        •
                      </span>
                    )}

                    <div>
                      <p className="text-sm font-medium">
                        {mood?.label ?? `Mood ${checkIn.mood}`}
                      </p>

                      <p className={HINT_CLASS}>
                        {TIME_FORMAT.format(new Date(checkIn.checkedInAt))}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-3">
                    {statsFor(checkIn).map((stat) => (
                      <div key={stat.label}>
                        <dt className={HINT_CLASS}>{stat.label}</dt>
                        <dd className="text-sm font-medium">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {checkIn.factors.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className={HINT_CLASS}>Yang terasa memengaruhi</p>

                      <ul className="flex flex-wrap gap-2">
                        {checkIn.factors.map((factor) => (
                          <li
                            key={factor}
                            className="rounded-full border border-border px-3 py-1 text-xs"
                          >
                            {factorLabel(factor)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {checkIn.reflection ? (
                    <div className="mt-4 space-y-2">
                      <p className={HINT_CLASS}>Catatanmu</p>

                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {checkIn.reflection}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/check-in/${checkIn._id}`}
                      className={ACTION_LINK_CLASS}
                    >
                      Lihat detail
                    </Link>

                    <Link
                      href={`/check-in/${checkIn._id}/edit`}
                      className={ACTION_LINK_CLASS}
                    >
                      Ubah
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
