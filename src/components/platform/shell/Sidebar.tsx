"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FoxAvatar, FoxMark } from "@/components/platform/art";
import { IconLogout } from "@/components/platform/icons";
import { Panel, cx } from "@/components/platform/ui";
import { ME } from "@/lib/data";
import { useStore } from "@/lib/store";
import { GoalTracker } from "./GoalTracker";

export const NAV = [
  { href: "/", label: "Home", tourId: "nav-home" },
  { href: "/doomscroller", label: "Doomscroller", tourId: "nav-doomscroller" },
  { href: "/projects", label: "Projects", tourId: "nav-projects" },
  { href: "/explore", label: "Explore", tourId: "nav-explore" },
  { href: "/shop", label: "Shop", tourId: "nav-shop" },
  { href: "/docs", label: "Docs", tourId: "nav-docs" },
  // `short` is what the phone tab bar uses. Only one label needs it: the
  // labels are uppercase, and eleven uppercase characters do not fit a 60px
  // cell at any size worth reading.
  { href: "/leaderboard", label: "Leaderboard", short: "Ranks", tourId: "nav-leaderboard" },
] as const;

/**
 * The phone tab bar divides into equal cells. The Doomscroller gets in through
 * the header link below lg instead of taking one, which keeps the bar at six,
 * and six 60px cells on a 360px screen is exactly where "Leaderboard" stops
 * fitting — hence `short` on that one entry.
 */
export const TAB_NAV = NAV.filter((item) => item.href !== "/doomscroller");

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { reset } = useStore();

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
        </nav>
      </Panel>

      {/* From xl up the goal rides the status rail on the right, where the
          Doomscroller lives. Below that there is no second rail, so it stays
          here — one instance is on screen at a time either way. */}
      <GoalTracker className="xl:hidden" />

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
    </div>
  );
}
