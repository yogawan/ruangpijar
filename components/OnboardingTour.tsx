"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ACTIONS,
  type Controls,
  EVENTS,
  type EventData,
  Joyride,
  ORIGIN,
  STATUS,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";
import {
  hasSeenTour,
  markTourSeen,
  onTourRestart,
  TOURS,
  type TourSection,
  type TourStep,
  tourSectionFor,
} from "@/lib/tour";

/**
 * The spotlight walk-through, mounted by each of the five sections it
 * explains. Which steps play is decided from the pathname rather than from a
 * prop, so a page cannot end up showing another section's tour, and the
 * detail routes below a section show none at all.
 *
 * Steps and copy live in lib/tour.ts; this file is only the wiring and the
 * tooltip.
 */

// The overlay and the spotlight ring are drawn as SVG attributes, which —
// unlike a style property — do not resolve `var()`. These two therefore have
// to repeat their tokens' values: --text-main at 55%, and --accent.
const OVERLAY_COLOR = "rgba(41, 37, 37, 0.55)";
const SPOTLIGHT_RING = "#e9a68d";

/** What each Joyride step carries for the tooltip below to render. */
type TooltipData = {
  step: TourStep;
  mascot: string;
  /** One id per step in this tour, for the progress bar's keys. */
  ids: string[];
};

function buildSteps(section: TourSection): Step[] {
  const { mascot, steps } = TOURS[section];
  // Anchors are unique within a tour, and only one step per tour is
  // unanchored, so these are stable and distinct.
  const ids = steps.map((step) => step.anchor ?? "intro");

  return steps.map((step) => ({
    target: step.anchor ? `[data-tour="${step.anchor}"]` : "body",
    // An unanchored step is about the page as a whole, so it sits in the
    // middle of the screen with nothing cut out of the overlay.
    placement: step.anchor ? step.placement : "center",
    isFixed: step.isFixed,
    // Unread by the tooltip below, which renders `data` instead, but kept in
    // step so the tour still says something without a custom tooltip.
    content: step.body,
    data: { step, mascot: step.mascot ?? mascot, ids } satisfies TooltipData,
  }));
}

const PRIMARY_BUTTON_CLASS =
  "rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90";

const OUTLINE_BUTTON_CLASS =
  "rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted";

function TourTooltip({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const { ids, mascot, step: tourStep } = step.data as TooltipData;
  const titleId = `tour-step-${index}`;

  return (
    // `tooltipProps` already carries this role alongside aria-modal, so this
    // repeats rather than overrides it — spelling it out is what lets the
    // linter see which ARIA attributes are allowed on the element.
    <div
      {...tooltipProps}
      role="alertdialog"
      aria-labelledby={titleId}
      className="relative w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-border bg-surface p-5 text-left text-foreground"
    >
      <button
        type="button"
        {...closeProps}
        className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* alt is empty on purpose: the mascot sets the tone, the heading
          beside it carries the meaning. */}
      <div className="flex items-center gap-3 pr-8">
        <Image
          src={mascot}
          alt=""
          width={280}
          height={280}
          className="h-14 w-14 shrink-0 object-contain"
        />

        <h2 id={titleId} className="font-semibold leading-snug">
          {tourStep.title}
        </h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {tourStep.body}
      </p>

      {/* Progress, in the shape the check-in and personalization wizards
          already use. The bar repeats what the counter says, so it is
          decorative — the count is what gets read out. */}
      <div className="mt-5">
        <p className="mb-2 text-xs text-muted-foreground">
          Langkah {index + 1} dari {size}
        </p>

        <div aria-hidden="true" className="flex gap-2">
          {ids.map((id, position) => (
            <span
              key={id}
              className={`h-1 flex-1 rounded-full transition-colors ${
                position <= index ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        {/* On the last step "Lewati" would only mean what "Selesai" already
            does, so it stands down. */}
        {isLastStep ? null : (
          <button
            type="button"
            {...skipProps}
            className="text-xs text-muted-foreground hover:underline"
          >
            Lewati
          </button>
        )}

        <div className="ml-auto flex gap-2">
          {index > 0 ? (
            <button
              type="button"
              {...backProps}
              className={OUTLINE_BUTTON_CLASS}
            >
              Kembali
            </button>
          ) : null}

          <button
            type="button"
            {...primaryProps}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isLastStep ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingTour() {
  const pathname = usePathname();
  const section = tourSectionFor(pathname);

  const [run, setRun] = useState(false);
  // Bumped by a manual replay. It is part of Joyride's key so a tour that
  // already ran restarts from its first step instead of resuming.
  const [attempt, setAttempt] = useState(0);

  // Effects do not run on the server, so `run` is false through the initial
  // render and Joyride — which reaches for the DOM as soon as it starts —
  // only ever mounts in the browser.
  useEffect(() => {
    if (!section) return;

    setRun(!hasSeenTour(section));

    return onTourRestart(() => {
      setAttempt((current) => current + 1);
      setRun(true);
    });
  }, [section]);

  const handleEvent = useCallback(
    (data: EventData, controls: Controls) => {
      if (!section) return;

      // Esc is wired to Joyride's "close", which in a continuous tour merely
      // steps forward. Ending the tour is what a dismissal key should do.
      if (
        data.type === EVENTS.STEP_AFTER &&
        data.action === ACTIONS.CLOSE &&
        data.origin === ORIGIN.KEYBOARD
      ) {
        controls.skip();
        return;
      }

      if (data.type !== EVENTS.TOUR_END) return;

      // Reaching the end and bailing out both count as shown: replaying a
      // tour the user walked away from is exactly what they declined.
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        markTourSeen(section);
        setRun(false);
      }
    },
    [section],
  );

  if (!section || !run) return null;

  return (
    <Joyride
      key={`${section}-${attempt}`}
      continuous
      run
      scrollToFirstStep
      steps={buildSteps(section)}
      onEvent={handleEvent}
      tooltipComponent={TourTooltip}
      locale={{
        back: "Kembali",
        close: "Tutup panduan",
        last: "Selesai",
        next: "Lanjut",
        skip: "Lewati panduan",
      }}
      options={{
        arrowBase: 20,
        arrowSize: 10,
        arrowSpacing: 14,
        // Matches the tooltip's own bg-surface. This one lands in a style
        // property rather than an attribute, so the token resolves.
        arrowColor: "var(--surface)",
        // The highlighted element is being explained, not operated. Letting
        // a click through would navigate away mid-step.
        blockTargetInteraction: true,
        // Otherwise the close button just advances a step, which is not what
        // an × means.
        closeButtonAction: "skip",
        overlayClickAction: false,
        overlayColor: OVERLAY_COLOR,
        // Clears the sticky header, which is 80px tall and shrinks to 64px
        // once the page moves. Without this the top of a spotlit element
        // scrolls under the bar, and the bar shows through the cut-out.
        scrollOffset: 100,
        // Straight to the tooltip; a beacon the user has to find first would
        // be a second thing to explain.
        skipBeacon: true,
        spotlightPadding: 8,
        spotlightRadius: 14,
        // Long enough for the lists on /insight and /ruang to come back from
        // their fetch. A step whose target never appears is skipped rather
        // than stalling the tour.
        targetWaitTimeout: 4000,
        // Above the sticky header, which sits at z-30.
        zIndex: 60,
      }}
      styles={{
        floater: {
          // One shadow around the panel and its arrow together, warmer and
          // softer than the library's default.
          filter: "drop-shadow(0 8px 24px rgba(41, 37, 37, 0.18))",
        },
        // A thin ring so the cut-out reads as deliberate against the page,
        // which is nearly as light as the spotlight itself.
        spotlight: { stroke: SPOTLIGHT_RING, strokeWidth: 2 },
      }}
    />
  );
}
