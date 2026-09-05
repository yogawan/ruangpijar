"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Animation grammar, kept deliberately calm: short travel, soft easing, no
   autonomous motion. Every value below is shared by all sections so the page
   reads as one system rather than a pile of separate effects. */
const EASE = "power2.out";
const DURATION = 0.6;
const DISTANCE = 24;
const STAGGER = 0.08;
const PARALLAX = 20;

/* Elements the markup hands us. `app/globals.css` hides these up front so
   nothing flashes between first paint and hydration. */
const HIDDEN =
  "[data-hero-item],[data-hero-visual],[data-reveal],[data-reveal-stagger] > *,[data-count]";

/**
 * Drives every scroll animation on the landing page.
 *
 * The page itself stays a Server Component: it only tags elements with
 * `data-*` hooks, and this client component finds them and animates them.
 * Hooks available to the markup:
 *
 * - `data-hero-item`     staggered entrance on load (above the fold)
 * - `data-hero-visual`   scales up on load
 * - `data-reveal`        fades up once when scrolled into view
 * - `data-reveal-stagger` fades its direct children up, staggered
 * - `data-count`         pops in (used for the big 01–04 numerals)
 * - `data-parallax`      drifts with scroll
 * - `data-header`        gains `.is-scrolled` past 80px
 */
export default function ScrollAnimations() {
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll position indicator. Left outside the reduced-motion branch: it
    // reports where you already are rather than moving on its own.
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // globals.css already forces these visible; this keeps GSAP's own model
      // of the elements in sync so nothing re-hides them later.
      gsap.set(HIDDEN, { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-item]");
      if (heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: DISTANCE },
          {
            opacity: 1,
            y: 0,
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            delay: 0.15,
          },
        );
      }

      const heroVisual =
        document.querySelector<HTMLElement>("[data-hero-visual]");
      if (heroVisual) {
        gsap.fromTo(
          heroVisual,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.9, ease: EASE, delay: 0.25 },
        );
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
        gsap.fromTo(
          el,
          { opacity: 0, y: DISTANCE },
          {
            opacity: 1,
            y: 0,
            duration: DURATION,
            ease: EASE,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      }

      for (const group of gsap.utils.toArray<HTMLElement>(
        "[data-reveal-stagger]",
      )) {
        const items = Array.from(group.children) as HTMLElement[];
        if (items.length === 0) continue;

        gsap.fromTo(
          items,
          { opacity: 0, y: DISTANCE },
          {
            opacity: 1,
            y: 0,
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          },
        );
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-count]")) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.7 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
        gsap.fromTo(
          el,
          { y: -PARALLAX },
          {
            y: PARALLAX,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      }

      const header = document.querySelector<HTMLElement>("[data-header]");
      if (header) {
        ScrollTrigger.create({
          start: 80,
          end: "max",
          onToggle: (self) =>
            header.classList.toggle("is-scrolled", self.isActive),
        });
      }
    });

    // Webfonts land after hydration and reflow the page, which would leave
    // every trigger measured against stale positions.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  });

  return (
    <div
      ref={progressRef}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-brand"
    />
  );
}
