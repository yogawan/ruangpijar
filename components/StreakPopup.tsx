"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(useGSAP);

type StreakPopupProps = {
  /** The new streak to celebrate, or null when nothing is open. */
  streak: number | null;
  onClose: () => void;
};

/**
 * Celebration shown right after a check-in extends the streak — built on
 * the native `<dialog>` (see CheckInDayModal) for the focus trap,
 * Esc-to-close and inert background; GSAP only drives the bounce-in on top.
 */
export default function StreakPopup({ streak, onClose }: StreakPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const open = streak !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal() throws if the dialog is already open, and close() on an
    // already-closed dialog fires a stray `close` event.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useGSAP(
    () => {
      if (!open) return;
      const flame = flameRef.current;
      const details = detailsRef.current;
      if (!flame || !details) return;

      // globals.css can't reach into a <dialog>'s content before it opens,
      // so unlike the scroll animations this checks the media query itself
      // rather than relying on a pre-hidden state.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([flame, details], { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline();

      timeline
        .fromTo(
          flame,
          { opacity: 0, scale: 0.4, rotate: -12 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            ease: "back.out(1.8)",
          },
        )
        .fromTo(
          details,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "-=0.25",
        )
        // A single slow breathing loop — a hint of life, not a fire-flicker
        // loop that would fight with the text for attention.
        .to(flame, {
          scale: 1.06,
          duration: 0.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

      return () => {
        timeline.kill();
      };
    },
    { dependencies: [open], scope: dialogRef },
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click handler only implements dismiss-on-backdrop, which is inherently pointer-only. The keyboard equivalent is Esc, which <dialog> handles natively and reports through onClose, and there is an explicit close button besides.
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // A click only lands on the dialog itself when it hits the
        // backdrop; anything inside the panel below stops at that div.
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="streak-popup-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      {streak !== null ? (
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div ref={flameRef} style={{ opacity: 0 }}>
            <Image
              src="/maskot-pijar/Streak.webp"
              alt=""
              width={200}
              height={200}
              className="h-40 w-40 object-contain"
            />
          </div>

          <div ref={detailsRef} style={{ opacity: 0 }}>
            <p className="text-5xl font-extrabold tracking-tight text-brand">
              {streak}
            </p>

            <h2 id="streak-popup-title" className="mt-1 text-lg font-semibold">
              {streak === 1 ? "Streak dimulai!" : "Hari berturut-turut!"}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Terus check-in tiap hari biar streak-mu nggak hangus.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Lanjut
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
