/**
 * Funding tiers.
 *
 * A tier is assigned per themed project when its DESIGN phase is approved. The
 * tier's dollars are parts money, so the decision has to land before the build
 * starts, not after it.
 *
 * Each tier splits the design-phase hours into two parts:
 *
 * - `fundingHours` — the hours the grant buys. These earn dollars, not coins.
 * - `bankHours`    — hours that must be worked on top, and which convert to
 *                    BANKED coins: the printer fund. Not optional, and not
 *                    spendable on anything but a printer.
 *
 * Their sum is the hours a design has to show to be approved at that tier,
 * which is why the program copy states each tier as a range: Tier 1 is
 * "6-8+ hours" because it is 6 funding + 2 banked. Hours beyond the sum
 * convert to ordinary spendable coins.
 *
 * The forced-savings rule is what makes the bare-minimum printer reachable by
 * someone doing the minimum: five design weeks at Tier 1 bank 5 × 2h × 5 =
 * 50 coins, and five build weeks at roughly 5h each add 5 × 5h × 5 = 125,
 * which is exactly the 175 the entry-level printer costs.
 */
export interface Tier {
  readonly id: 1 | 2 | 3
  readonly name: string
  /** Grant paid through the YSWS pipeline, in whole USD. */
  readonly grantUsd: number
  /** Hours the grant covers. These buy parts, not coins. */
  readonly fundingHours: number
  /** Hours forced into the printer fund, as BANKED coins. */
  readonly bankHours: number
  readonly blurb: string
  readonly examples: readonly string[]
}

// Numbers are the program designer's, from the Figma tier notes. Changing them
// is this file and nothing else — every review freezes the numbers it actually
// used onto SubmissionReview, so editing these does not rewrite anyone's
// history.
export const TIERS = [
  {
    id: 1,
    name: "Tier 1",
    grantUsd: 30,
    fundingHours: 6,
    bankHours: 2,
    blurb: "A focused build you can finish over a couple of weekends.",
    examples: ["Simple 2-layer breakout board", "Single-part printed enclosure"],
  },
  {
    id: 2,
    name: "Tier 2",
    grantUsd: 65,
    fundingHours: 13,
    bankHours: 5,
    blurb: "A multi-part build with real integration work.",
    examples: ["4-layer board with an MCU", "Multi-part mechanism"],
  },
  {
    id: 3,
    name: "Tier 3",
    grantUsd: 100,
    fundingHours: 20,
    bankHours: 10,
    blurb: "An ambitious build with novel engineering.",
    examples: ["Polyphonic synth voice card", "Full breadboard CPU"],
  },
] as const satisfies readonly Tier[]

export type TierId = (typeof TIERS)[number]["id"]

export const TIER_IDS: readonly TierId[] = TIERS.map((t) => t.id)

/** Hours a design must show to be approved at this tier. */
export function requiredHoursFor(tier: Tier): number {
  return tier.fundingHours + tier.bankHours
}

export function getTier(id: number): Tier | undefined {
  return TIERS.find((t) => t.id === id)
}

export function getTierOrThrow(id: number): Tier {
  const tier = getTier(id)
  if (!tier) throw new Error(`Unknown tier: ${id}`)
  return tier
}

export function isTierId(id: unknown): id is TierId {
  return typeof id === "number" && TIER_IDS.includes(id as TierId)
}

/**
 * The tier an hour count falls into, for suggesting a default to a reviewer.
 *
 * Compares against `fundingHours`, not the required total: someone who worked
 * 14 hours has cleared Tier 2's funding bar even though they are short of its
 * 18-hour ceiling, and the reviewer wants Tier 2 offered so they can see that.
 */
export function suggestTierForHours(hours: number): TierId {
  let suggested: TierId = TIERS[0].id
  for (const tier of TIERS) {
    if (hours >= tier.fundingHours) suggested = tier.id
  }
  return suggested
}

/** Airtable's `Complexity Tier` single-select label. */
export function tierAirtableLabel(id: number): string {
  const tier = getTier(id)
  return tier ? `Complexity ${tier.name}` : ""
}
