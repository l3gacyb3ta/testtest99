"use client";

import { useState } from "react";
import { PrinterArt } from "@/components/art";
import { GoalModal } from "@/components/modals/GoalModal";
import { Meter, Panel, cx } from "@/components/ui";
import { printerById } from "@/lib/printers";
import { useStore } from "@/lib/store";

/**
 * What every coin is aimed at. It rides whichever rail the viewport hands it —
 * the nav rail on the left below xl, the status rail on the right above it — so
 * it sizes itself from its container rather than from the window, and neither
 * slot has to be told which one it is.
 */
export function GoalTracker({ className }: { className?: string }) {
  const { coins, goalId } = useStore();
  const [open, setOpen] = useState(false);
  const goal = printerById(goalId);

  return (
    <Panel
      tone="line"
      radius={18}
      className={cx(
        "@container relative overflow-hidden bg-cream/60 px-5 py-4 @min-[16rem]:px-6 @min-[16rem]:py-5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="label relative z-10 text-sky-deep transition-colors hover:text-navy"
      >
        View more
      </button>
      <PrinterArt
        kind={goal.kind}
        className="pointer-events-none absolute -top-1 right-2 h-24 w-auto opacity-95 @min-[16rem]:-top-2 @min-[16rem]:right-3 @min-[16rem]:h-28"
      />
      <p className="mt-9 max-w-[62%] text-[0.92rem] leading-snug font-semibold text-navy @min-[16rem]:mt-11 @min-[16rem]:max-w-[60%] @min-[16rem]:text-[1rem]">
        You are on track to get a <span className="text-teal-deep">{goal.name}</span>
      </p>
      <Meter
        className="mt-3 @min-[16rem]:mt-4"
        value={coins}
        max={goal.coins}
        tone="teal"
        label={`${coins.toLocaleString()} / ${goal.coins.toLocaleString()}`}
      />

      <GoalModal open={open} onClose={() => setOpen(false)} />
    </Panel>
  );
}
