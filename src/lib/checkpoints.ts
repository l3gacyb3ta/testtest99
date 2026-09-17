import "server-only"
import prisma from "@/lib/prisma"
import { Phase, PhaseStatus, PostKind, Theme } from "@/app/generated/prisma/enums"
import { rollUpHours, type LinkRow, type SessionRow } from "@/lib/hours"
import { getTier, requiredHoursFor } from "@/lib/config/tiers"
import {
  TOTAL_WEEKS,
  getThemeDef,
  scheduleForWeek,
  type ThemeDef,
} from "@/lib/config/program"
import { currentWeekNumber } from "@/lib/program"

/**
 * The programme path — every week of the ten, as one continuous track.
 *
 * The sequence inside a week is the one written into the design file's
 * checkpoint note: project creation, first journal entry, idea reel, hours,
 * progress reel, submit for a design week; hours, reel, submit for a build
 * week, whose submission wants a video of the thing actually working.
 *
 * Every step is DERIVED from data the platform already stores rather than
 * tracked in a table of its own. A checkpoint table would be a second source of
 * truth for "has this project got an idea reel", and the first time the two
 * disagreed the path would lie to someone about work they had really done.
 *
 * ## Why so few queries
 *
 * Ten weeks through `getHoursBreakdown` would be thirty round trips on the page
 * participants open most. Instead every session, link, post and project is
 * fetched once and rolled up in memory through `rollUpHours`, which is the same
 * function the single-project path uses — so the hours rules stay in one place.
 */

/**
 * `locked` means the platform genuinely refuses, not "not your turn".
 *
 * This distinction is the whole honesty of the track. The programme's deadlines
 * are deliberately soft — a late joiner has to be able to finish, and someone
 * doing week 3's theme in week 5 lands on the same row they would have in week
 * 3 — so a padlock on a future week would be a lie the product does not tell.
 * `upcoming` steps are reachable; only a build submission before its design is
 * approved is actually blocked.
 */
export type CheckpointState = "done" | "current" | "upcoming" | "locked"

export interface Checkpoint {
  id: string
  label: string
  /** What to do next. Shown on the current step. */
  hint: string
  state: CheckpointState
  href: string | null
  /** 0–1. Only the hours step is partial; the rest are 0 or 1. */
  progress?: number
}

export type WeekState = "past" | "current" | "future"

export interface ProgrammeWeek {
  week: number
  theme: Theme
  themeLabel: string
  themeSlug: string
  themeArt: string
  phase: Phase
  /** "DESIGN YOUR PCB" — the banner headline for this week. */
  headline: string
  state: WeekState
  projectId: string | null
  checkpoints: Checkpoint[]
  /** How many of this week's checkpoints are done. */
  doneCount: number
}

export interface ProgrammePath {
  currentWeek: number
  totalWeeks: number
  weeks: ProgrammeWeek[]
}

/** The tier's required hours if one is assigned or requested, else the entry tier's. */
function targetHoursFor(tier: number | null, requested: number | null): number {
  const chosen = getTier(tier ?? requested ?? 1) ?? getTier(1)
  return chosen ? requiredHoursFor(chosen) : 8
}

export async function getProgrammePath(userId: string): Promise<ProgrammePath> {
  const currentWeek = await currentWeekNumber()

  const [projects, sessions, links, posts] = await Promise.all([
    prisma.themeProject.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        theme: true,
        title: true,
        description: true,
        tier: true,
        requestedTier: true,
        designStatus: true,
        buildStatus: true,
        designApprovedHours: true,
        approvedHours: true,
      },
    }),
    prisma.workSession.findMany({
      where: { themeProject: { userId, deletedAt: null }, deletedAt: null },
      select: {
        themeProjectId: true,
        phase: true,
        hoursClaimed: true,
        hoursApproved: true,
        hoursSource: true,
      },
    }),
    prisma.hackatimeLink.findMany({
      where: { themeProject: { userId, deletedAt: null } },
      select: {
        themeProjectId: true,
        phase: true,
        hoursApproved: true,
        cachedSeconds: true,
      },
    }),
    prisma.post.groupBy({
      by: ["themeProjectId", "kind"],
      where: { userId, deletedAt: null, themeProjectId: { not: null } },
      _count: { _all: true },
    }),
  ])

  const byTheme = new Map(projects.map((p) => [p.theme, p]))
  const key = (projectId: string, phase: Phase) => `${projectId}:${phase}`

  const sessionsByPhase = new Map<string, typeof sessions>()
  for (const s of sessions) {
    const k = key(s.themeProjectId, s.phase)
    const list = sessionsByPhase.get(k)
    if (list) list.push(s)
    else sessionsByPhase.set(k, [s])
  }

  const linksByPhase = new Map<string, typeof links>()
  for (const l of links) {
    const k = key(l.themeProjectId, l.phase)
    const list = linksByPhase.get(k)
    if (list) list.push(l)
    else linksByPhase.set(k, [l])
  }

  const reelKinds = new Map<string, Set<PostKind>>()
  for (const row of posts) {
    if (!row.themeProjectId) continue
    const set = reelKinds.get(row.themeProjectId) ?? new Set<PostKind>()
    set.add(row.kind)
    reelKinds.set(row.themeProjectId, set)
  }

  const weeks: ProgrammeWeek[] = []

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const scheduled = scheduleForWeek(week)
    if (!scheduled) continue

    const def = getThemeDef(scheduled.theme.id)
    const phase = scheduled.phase
    const project = byTheme.get(def.id) ?? null

    const state: WeekState =
      currentWeek === 0 || week > currentWeek
        ? "future"
        : week === currentWeek
          ? "current"
          : "past"

    weeks.push(
      buildWeek({
        week,
        def,
        phase,
        state,
        project,
        sessions: project ? (sessionsByPhase.get(key(project.id, phase)) ?? []) : [],
        links: project ? (linksByPhase.get(key(project.id, phase)) ?? []) : [],
        kinds: project ? (reelKinds.get(project.id) ?? new Set()) : new Set(),
      }),
    )
  }

  return { currentWeek, totalWeeks: TOTAL_WEEKS, weeks }
}

type ProjectRow = {
  id: string
  tier: number | null
  requestedTier: number | null
  title: string
  description: string | null
  designStatus: PhaseStatus
  buildStatus: PhaseStatus
  designApprovedHours: number | null
  approvedHours: number | null
}

function buildWeek(input: {
  week: number
  def: ThemeDef
  phase: Phase
  state: WeekState
  project: ProjectRow | null
  sessions: readonly SessionRow[]
  links: readonly LinkRow[]
  kinds: Set<PostKind>
}): ProgrammeWeek {
  const { week, def, phase, state, project, kinds } = input

  const base = {
    week,
    theme: def.id,
    themeLabel: def.label,
    themeSlug: def.slug,
    themeArt: `/brand/themes/${def.slug}.png`,
    phase,
    headline:
      phase === Phase.DESIGN
        ? `DESIGN YOUR ${def.label.toUpperCase()}`
        : `BUILD YOUR ${def.label.toUpperCase()}`,
    state,
  }

  // Someone whose provisioning failed has no project for this theme. The week
  // still belongs on the path — it is the programme's shape, not the user's —
  // so it renders with nothing done.
  if (!project) {
    return { ...base, projectId: null, checkpoints: [], doneCount: 0 }
  }

  const frozen = phase === Phase.DESIGN ? project.designApprovedHours : project.approvedHours
  const { effectiveHours } = rollUpHours(input.sessions, input.links, frozen)

  const targetHours = targetHoursFor(project.tier, project.requestedTier)
  const status = phase === Phase.DESIGN ? project.designStatus : project.buildStatus
  const submitted = status !== PhaseStatus.draft
  const designApproved = project.designStatus === PhaseStatus.approved

  const sessionCount = input.sessions.length
  const root = `/dashboard/${def.slug}`

  const raw: (Omit<Checkpoint, "state"> & { done: boolean; blocked?: string })[] =
    phase === Phase.DESIGN
      ? [
          {
            id: "project",
            label: "Make your project",
            hint: `Name your ${def.label} project and say what you are making.`,
            href: root,
            done: Boolean(project.title && project.description),
          },
          {
            id: "first-session",
            label: "Log your first session",
            hint: "Write a journal entry and attach a timelapse.",
            href: `${root}/log`,
            done: sessionCount > 0,
          },
          {
            id: "idea-reel",
            label: "Post your idea reel",
            hint: "A short video saying what you are going to build.",
            href: "/feed",
            done: kinds.has(PostKind.IDEA),
          },
          {
            id: "hours",
            label: `Reach ${targetHours} hours`,
            hint: `You are at ${effectiveHours.toFixed(1)} of ${targetHours} hours. Keep journalling.`,
            href: `${root}/log`,
            progress: targetHours > 0 ? Math.min(1, effectiveHours / targetHours) : 1,
            done: effectiveHours >= targetHours,
          },
          {
            id: "progress-reel",
            label: "Post a progress reel",
            hint: "Show where the design has got to.",
            href: "/feed",
            done: kinds.has(PostKind.PROGRESS),
          },
          {
            id: "submit",
            label: "Submit your design",
            hint: "Check your files are attached, then send it to a reviewer.",
            href: `${root}/submit/design`,
            done: submitted,
          },
        ]
      : [
          {
            id: "build-session",
            label: "Log your build sessions",
            hint: "Journal each session and record a timelapse while you build.",
            href: `${root}/log`,
            done: sessionCount > 0,
          },
          {
            id: "hours",
            label: `Reach ${targetHours} hours`,
            hint: `You are at ${effectiveHours.toFixed(1)} of ${targetHours} hours. Every build hour is coins.`,
            href: `${root}/log`,
            progress: targetHours > 0 ? Math.min(1, effectiveHours / targetHours) : 1,
            done: effectiveHours >= targetHours,
          },
          {
            id: "build-reel",
            label: "Post a build reel",
            hint: "Show it coming together.",
            href: "/feed",
            done: kinds.has(PostKind.PROGRESS) || kinds.has(PostKind.SUBMISSION),
          },
          {
            id: "submit",
            label: "Submit your build",
            hint: "Include 30–60 seconds of it working. If it does not work, write up what needs to change.",
            href: `${root}/submit/build`,
            done: submitted,
            // The one real gate in the programme: finalizeReview refuses to
            // approve a build whose design is not approved, so offering the
            // submission as available would be setting someone up to bounce.
            blocked: designApproved
              ? undefined
              : "Your design for this theme has to be approved first.",
          },
        ]

  let seenCurrent = false
  const checkpoints: Checkpoint[] = raw.map((c) => {
    const { done, blocked, ...rest } = c

    if (done) return { ...rest, state: "done" }
    if (blocked) {
      return { ...rest, state: "locked", href: null, hint: blocked }
    }
    // Only the week being lived gets a "current" node. A past week's unfinished
    // steps stay open rather than nagging, and a future week has not started.
    if (state === "current" && !seenCurrent) {
      seenCurrent = true
      return { ...rest, state: "current" }
    }
    return { ...rest, state: "upcoming" }
  })

  return {
    ...base,
    projectId: project.id,
    checkpoints,
    doneCount: checkpoints.filter((c) => c.state === "done").length,
  }
}
