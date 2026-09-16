import Link from "next/link"
import type { Checkpoint } from "@/lib/checkpoints"

/**
 * The week's path — the winding line of nodes down the dashboard.
 *
 * Geometry is the comp's. Its six nodes sit at x = 738, 630, 576, 619, 738,
 * 915 across a 1728-wide frame, which is a lane that swings left of centre and
 * back out again rather than a simple zig-zag. Those are carried here as
 * percentage offsets from the lane's centre so the shape survives at any
 * width.
 *
 * Each node is two stacked ellipses in the comp: a darker one offset downward
 * and the face on top. That is what gives the nodes their pressable, physical
 * look, and it is done here with a solid drop shadow rather than two elements.
 */

/** Offsets from lane centre, as a fraction of the lane's width. */
const LANE_OFFSETS = [0.10, -0.06, -0.14, -0.08, 0.10, 0.28]

function offsetFor(index: number): number {
  const offset = LANE_OFFSETS[index % LANE_OFFSETS.length]
  return offset ?? 0
}

function NodeFace({ checkpoint }: Readonly<{ checkpoint: Checkpoint }>) {
  if (checkpoint.state === "done") {
    // The comp marks finished nodes with a star.
    return (
      <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
        <path
          d="M12 2.5l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8 6.1 21l1.2-6.7L2.5 9.6l6.6-.9z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (checkpoint.state === "current") {
    return (
      <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
        <path d="M9 5l9 7-9 7z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="hl-node-glyph" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 0110 0v2h1.5v10h-13V10zm2 0h6V8a3 3 0 00-6 0z"
        fill="currentColor"
      />
    </svg>
  )
}

function Node({ checkpoint, index }: Readonly<{ checkpoint: Checkpoint; index: number }>) {
  const offset = offsetFor(index)
  const inner = (
    <>
      <span className="hl-node-disc">
        <NodeFace checkpoint={checkpoint} />
        {/* The hours step is the one node that fills gradually. */}
        {checkpoint.state === "current" && checkpoint.progress !== undefined ? (
          <span
            className="hl-node-fill"
            style={{ height: `${Math.round(checkpoint.progress * 100)}%` }}
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span className="hl-node-label">{checkpoint.label}</span>
      {checkpoint.state === "current" ? (
        <span className="hl-node-hint">{checkpoint.hint}</span>
      ) : null}
    </>
  )

  return (
    <li
      className={`hl-node hl-node--${checkpoint.state}`}
      style={{ marginInlineStart: `${offset * 100}%` }}
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

export function CheckpointPath({
  checkpoints,
}: Readonly<{ checkpoints: readonly Checkpoint[] }>) {
  const doneCount = checkpoints.filter((c) => c.state === "done").length

  return (
    <nav aria-label="This week's checkpoints">
      <ol className="hl-path">
        {checkpoints.map((checkpoint, index) => (
          <Node key={checkpoint.id} checkpoint={checkpoint} index={index} />
        ))}
      </ol>
      <p className="hl-hint" style={{ textAlign: "center" }}>
        {doneCount} of {checkpoints.length} done this week
      </p>
    </nav>
  )
}
