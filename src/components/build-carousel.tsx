"use client";

import { useCallback, useEffect, useRef } from "react";
import ImageSlot from "@/components/image-slot";
import { BUILD_CARDS } from "@/lib/content";

/**
 * The belt carries one card past you every this many seconds — at every
 * breakpoint. Speed is derived from the measured card pitch rather than fixed
 * in pixels, so the pace reads identically on a phone and on the comp stage.
 */
const SECONDS_PER_CARD = 8;

/** A loaded belt has mass: it drops to a stop faster than it winds back up. */
const STOP_TAU = 0.11;
const START_TAU = 0.34;

/** Enough repeats of the set that the wrap point is never in view. */
const COPIES = 3;

/** Hand-scattered label heights, as the comp places them (275:204–207). */
const LABEL_OFFSET = ["34%", "45%", "37%", "48%", "40%"];

type Metrics = { cycle: number; speed: number };

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
      const second = items[1] as HTMLElement | undefined;
      const wrap = items[BUILD_CARDS.length] as HTMLElement | undefined;
      if (!head || !second || !wrap) return;

      metricsRef.current = {
        cycle: wrap.offsetLeft - head.offsetLeft,
        speed: (second.offsetLeft - head.offsetLeft) / SECONDS_PER_CARD,
      };
      posRef.current = rail.scrollLeft;
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
          posRef.current = rail.scrollLeft;
        }
        let next = posRef.current + v * dt;
        if (next >= cycle) next -= cycle;
        posRef.current = next;
        rail.scrollLeft = next;
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
      className="relative bg-hl-cyan text-hl-ink"
    >
      <div className="px-4 pt-16 pb-7 sm:px-8 min-[1180px]:pt-24 min-[1180px]:pb-9">
        <h2
          id="build-heading"
          className="mx-auto max-w-[1728px] text-center font-display font-bold tracking-[-0.02em]"
          style={{ fontSize: "clamp(2rem, 4.6vw, 3.75rem)" }}
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
        style={{ paddingBlock: "clamp(2rem, 4.75vw, 3.5rem)" }}
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
            gap: "clamp(1rem, 6.48vw, 112px)",
            paddingInline: "clamp(1rem, 5.56vw, 96px)",
          }}
          aria-roledescription="carousel"
          aria-label="Projects Half Life teenagers have built"
        >
          {Array.from({ length: COPIES }).flatMap((_, copy) =>
            BUILD_CARDS.map((card, index) => (
              <li
                key={`${copy}-${card.id}`}
                className="shrink-0 bg-hl-paper"
                style={{
                  flexBasis: "clamp(15rem, 22.34vw, 386px)",
                  padding: "clamp(1rem, 1.8vw, 31px)",
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
                <div className="relative">
                  <ImageSlot
                    label={card.slot.label}
                    ratio={card.slot.ratio}
                    className="aspect-[329/377] w-full"
                    scale={1.1}
                  />
                  <p
                    className="pointer-events-none absolute left-[8%] font-display font-bold text-hl-paper"
                    style={{
                      top: LABEL_OFFSET[index % LABEL_OFFSET.length],
                      fontSize: "clamp(1rem, 1.5vw, 1.625rem)",
                      textShadow: "0 2px 10px rgb(49 34 44 / 0.85)",
                    }}
                  >
                    {card.label}
                  </p>
                </div>
                <p
                  className="mt-[0.9em] text-hl-ink"
                  style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.625rem)" }}
                >
                  {card.credit}
                </p>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
