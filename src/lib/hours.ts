import "server-only"
import prisma from "@/lib/prisma"
import { HoursSource, Phase } from "@/app/generated/prisma/enums"
import { fetchProjectSeconds } from "@/lib/hackatime"
import { getTierOrThrow, type TierId } from "@/lib/config/tiers"
import { COINS_PER_HOUR, MAX_COINS_PER_PROJECT } from "@/lib/config/program"

export interface HoursBreakdown {
  /** Sum over MANUAL sessions of (hoursApproved ?? hoursClaimed). */
  journalHours: number
  /** The same sum of hoursClaimed only, so the UI can show reviewer deflation. */
  journalHoursClaimed: number
  journalEntryCount: number

  hackatimeHours: number
  /** True when any link fell back to its cache. Blocks finalisation. */
  hackatimeStale: boolean

  /** Evidence only. Never part of any total. */
  timelapseSeconds: number
  /** timelapseSeconds / claimed seconds, clamped to [0, 1]. */
  timelapseCoverage: number

  /** journalHours + hackatimeHours. The reviewer's default. */
  computedTotal: number
  /** This phase's frozen hours on ThemeProject, once its review has landed. */
  frozenTotal: number | null
  /** frozenTotal ?? computedTotal. The number every caller should use. */
  effectiveHours: number
}

/**
 * Journal hours and Hackatime hours are additive. Timelapse is not.
 *
 * A timelapse is a recording *of* a session whose hours were already claimed,
 * so adding its duration is a straight double-count. It surfaces instead as
 * `timelapseCoverage` — a session claiming six hours with five hours of
 * timelapse reads very differently from one with none.
 *
 * Journal and Hackatime can double-count too, which is what
 * `WorkSession.hoursSource` exists to prevent: a HACKATIME_TRACKED session
 * still exists as a journal entry and as evidence, but contributes zero hours
 * because its time already arrives through the link.
 */
export async function getHoursBreakdown(
  themeProjectId: string,
  phase: Phase,
  opts: { live?: boolean } = {},
): Promise<HoursBreakdown> {
  const live = opts.live ?? false

  const [project, sessions, links] = await Promise.all([
    prisma.themeProject.findUnique({
      where: { id: themeProjectId },
      select: {
        approvedHours: true,
        designApprovedHours: true,
        user: { select: { hackatimeUserId: true } },
      },
    }),
    prisma.workSession.findMany({
      where: { themeProjectId, phase, deletedAt: null },
      select: {
        hoursClaimed: true,
        hoursApproved: true,
        hoursSource: true,
        timelapses: { select: { coveredSeconds: true } },
      },
    }),
    prisma.hackatimeLink.findMany({
      where: { themeProjectId, phase },
      select: { id: true, hackatimeProject: true, hoursApproved: true, cachedSeconds: true },
    }),
  ])

  let journalHours = 0
  let journalHoursClaimed = 0
  let timelapseSeconds = 0

  for (const s of sessions) {
    for (const t of s.timelapses) timelapseSeconds += t.coveredSeconds ?? 0
    if (s.hoursSource === HoursSource.HACKATIME_TRACKED) continue
    journalHours += s.hoursApproved ?? s.hoursClaimed
    journalHoursClaimed += s.hoursClaimed
  }

  let hackatimeHours = 0
  let hackatimeStale = false
  const hackatimeUserId = project?.user.hackatimeUserId ?? null

  for (const link of links) {
    // A reviewer override replaces the live value permanently, so there is
    // nothing to fetch and nothing that can go stale.
    if (link.hoursApproved !== null) {
      hackatimeHours += link.hoursApproved
      continue
    }
    if (live && hackatimeUserId) {
      const result = await fetchProjectSeconds(hackatimeUserId, link.hackatimeProject)
      if (result.stale) {
        hackatimeStale = true
        hackatimeHours += (link.cachedSeconds ?? 0) / 3600
      } else {
        hackatimeHours += result.seconds / 3600
        await prisma.hackatimeLink.update({
          where: { id: link.id },
          data: { cachedSeconds: result.seconds, cachedAt: new Date(), lastFetchError: null },
        })
      }
    } else {
      if (link.cachedSeconds === null) hackatimeStale = true
      hackatimeHours += (link.cachedSeconds ?? 0) / 3600
    }
  }

  const claimedSeconds = journalHoursClaimed * 3600
  const computedTotal = round2(journalHours + hackatimeHours)
  // Each phase freezes its own hours. Reading the build's column for a design
  // breakdown would report a design as already-frozen the moment its build was
  // approved, and hand the reviewer the wrong phase's number.
  const frozenTotal =
    (phase === Phase.DESIGN ? project?.designApprovedHours : project?.approvedHours) ?? null

  return {
    journalHours: round2(journalHours),
    journalHoursClaimed: round2(journalHoursClaimed),
    journalEntryCount: sessions.length,
    hackatimeHours: round2(hackatimeHours),
    hackatimeStale,
    timelapseSeconds,
    timelapseCoverage:
      claimedSeconds > 0 ? Math.min(1, timelapseSeconds / claimedSeconds) : 0,
    computedTotal,
    frozenTotal,
    effectiveHours: frozenTotal ?? computedTotal,
  }
}

/**
 * The summation half of getHoursBreakdown, separated so a caller that has
 * already loaded sessions and links in bulk can apply the SAME rules without
 * issuing three more queries per project.
 *
 * Extracted rather than reimplemented: these rules decide what people are paid,
 * and a second copy that drifts is a second answer to "how many hours is this".
 */
export interface SessionRow {
  hoursClaimed: number
  hoursApproved: number | null
  hoursSource: HoursSource
}

export interface LinkRow {
  hoursApproved: number | null
  cachedSeconds: number | null
}

export function rollUpHours(
  sessions: readonly SessionRow[],
  links: readonly LinkRow[],
  frozenTotal: number | null,
): { journalHours: number; hackatimeHours: number; computedTotal: number; effectiveHours: number } {
  let journalHours = 0
  for (const s of sessions) {
    // A HACKATIME_TRACKED session still exists as evidence but contributes
    // zero: its time already arrives through the link.
    if (s.hoursSource === HoursSource.HACKATIME_TRACKED) continue
    journalHours += s.hoursApproved ?? s.hoursClaimed
  }

  let hackatimeHours = 0
  for (const link of links) {
    hackatimeHours += link.hoursApproved ?? (link.cachedSeconds ?? 0) / 3600
  }

  const computedTotal = round2(journalHours + hackatimeHours)
  return {
    journalHours: round2(journalHours),
    hackatimeHours: round2(hackatimeHours),
    computedTotal,
    effectiveHours: frozenTotal ?? computedTotal,
  }
}

/**
 * Coins a phase minted, split by which pot they land in.
 *
 * A type alias rather than an interface on purpose: this gets written into the
 * audit row's JSON payload, and Prisma's `InputJsonValue` only accepts types
 * with an implicit index signature, which interfaces do not have.
 */
export type CoinSplit = {
  /** Printer fund. Spendable on a printer and nothing else. */
  banked: number
  /** Ordinary coins. */
  spendable: number
  total: number
}

/**
 * Coins minted by an approved DESIGN phase.
 *
 * The tier's hours come in two layers and the order matters:
 *
 *   [0, fundingHours)                    → dollars, not coins. This is the
 *                                          parts grant; it buys the BOM.
 *   [fundingHours, +bankHours)           → BANKED coins. The forced savings.
 *   [fundingHours + bankHours, ∞)        → spendable coins.
 *
 * So a Tier 1 design approved at 8h mints 0 spendable and 2h × 5 = 10 banked,
 * and the same design approved at 11h mints 10 banked and 15 spendable. Under-
 * shooting is handled by the same arithmetic rather than a special case: an
 * approval at 7h banks one hour's worth, because `min` clamps it.
 *
 * Spendable coins are capped: `approvedHours` can come from a reviewer typing
 * into a box, and a fat-fingered 1000 should not mint five thousand coins. The
 * banked half needs no cap — it is bounded by `bankHours` by construction.
 */
export function designCoinsFor(tierId: TierId | number, approvedHours: number): CoinSplit {
  const tier = getTierOrThrow(tierId)
  const beyondFunding = Math.max(0, approvedHours - tier.fundingHours)
  const bankedHours = Math.min(beyondFunding, tier.bankHours)
  const spendableHours = beyondFunding - bankedHours

  const banked = Math.floor(bankedHours * COINS_PER_HOUR)
  const spendable = Math.min(
    Math.floor(spendableHours * COINS_PER_HOUR),
    MAX_COINS_PER_PROJECT,
  )
  return { banked, spendable, total: banked + spendable }
}

/**
 * Coins minted by an approved BUILD phase.
 *
 * Every hour counts, with no funding floor subtracted: the build has no BOM to
 * pay for — the parts were bought with the design's grant — so the hours are
 * the participant's to keep. This is the half of the economy that gets someone
 * from the 50 banked coins five Tier 1 designs produce up to a printer.
 */
export function buildCoinsFor(approvedHours: number): CoinSplit {
  const spendable = Math.min(
    Math.floor(Math.max(0, approvedHours) * COINS_PER_HOUR),
    MAX_COINS_PER_PROJECT,
  )
  return { banked: 0, spendable, total: spendable }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
