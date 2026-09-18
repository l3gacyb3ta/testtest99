"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@/components/platform/icons";
import { ReelCard } from "@/components/platform/reels/ReelCard";
import { cx } from "@/components/platform/ui";
import { REELS } from "@/lib/data";

/**
 * One reel at a time, snapping. The scroll lives in this container rather than
 * the document so the app chrome stays put and every slide is exactly the
 * height of the frame. Wheel, trackpad, arrow keys and the side controls all
 * drive the same thing: which slide is centred.
 */
export function ReelViewer() {
  const scroller = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  // The observer reports asynchronously, so two quick presses would both read
  // the same stale index. Navigation moves this cursor immediately instead.
  const cursor = useRef(0);

  // REELS plus the sign-off slide at the end.
  const last = REELS.length;

  // Assigning scrollTop rather than asking for `behavior: "smooth"`: inside a
  // mandatory-snap container the animated form is dropped outright by some
  // engines, which leaves the controls doing nothing at all. A cut always lands.
  const goTo = useCallback((i: number) => {
    const target = slides.current[i];
    const box = scroller.current;
    if (!target || !box) return;
    cursor.current = i;
    setIndex(i);
    box.scrollTop = target.offsetTop;
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => goTo(Math.max(0, Math.min(slides.current.length - 1, cursor.current + dir))),
    [goTo],
  );

  // Scrolling by hand is the other way the cursor moves. Every slide is exactly
  // the height of the frame, so the scroll position is the index — no observer
  // needed, and no threshold to get wrong.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const onScroll = () => {
      const n = Math.max(0, Math.min(last, Math.round(box.scrollTop / box.clientHeight)));
      if (n === cursor.current) return;
      cursor.current = n;
      setIndex(n);
    };
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => box.removeEventListener("scroll", onScroll);
  }, [last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      // A checkpoint modal can open over any route, and typing is typing.
      if (document.querySelector("[role='dialog']")) return;
      const el = e.target;
      if (el instanceof Element && el.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }

      const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
      const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
      if (!back && !fwd) return;
      e.preventDefault();
      step(fwd ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    // The frame is the viewport minus the app header and the bottom padding
    // main already reserves for the phone tab bar.
    <div className="relative h-[var(--frame)] px-4 [--frame:calc(100dvh-4rem-7rem)] sm:px-0 lg:[--frame:calc(100dvh-4rem-2.5rem)]">
      {/* A reel is portrait, so the column is only ever as wide as a 9:16 card
          fits in the frame. The side controls then hug the reel, not the page. */}
      <div className="relative mx-auto h-full w-[min(100%,26rem,calc((var(--frame)-1.5rem)*9/16))]">
        <div
          ref={scroller}
          className="snap-y-feed no-scrollbar h-full overflow-y-auto overscroll-contain"
        >
          {REELS.map((reel, i) => (
            <div
              key={reel.id}
              data-slide={i}
              ref={(el) => {
                slides.current[i] = el;
              }}
              className="snap-item flex h-full items-center justify-center py-3"
            >
              <div className="aspect-9/16 w-full">
                <ReelCard reel={reel} className="lift-shadow h-full" />
              </div>
            </div>
          ))}

          <div
            data-slide={last}
            ref={(el) => {
              slides.current[last] = el;
            }}
            className="snap-item flex h-full flex-col items-center justify-center gap-2 py-3 text-center"
          >
            <p className="hand text-[1.05rem] text-navy">that is everything.</p>
            <p className="hand text-[0.9rem] text-navy-soft">go build something.</p>
          </div>
        </div>

        {/* Hugging the frame rather than the page edge, so the controls read as
            belonging to the reel. Touch gets the native swipe instead. */}
        <div className="absolute top-1/2 left-full ml-4 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex">
          <NavButton
            label="Previous reel"
            onClick={() => step(-1)}
            disabled={index === 0}
            icon={<IconChevronUp className="text-xl" />}
          />
          <p className="hand text-[0.72rem] leading-none text-navy-soft tabular-nums">
            {Math.min(index + 1, REELS.length)}/{REELS.length}
          </p>
          <NavButton
            label="Next reel"
            onClick={() => step(1)}
            disabled={index === last}
            icon={<IconChevronDown className="text-xl" />}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cx(
        "sketch grid size-11 place-items-center rounded-full bg-paper transition-colors",
        disabled
          ? "cursor-not-allowed text-line-strong/60"
          : "text-navy hover:bg-mint hover:text-teal-deep",
      )}
      style={
        {
          "--sk-color": disabled ? "var(--color-line)" : "var(--color-teal)",
          "--sk-radius": "999px",
        } as React.CSSProperties
      }
    >
      {icon}
    </button>
  );
}
