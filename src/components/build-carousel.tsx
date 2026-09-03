"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import ImageSlot from "@/components/image-slot";
import { BUILD_CARDS } from "@/lib/content";

/**
 * The belt carries one card past you every this many seconds — at every
 * breakpoint. Speed is derived from the set's measured pitch rather than fixed
 * in pixels, so the pace reads identically on a phone and on the comp stage.
 * Averaged across the set, because a card is only as wide as its own credit.
 */
const SECONDS_PER_CARD = 8;

/** A loaded belt has mass: it drops to a stop faster than it winds back up. */
const STOP_TAU = 0.11;
const START_TAU = 0.34;

/** Enough repeats of the set that the wrap point is never in view. */
const COPIES = 3;

/**
 * The belt's own stage.
 *
 * The comp runs the belt full-bleed across its 1728 grid with 386 cards. Both
 * come in to 1360, so the belt reads as an object sitting inside the cyan band
 * rather than as the band itself, and the cyan gets to show on all four sides
 * of it. One number moves both: every measurement below is the comp's, times
 * 1360/1728.
 *
 * The wrapper is a container, so the belt's parts size against the belt rather
 * than the viewport. As `vw` they kept growing past the cap and the cards would
 * have outgrown their own stage above 1360. The coefficients are the comp's,
 * unchanged -- the card and its stage scaled by the same factor, so the ratio
 * between them did not move.
 */
const BELT_MAX = 1360;

/**
 * The photo box.
 *
 * Photographs are contained, never cropped: a build is the thing being shown,
 * and a macropad with its ends cut off is not the macropad. So the box is a
 * frame the whole picture sits inside, and the paper it leaves around the
 * edges is the card's own colour -- a mount, not a gap.
 *
 * The comp drew the card portrait, 329 x 377, which the real photography does
 * not fit: it runs square to wide, 1.05 to 1.83. 4:3 is the frame instead.
 * Where the box lands inside that spread barely matters -- every ratio from
 * 1.25 to 1.5 leaves the same ~19% of the box unused across these four -- so
 * it goes to the familiar one. What does matter is that there is a single
 * ratio: one photo footprint on every card, which is what keeps a row that
 * moves from jumping as it travels.
 */
const PHOTO_ASPECT = "4 / 3";

/**
 * The photo is the card minus its padding: 256px once the belt hits its cap,
 * ~18.7vw between there and the point the card meets its 13rem floor, and the
 * floor's width below that.
 */
const PHOTO_SIZES = "(min-width: 1360px) 256px, (min-width: 931px) 19vw, 208px";

type Metrics = { cycle: number; speed: number };

/**
 * Position within one set.
 *
 * A single `if (next >= cycle) next -= cycle` only ever unwinds one set, so it
 * could not bring a position back that had landed further out than that -- and
 * things do put it there: the browser scrolling a focused card into view, a
 * reader flicking the belt along, scroll restoration on a reload. The next
 * running frame then took one set off a position several sets out and the belt
 * lurched backwards, which is what read as the carousel restarting itself.
 *
 * Wrapping by the true cycle is invisible whatever the distance, because the
 * card set at `x` and at `x + cycle` is the same set -- so the belt can always
 * be brought back into range, not merely nudged one set at a time.
 */
function norm(x: number, cycle: number) {
  if (!(cycle > 0)) return x;
  const m = x % cycle;
  return m < 0 ? m + cycle : m;
}

export default function BuildCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLUListElement>(null);

  const metricsRef = useRef<Metrics>({ cycle: 0, speed: 0 });
  const posRef = useRef(0);
  const velocityRef = useRef(0);

  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const onscreenRef = useRef(false);
  const reducedRef = useRef(false);
  const wakeRef = useRef<() => void>(undefined);

  const stop = useCallback((which: "hover" | "focus") => {
    if (which === "hover") hoverRef.current = true;
    else focusRef.current = true;
  }, []);

  const start = useCallback((which: "hover" | "focus") => {
    if (which === "hover") hoverRef.current = false;
    else focusRef.current = false;
    wakeRef.current?.();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    if (!section || !rail) return;

    const measure = () => {
      const items = rail.children;
      const head = items[0] as HTMLElement | undefined;
      const wrap = items[BUILD_CARDS.length] as HTMLElement | undefined;
      if (!head || !wrap) return;

      // Measured off rects, not `offsetLeft`. `offsetLeft` is rounded to whole
      // pixels, and one set here is 1490.67 wide: wrapping by 1491 drops a
      // third of a pixel every time round, which on a belt this slow is a
      // visible tick roughly twice a minute.
      const cycle =
        wrap.getBoundingClientRect().left - head.getBoundingClientRect().left;

      metricsRef.current = {
        cycle,
        // Averaged across the set rather than taken from the first pair of
        // cards. A card is as wide as its credit, so the first pitch is not
        // the typical one -- with these four it is 364.47 against an average
        // of 372.67, which ran the belt 2% slow and made "a card every eight
        // seconds" mean nothing in particular.
        speed: cycle / (SECONDS_PER_CARD * BUILD_CARDS.length),
      };
      posRef.current = norm(rail.scrollLeft, cycle);
    };

    let frame = 0;
    let last = 0;

    const running = () =>
      onscreenRef.current &&
      !reducedRef.current &&
      !hoverRef.current &&
      !focusRef.current;

    const tick = (now: number) => {
      frame = 0;
      // Clamp dt so a backgrounded tab does not resume with a lurch.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const { cycle, speed } = metricsRef.current;
      const target = running() ? speed : 0;
      const tau = target > 0 ? START_TAU : STOP_TAU;

      let v =
        velocityRef.current +
        (target - velocityRef.current) * (1 - Math.exp(-dt / tau));
      if (target === 0 && v < 0.5) v = 0;
      velocityRef.current = v;

      if (v > 0 && cycle > 0) {
        // Our own fractional position is authoritative; resync only when the
        // reader has taken the belt somewhere themselves.
        if (Math.abs(rail.scrollLeft - posRef.current) > 1.5) {
          posRef.current = norm(rail.scrollLeft, cycle);
        }
        posRef.current = norm(posRef.current + v * dt, cycle);
        rail.scrollLeft = posRef.current;
      }

      if (v > 0 || target > 0) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame || !running()) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => {
      reducedRef.current = reduce.matches;
      wake();
    };
    onReduce();

    // A decorative loop has no business running off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onscreenRef.current = entry.isIntersecting;
        wake();
      },
      { threshold: 0 },
    );
    observer.observe(section);

    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    measure();

    reduce.addEventListener("change", onReduce);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      reduce.removeEventListener("change", onReduce);
      wakeRef.current = undefined;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="what-can-i-build"
      aria-labelledby="build-heading"
      // pb is what puts cyan under the belt: the band used to end on the
      // blue block's own edge, so the colour that names this section only
      // ever read above it. It mirrors the pt above the heading.
      className="relative bg-hl-cyan pb-16 text-hl-ink min-[1180px]:pb-24"
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: BELT_MAX, containerType: "inline-size" }}
      >
        <div className="px-4 pt-16 pb-7 sm:px-8 min-[1180px]:pt-24 min-[1180px]:pb-9">
          <h2
            id="build-heading"
            className="text-center font-display font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 4.6cqw, 3.75rem)" }}
          >
            What can I build?
          </h2>
        </div>

        <div
          className="bg-hl-blue"
          // The belt's clearance is fluid rather than stepped, and written here
          // rather than as `sm:py-10 min-[1180px]:py-14`: Tailwind v4 emits the
          // arbitrary min-[1180px] block *before* the named sm: block, so the
          // sm: value silently wins above 1180px. 32px → 56px, same intent.
          style={{ paddingBlock: "clamp(2rem, 4.75cqw, 3.5rem)" }}
          onPointerEnter={() => stop("hover")}
          onPointerLeave={() => start("hover")}
          onPointerCancel={() => start("hover")}
          onFocusCapture={() => stop("focus")}
          onBlurCapture={() => start("focus")}
        >
          <ul
            ref={railRef}
            // With no buttons, the scroller itself is the control: tabbable
            // everywhere rather than only in browsers that focus overflow
            // containers on their own, and the belt halts as focus lands.
            tabIndex={0}
            className="rail flex overflow-x-auto"
            style={{
              gap: "clamp(1rem, 6.48cqw, 88px)",
              paddingInline: "clamp(1rem, 5.56cqw, 76px)",
            }}
            aria-roledescription="carousel"
            aria-label="Projects Half Life teenagers have built"
          >
            {Array.from({ length: COPIES }).flatMap((_, copy) =>
              BUILD_CARDS.map((card, index) => (
                <li
                  key={`${copy}-${card.id}`}
                  className="shrink-0 bg-hl-paper rounded-[2rem]"
                  // The credit sets the card's width. `max-content` is the
                  // width at which a line does not wrap, so the card is exactly
                  // as wide as its credit needs and no wider -- which beats
                  // guessing a pixel figure, since what a string measures
                  // depends on the font rather than on its character count.
                  // The comp's card width survives as the floor, so a short
                  // credit cannot shrink a card, and the ceiling keeps a long
                  // one from running away with the belt.
                  style={{
                    width: "max-content",
                    minWidth: "clamp(13rem, 22.34cqw, 304px)",
                    maxWidth: "min(85vw, 34rem)",
                    padding: "clamp(0.85rem, 1.8cqw, 24px)",
                  }}
                  role={copy === 0 ? "group" : undefined}
                  aria-roledescription={copy === 0 ? "slide" : undefined}
                  aria-label={
                    copy === 0
                      ? `${index + 1} of ${BUILD_CARDS.length}`
                      : undefined
                  }
                  aria-hidden={copy === 0 ? undefined : true}
                  inert={copy !== 0}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: PHOTO_ASPECT }}
                  >
                    {card.photo ? (
                      <Image
                        src={card.photo}
                        // The label used to be painted over the photo, which
                        // is what made an empty alt correct. With it gone the
                        // only text left is the credit, and that names the
                        // builder rather than the build -- so the label now
                        // does its naming here instead.
                        alt={card.label}
                        fill
                        sizes={PHOTO_SIZES}
                        className="object-contain"
                      />
                    ) : (
                      <ImageSlot
                        label={card.slot.label}
                        ratio={card.slot.ratio}
                        className="h-full w-full"
                        scale={1.1}
                      />
                    )}
                  </div>
                  {/* nowrap is the guarantee, not the mechanism: the card is
                      already sized to hold this on one line, and this makes
                      sure a rounding error at the edge cannot break it over
                      two. */}
                  <p
                    className="mt-[0.9em] whitespace-nowrap text-hl-ink"
                    style={{ fontSize: "clamp(0.9rem, 1.5cqw, 1.3rem)" }}
                  >
                    {card.credit}
                  </p>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
