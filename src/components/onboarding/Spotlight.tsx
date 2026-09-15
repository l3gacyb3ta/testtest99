"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowRight } from "@/components/icons";
import { Button, cx } from "@/components/ui";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function firstVisible(selector: string): HTMLElement | null {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return nodes.find((n) => n.getBoundingClientRect().width > 0) ?? null;
}

/**
 * Cuts a hole in a dimmed overlay around a live element and parks a coach card
 * beside it. The highlight itself never takes pointer events, so the element
 * underneath stays clickable when the step asks the user to act on it.
 */
export function Spotlight({
  selector,
  title,
  body,
  cta,
  onNext,
  onSkip,
  step,
  total,
  clickAnywhere = false,
  pad = 10,
  radius = 20,
}: {
  selector: string;
  title: string;
  body: string;
  cta?: string;
  onNext: () => void;
  onSkip?: () => void;
  step?: number;
  total?: number;
  clickAnywhere?: boolean;
  pad?: number;
  radius?: number;
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [travelling, setTravelling] = useState(false);
  const raf = useRef(0);
  const until = useRef(0);
  const placed = useRef(false);

  const measure = useCallback(() => {
    const el = firstVisible(selector);
    // Hold the last known position rather than blanking: a step whose target is
    // missing at this breakpoint should not make the highlight disappear and
    // re-enter, it should just stay put.
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = {
      top: Math.round(r.top - pad),
      left: Math.round(r.left - pad),
      width: Math.round(r.width + pad * 2),
      height: Math.round(r.height + pad * 2),
    };
    setRect((prev) =>
      prev &&
      prev.top === next.top &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.height === next.height
        ? prev
        : next,
    );
  }, [selector, pad]);

  /**
   * Follow the target for a bounded window rather than forever. A permanent
   * measure loop re-triggers the CSS transition on every frame, which pins it
   * at time zero and leaves the highlight stranded between two steps.
   */
  const follow = useCallback(() => {
    until.current = performance.now() + 900;
    if (raf.current) return;
    const loop = (now: number) => {
      measure();
      raf.current = now < until.current ? window.requestAnimationFrame(loop) : 0;
    };
    raf.current = window.requestAnimationFrame(loop);
  }, [measure]);

  useEffect(() => {
    firstVisible(selector)?.scrollIntoView({ block: "center", behavior: "smooth" });
    follow();
    const onMove = () => follow();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      window.cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [selector, follow]);

  // The first position is placed without a transition; every step after that
  // travels from wherever the highlight already is, so the eye can follow it.
  useEffect(() => {
    if (!rect || placed.current) return;
    placed.current = true;
    const id = window.requestAnimationFrame(() => setTravelling(true));
    return () => window.cancelAnimationFrame(id);
  }, [rect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onSkip) onSkip();
      if ((e.key === "Enter" || e.key === " ") && clickAnywhere) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onSkip, clickAnywhere]);

  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;

  // Park the card on whichever side actually has room. A tall target (the feed
  // rail) gets the card beside it; a wide one gets it above or below.
  const cardW = Math.min(340, vw - 32);
  const cardH = 190;
  const gap = 14;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

  let cardTop: number;
  let cardLeft: number;

  if (!rect) {
    // Target not on screen at this breakpoint — still show the card so the
    // tour can be finished rather than trapping the user behind a dim layer.
    cardLeft = clamp(vw / 2 - cardW / 2, 16, vw - cardW - 16);
    cardTop = vh - cardH - 32;
  } else if (rect.top + rect.height + gap + cardH < vh) {
    cardTop = rect.top + rect.height + gap;
    cardLeft = clamp(rect.left + rect.width / 2 - cardW / 2, 16, vw - cardW - 16);
  } else if (rect.top - gap - cardH > 0) {
    cardTop = rect.top - gap - cardH;
    cardLeft = clamp(rect.left + rect.width / 2 - cardW / 2, 16, vw - cardW - 16);
  } else if (rect.left - gap - cardW > 0) {
    cardLeft = rect.left - gap - cardW;
    cardTop = clamp(rect.top + rect.height / 2 - cardH / 2, 16, vh - cardH - 16);
  } else if (rect.left + rect.width + gap + cardW < vw) {
    cardLeft = rect.left + rect.width + gap;
    cardTop = clamp(rect.top + rect.height / 2 - cardH / 2, 16, vh - cardH - 16);
  } else {
    cardLeft = clamp(rect.left + rect.width / 2 - cardW / 2, 16, vw - cardW - 16);
    cardTop = vh - cardH - 24;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      {clickAnywhere && (
        <button
          type="button"
          aria-label="Next"
          onClick={onNext}
          className="absolute inset-0 cursor-pointer"
        />
      )}

      {rect ? (
      <div
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute rounded-[var(--r)]",
          travelling &&
            "transition-[top,left,width,height] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]",
        )}
        style={
          {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            "--r": `${radius}px`,
            boxShadow: "0 0 0 9999px rgba(19,17,62,.62)",
            outline: "3px dashed rgba(255,255,255,.9)",
            outlineOffset: "3px",
          } as React.CSSProperties
        }
      />
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-navy/55" />
      )}

      <div
        role="dialog"
        aria-label={title}
        className={cx(
          "sketch sketch-2 absolute rounded-2xl bg-cream p-4 lift-shadow",
          travelling
            ? "transition-[top,left,width] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]"
            : "motion-safe:animate-[hl-pop_.36s_cubic-bezier(.16,1,.3,1)]",
        )}
        style={
          {
            top: cardTop,
            left: cardLeft,
            width: cardW,
            "--sk-color": "var(--color-gold-deep)",
            "--sk-radius": "18px",
          } as React.CSSProperties
        }
      >
        <div key={title} className="motion-safe:animate-[hl-rise_.4s_.12s_cubic-bezier(.16,1,.3,1)_both]">
          {typeof step === "number" && typeof total === "number" && (
            <p className="label mb-1.5 text-gold-deep">
              Tour {step}/{total}
            </p>
          )}
          <p className="text-[1.05rem] leading-tight font-extrabold text-navy">{title}</p>
          <p className="mt-1.5 text-[0.86rem] leading-snug text-navy-soft">{body}</p>
        </div>
        <div className="mt-3.5 flex items-center gap-2">
          <Button size="sm" variant="gold" onClick={onNext}>
            {cta ?? "Got it"} <IconArrowRight className="text-sm" />
          </Button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="hand text-[0.78rem] text-navy-soft underline decoration-dashed underline-offset-4 transition-colors hover:text-navy"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
