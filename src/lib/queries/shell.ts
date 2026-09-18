import "server-only"
import prisma from "@/lib/prisma"
import { getBalances } from "@/lib/currency"
import { effectiveDateFor, getProgramSettings } from "@/lib/program"
import { streakAsOf } from "@/lib/streak"
import { DEFAULT_GOAL_ID, printerById } from "@/lib/config/printers"

/**
 * Everything the app shell renders on every page: the two counters, the
 * printer-progress card, and the signed-in user.
 *
 * Deliberately its own query rather than a slice of getDashboard — this runs
 * on every platform page including the feed and the shop, so it must not drag
 * in per-theme hour breakdowns nobody outside the dashboard reads.
 */
export interface ShellData {
  user: { name: string | null; image: string | null }
  coins: number
  bankedCoins: number
  streak: number
  printer: {
    /** What they are saving toward. */
    label: string
    /** Coins they have, against its price. */
    have: number
    price: number
    percent: number
  }
}

export async function getShell(userId: string): Promise<ShellData> {
  const [user, balances, settings] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        currentStreak: true,
        lastStreakDate: true,
        printerGoalId: true,
      },
    }),
    prisma.$transaction((tx) => getBalances(tx, userId)),
    getProgramSettings(),
  ])

  // A printer can be paid for out of both pots, so progress is the total.
  const have = balances.total

  // The machine they picked, not the one they can nearly afford. This used to
  // guess at the cheapest printer still out of reach, which meant the card
  // silently changed what it was promising every time someone earned enough to
  // cross a price — and it is the goal, not the guess, that paces their week.
  const goal = printerById(user.printerGoalId ?? DEFAULT_GOAL_ID)
  const price = goal.coins
  const label = goal.name

  return {
    user: { name: user.name, image: user.image },
    coins: balances.spendable,
    bankedCoins: balances.banked,
    streak: streakAsOf(user, effectiveDateFor(new Date(), settings.programTimezone)),
    printer: {
      label,
      have,
      price,
      percent: price > 0 ? Math.min(100, Math.round((have / price) * 100)) : 0,
    },
  }
}
