"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef, useState } from "react";
import { markSplashDone, SPLASH_HOLD_MS, SPLASH_ZOOM_MS } from "@/lib/splash";

gsap.registerPlugin(useGSAP);

/**
 * Opening screen for the landing page: the logo alone on the page's own
 * background, held briefly, then zoomed past the viewer to reveal the page.
 *
 * Plays on every load of `/`. `ScrollAnimations` holds the hero entrance back
 * until this reports done, so that animation is not spent behind the overlay.
 */
export default function SplashScreen() {
  const [gone, setGone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const wordmark = wordmarkRef.current;
    if (!overlay || !logo || !wordmark) return;

    const finish = () => {
      // Restore the page's own scrolling before handing back over.
      document.body.style.overflow = "";
      setGone(true);
      markSplashDone();
    };

    // A three second hold and a full-screen zoom is exactly what this setting
    // asks not to happen, so skip straight to the page. globals.css only
    // neutralises CSS animations; GSAP drives inline styles from rAF and has
    // to be told separately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    const timeline = gsap.timeline({ onComplete: finish });

    timeline
      .fromTo(
        logo,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
      )
      // Follows the mark in rather than arriving with it, so the two read as
      // one lockup settling instead of a single block appearing.
      .fromTo(
        wordmark,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.35",
      )
      // Clears just before the zoom takes over. The mark is what flies at
      // the viewer; carrying the word along with it only makes the frame
      // busy at the moment it should be simplest.
      .to(
        wordmark,
        { opacity: 0, y: -6, duration: 0.3, ease: "power1.in" },
        SPLASH_HOLD_MS / 1000 - 0.15,
      )
      // Positioned absolutely on the timeline rather than chained, so the
      // hold is measured from the start and stays SPLASH_HOLD_MS however
      // long the entrance above takes.
      .to(
        logo,
        {
          scale: 9,
          opacity: 0,
          duration: SPLASH_ZOOM_MS / 1000,
          ease: "power2.in",
        },
        SPLASH_HOLD_MS / 1000,
      )
      // Trails the zoom slightly so the logo is visibly growing before the
      // page starts showing through behind it.
      .to(
        overlay,
        {
          opacity: 0,
          duration: (SPLASH_ZOOM_MS / 1000) * 0.8,
          ease: "power1.in",
        },
        "<0.15",
      );

    return () => {
      timeline.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <>
      {/* Without JS nothing ever clears this overlay, so it would sit over
          the page for good. Same escape hatch the scroll-reveal targets get
          in app/layout.tsx. */}
      <noscript>
        <style>{"[data-splash]{display:none!important}"}</style>
      </noscript>

      <div
        ref={overlayRef}
        data-splash
        // Not announced: it carries no information the page below does not,
        // and a screen reader should be free to start on the real content.
        aria-hidden="true"
        className="fixed inset-0 z-60 flex items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-5">
          <div ref={logoRef} style={{ opacity: 0 }}>
            <Image
              src="/ruang_pijar_logo.webp"
              alt=""
              width={478}
              height={476}
              priority
              className="h-32 w-32 object-contain sm:h-40 sm:w-40"
            />
          </div>

          <p
            ref={wordmarkRef}
            style={{ opacity: 0 }}
            className="font-display text-3xl tracking-tight text-brand sm:text-4xl"
          >
            RuangPijar
          </p>
        </div>
      </div>
    </>
  );
}
