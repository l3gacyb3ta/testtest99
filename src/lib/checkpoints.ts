import "server-only"
import prisma from "@/lib/prisma"
import { Phase, PhaseStatus, PostKind, Theme } from "@/app/generated/prisma/enums"
import { getHoursBreakdown } from "@/lib/hours"
import { getTier, requiredHoursFor } from "@/lib/config/tiers"
import { getThemeDef, scheduleForWeek } from "@/lib/config/program"
import { currentWeekNumber } from "@/lib/program"

/**
 * The week's checkpoint track — the winding path of nodes on the dashboard.
 *
 * The sequence is the one written into the design file's checkpoint note:
 *
 *   onboarding (project creation) / first journal-lapse entry / first reel
 *   (idea reel) / journal entries until you hit the hours / progress reel /
 *   submit
 *
 * Every step is DERIVED from data the platform already stores rather than
 * tracked in a table of its own. A checkpoint table would be a second source
 * of truth for "has this project got an idea reel", and the first time the two
 * disagreed the path would lie to someone about work they had actually done.
 * Deriving means the path is always a view of reality, and a reel deleted or a
 * session withdrawn moves it back on its own.
 */

export type CheckpointState = "done" | "current" | "locked"

export interface Checkpoint {
  id: string
  label: string
  /** What to do, shown when this is the current step. */
  hint: string
  state: CheckpointState
  /** Where tapping it should take you. Null when there is nothing to do yet. */
  href: string | null
  /** For the hours step: how far along, 0–1. */
  progress?: number
}

export interface CheckpointTrack {
  week: number
  theme: Theme
  themeLabel: string
  phase: Phase
  /** The banner headline: "DESIGN YOUR PCB". */
  headline: string
  projectId: string | null
  checkpoints: Checkpoint[]
}

/** The tier's hours if one is assigned or requested, else the entry tier's. */
function targetHoursFor(tier: number | null, requested: number | null): number {
  const chosen = getTier(tier ?? requested ?? 1) ?? getTier(1)
  return chosen ? requiredHoursFor(chosen) : 8
}

export async function getCheckpointTrack(userId: string): Promise<CheckpointTrack | null> {
  const week = await currentWeekNumber()
  const scheduled = scheduleForWeek(week)
  // Outside the ten weeks there is no "this week's theme", so there is no
  // track — the dashboard falls back to the project list.
  if (!scheduled) return null

  const theme = scheduled.theme.id
  const phase = scheduled.phase
  const def = getThemeDef(theme)

  const project = await prisma.themeProject.findFirst({
    where: { userId, theme, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      tier: true,
      requestedTier: true,
      designStatus: true,
      buildStatus: true,
    },
  })
  if (!project) return null

  const [sessionCount, reels, hours] = await Promise.all([
    prisma.workSession.count({
      where: { themeProjectId: project.id, phase, deletedAt: null },
    }),
    prisma.post.groupBy({
      by: ["kind"],
      where: { themeProjectId: project.id, deletedAt: null },
      _count: { _all: true },
    }),
    getHoursBreakdown(project.id, phase),
  ])

  const reelKinds = new Set(reels.map((r) => r.kind))
  const status = phase === Phase.DESIGN ? project.designStatus : project.buildStatus
  const submitted = status !== PhaseStatus.draft

  const targetHours = targetHoursFor(project.tier, project.requestedTier)
  const hoursDone = hours.effectiveHours >= targetHours

  // Built in order, then the first unfinished one becomes `current` and
  // everything after it is locked. Expressing it this way means the ordering
  // lives in one place rather than in six separate conditions.
  const raw: Omit<Checkpoint, "state">[] = [
    {
      id: "project",
      label: "Make your project",
      hint: `Name your ${def.label} project and say what you are making.`,
      href: `/dashboard/${def.slug}`,
      progress: project.title && project.description ? 1 : 0,
    },
    {
      id: "first-session",
      label: "Log your first session",
      hint: "Write a journal entry and attach a timelapse.",
      href: `/dashboard/${def.slug}/log`,
      progress: sessionCount > 0 ? 1 : 0,
    },
    {
      id: "idea-reel",
      label: "Post your idea reel",
      hint: "A short video saying what you are going to build.",
      href: "/feed",
      progress: reelKinds.has(PostKind.IDEA) ? 1 : 0,
    },
    {
      id: "hours",
      label: `Reach ${targetHours} hours`,
      hint: `You are at ${hours.effectiveHours.toFixed(1)} of ${targetHours} hours. Keep journalling.`,
      href: `/dashboard/${def.slug}/log`,
      progress: targetHours > 0 ? Math.min(1, hours.effectiveHours / targetHours) : 1,
    },
    {
      id: "progress-reel",
      label: "Post a progress reel",
      hint: "Show where the build has got to.",
      href: "/feed",
      progress: reelKinds.has(PostKind.PROGRESS) ? 1 : 0,
    },
    {
      id: "submit",
      label: "Submit for review",
      hint: "Check your files are attached, then send it to a reviewer.",
      href: `/dashboard/${def.slug}/submit/${phase.toLowerCase()}`,
      progress: submitted ? 1 : 0,
    },
  ]

  // The hours step is the only one that is partially complete rather than
  // binary, so "done" is its own threshold rather than progress === 1.
  const isDone = (c: Omit<Checkpoint, "state">): boolean =>
    c.id === "hours" ? hoursDone : (c.progress ?? 0) >= 1

  let seenCurrent = false
  const checkpoints: Checkpoint[] = raw.map((c) => {
    if (isDone(c)) return { ...c, state: "done" }
    if (!seenCurrent) {
      seenCurrent = true
      return { ...c, state: "current" }
    }
    // Locked steps keep their href out of the UI: offering a link to something
    // the path says you cannot do yet is the kind of small lie that makes a
    // progress track untrustworthy.
    return { ...c, state: "locked", href: null }
  })

  return {
    week,
    theme,
    themeLabel: def.label,
    phase,
    headline:
      phase === Phase.DESIGN
        ? `DESIGN YOUR ${def.label.toUpperCase()}`
        : `BUILD YOUR ${def.label.toUpperCase()}`,
    projectId: project.id,
    checkpoints,
  }
}
