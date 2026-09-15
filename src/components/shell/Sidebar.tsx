"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FoxAvatar, FoxMark, PrinterArt } from "@/components/art";
import { IconLogout } from "@/components/icons";
import { GoalModal } from "@/components/modals/GoalModal";
import { Meter, Panel, cx } from "@/components/ui";
import { ME } from "@/lib/data";
import { printerById } from "@/lib/printers";
import { useStore } from "@/lib/store";

export const NAV = [
  { href: "/", label: "Home", tourId: "nav-home" },
  { href: "/reels", label: "Reels", tourId: "nav-reels" },
  { href: "/explore", label: "Explore", tourId: "nav-explore" },
  { href: "/shop", label: "Shop", tourId: "nav-shop" },
  { href: "/docs", label: "Docs", tourId: "nav-docs" },
  { href: "/leaderboard", label: "Leaderboard", tourId: "nav-leaderboard" },
] as const;

/**
 * The phone tab bar divides into equal cells, and at six of them "Leaderboard"
 * no longer fits its own cell on a 360px screen. Reels gets in through the
 * header link below lg instead, so the rhythm of the bar survives.
 */
export const TAB_NAV = NAV.filter((item) => item.href !== "/reels");

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { coins, goalId, reset } = useStore();
  const [goalOpen, setGoalOpen] = useState(false);
  const goal = printerById(goalId);

  return (
    <div className={cx("flex flex-col gap-5", className)}>
      <Link href="/" aria-label="Half Life home" className="block w-[88px] shrink-0">
        <FoxMark className="sticker-shadow w-full" />
      </Link>

      <Panel tone="line" radius={18} className="relative bg-cream/60 pt-7 pb-5">
        <span
          aria-hidden="true"
          className="torn-soft absolute -top-3.5 left-8 h-8 w-20 rounded-t-lg bg-coral"
        />
        <nav className="relative px-5">
          <ul>
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href} data-tour={item.tourId} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "group flex items-center justify-between gap-2 border-b border-dashed border-line py-3 text-[1.02rem] transition-colors",
                      active ? "font-extrabold text-navy" : "font-semibold text-navy-soft hover:text-navy",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {active && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-coral" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="hand mt-6 text-right text-[0.78rem] leading-none text-line-strong/70" aria-hidden="true">
            half life
          </p>
        </nav>
      </Panel>

      <Panel tone="line" radius={18} className="relative overflow-hidden bg-cream/60 px-5 py-4">
        <button
          type="button"
          onClick={() => setGoalOpen(true)}
          aria-haspopup="dialog"
          className="label relative z-10 text-sky-deep transition-colors hover:text-navy"
        >
          View more
        </button>
        <PrinterArt
          kind={goal.kind}
          className="pointer-events-none absolute -top-1 right-2 h-24 w-auto opacity-95"
        />
        <p className="mt-9 max-w-[62%] text-[0.92rem] leading-snug font-semibold text-navy">
          You are on track to get a <span className="text-teal-deep">{goal.name}</span>
        </p>
        <Meter
          className="mt-3"
          value={coins}
          max={goal.coins}
          tone="teal"
          label={`${coins.toLocaleString()} / ${goal.coins.toLocaleString()}`}
        />
      </Panel>

      <Panel tone="line" radius={18} className="flex items-center gap-3.5 bg-cream/60 p-3.5">
        <FoxAvatar variant={ME.avatar} className="size-[66px] shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-[1rem] leading-tight font-extrabold text-navy">{ME.name}</p>
          <p className="hand truncate text-[0.8rem] text-navy-soft">{ME.handle}</p>
          <button
            type="button"
            className="label mt-2 inline-flex items-center gap-1.5 text-sky-deep transition-colors hover:text-coral"
          >
            Log out <IconLogout className="text-[0.95rem]" />
          </button>
        </div>
      </Panel>

      <button
        type="button"
        onClick={reset}
        className="hand -mt-1 self-start text-[0.76rem] text-line-strong underline decoration-dashed underline-offset-4 transition-colors hover:text-navy"
      >
        Replay the intro
      </button>

      <GoalModal open={goalOpen} onClose={() => setGoalOpen(false)} />
    </div>
  );
}
