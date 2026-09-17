"use client"
import Image from "next/image"
import Link from "next/link"
import { Fragment, useEffect, useRef } from "react"
import type { Checkpoint, ProgrammeWeek } from "@/lib/checkpoints"

/**
 * The whole ten-week programme as one scrollable track.
 *
 * Showing every week at once is the point: a participant in week 2 can scroll
 * down and see the synth, the displays and the breadboard computer waiting for
 * them, which is what makes the path feel like a journey rather than a to-do
 * list for today.
 *
 * Nothing about a future week is forbidden — the programme's deadlines are
 * soft, so future nodes are reachable rather than padlocked. The only padlock
 * on the track is a build submission whose design is not yet approved, which
 * the review path genuinely refuses.
 */

/** Offsets from lane centre, as a fraction of lane width. From the comp. */
const LANE = [0.1, -0.06, -0.14, -0.08, 0.1, 0.28]

function offsetAt(index: number): number {
  return LANE[index % LANE.length] ?? 0
}

function Glyph({ state }: Readonly<{ state: Checkpoint["state"] }>) {
  if (state === "done") {
    return (
      <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8 6.1 21l1.2-6.7L2.5 9.6l6.6-.9z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (state === "current") {
    return (
      <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
        <path d="M9 5l9 7-9 7z" fill="currentColor" />
      </svg>
    )
  }
  if (state === "locked") {
    return (
      <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
        <path d="M7 10V8a5 5 0 0110 0v2h1.5v10h-13V10zm2 0h6V8a3 3 0 00-6 0z" fill="currentColor" />
      </svg>
    )
  }
  // Upcoming: a quiet marker. Not a padlock — nothing is stopping you.
  return (
    <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    </svg>
  )
}

/**
 * The connector between two nodes.
 *
 * Drawn with the same turbulence displacement as every other edge in the
 * system, so the track reads as one hand rather than as nodes dropped onto a
 * CSS line. The curve bows toward the side the lane is swinging, which is what
 * makes the path feel like it is going somewhere.
 */
function Connector({
  from,
  to,
  done,
}: Readonly<{ from: number; to: number; done: boolean }>) {
  // The lane offsets are fractions; map them into the 100-wide viewBox.
  const x1 = 50 + from * 100
  const x2 = 50 + to * 100
  const bow = (x2 - x1) * 0.5

  return (
    <svg
      className={`hl-connector${done ? " hl-connector--done" : ""}`}
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M ${x1} 0 C ${x1 + bow} 22, ${x2 - bow} 38, ${x2} 60`}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 11"
        // Keeps the dots round and the weight even after the viewBox is
        // stretched to the lane's width.
        vectorEffect="non-scaling-stroke"
        filter="url(#hl-wobble-path)"
      />
    </svg>
  )
}

function Node({
  checkpoint,
  index,
}: Readonly<{ checkpoint: Checkpoint; index: number }>) {
  const inner = (
    <>
      <span className="hl-node-disc">
        {checkpoint.state === "current" && checkpoint.progress !== undefined ? (
          <span
            className="hl-node-fill"
            style={{ height: `${Math.round(checkpoint.progress * 100)}%` }}
            aria-hidden="true"
          />
        ) : null}
        <Glyph state={checkpoint.state} />
      </span>
      <span className="hl-node-label">{checkpoint.label}</span>
      {checkpoint.state === "current" || checkpoint.state === "locked" ? (
        <span className="hl-node-hint">{checkpoint.hint}</span>
      ) : null}
    </>
  )

  return (
    <li
      className={`hl-node hl-node--${checkpoint.state}`}
      style={{ marginInlineStart: `${offsetAt(index) * 100}%` }}
    >
      {checkpoint.href ? (
        <Link href={checkpoint.href} className="hl-node-link">
          {inner}
        </Link>
      ) : (
        <span className="hl-node-link" aria-disabled="true">
          {inner}
        </span>
      )}
    </li>
  )
}

function Week({ week }: Readonly<{ week: ProgrammeWeek }>) {
  return (
    <section
      className={`hl-week hl-week--${week.state}`}
      data-current={week.state === "current" ? "true" : undefined}
      aria-label={`Week ${week.week}: ${week.headline}`}
    >
      <header className="hl-week-head">
        <Image
          className="hl-week-art"
          src={week.themeArt}
          alt=""
          width={72}
          height={72}
          // Only the week in view is worth fetching eagerly.
          loading={week.state === "current" ? "eager" : "lazy"}
        />
        <div>
          <p className="hl-week-number">Week {week.week}</p>
          <h2 className="hl-week-title">{week.headline}</h2>
          <p className="hl-week-progress">
            {week.checkpoints.length === 0
              ? "Not set up yet"
              : `${week.doneCount} of ${week.checkpoints.length} done`}
          </p>
        </div>
      </header>

      <ol className="hl-path">
        {week.checkpoints.map((checkpoint, index) => (
          <Fragment key={checkpoint.id}>
            {index > 0 ? (
              <li className="hl-connector-row" aria-hidden="true">
                <Connector
                  from={offsetAt(index - 1)}
                  to={offsetAt(index)}
                  done={
                    week.checkpoints[index - 1]?.state === "done" &&
                    checkpoint.state === "done"
                  }
                />
              </li>
            ) : null}
            <Node checkpoint={checkpoint} index={index} />
          </Fragment>
        ))}
      </ol>
    </section>
  )
}

export function ProgrammePath({
  weeks,
  currentWeek,
}: Readonly<{ weeks: readonly ProgrammeWeek[]; currentWeek: number }>) {
  const scroller = useRef<HTMLDivElement>(null)

  // Land on this week rather than at the top of week 1. `auto` rather than
  // `smooth`: an animated scroll on arrival is a page that moves under you
  // before you have read it.
  //
  // Twice, deliberately. The first scroll happens before the webfont has
  // swapped in; every label then changes height, the document grows above the
  // target, and the reader is left parked in the gap between two weeks. The
  // second runs once fonts have settled and lands where the first one meant to.
  useEffect(() => {
    const target = scroller.current?.querySelector('[data-current="true"]')
    if (!target) return

    const land = () => target.scrollIntoView({ block: "start", behavior: "auto" })
    land()

    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) land()
    })
    return () => {
      cancelled = true
    }
  }, [currentWeek])

  return (
    <div className="hl-programme" ref={scroller}>
      {weeks.map((week) => (
        <Week key={week.week} week={week} />
      ))}
    </div>
  )
}
