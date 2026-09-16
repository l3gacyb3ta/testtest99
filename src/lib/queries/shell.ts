import "server-only"
import prisma from "@/lib/prisma"
import { ShopItemCategory } from "@/app/generated/prisma/enums"
import { getBalances } from "@/lib/currency"
import { effectiveDateFor, getProgramSettings } from "@/lib/program"
import { streakAsOf } from "@/lib/streak"
import { PRINTER_FLOOR_COINS } from "@/lib/config/program"

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
  const [user, balances, settings, printers] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        currentStreak: true,
        lastStreakDate: true,
      },
    }),
    prisma.$transaction((tx) => getBalances(tx, userId)),
    getProgramSettings(),
    prisma.shopItem.findMany({
      where: { active: true, category: ShopItemCategory.PRINTER },
      orderBy: { priceCredits: "asc" },
      select: { name: true, priceCredits: true },
    }),
  ])

  // A printer can be paid for out of both pots, so progress is the total.
  const have = balances.total

  // Show the cheapest printer they cannot yet afford — that is the one the
  // number is actually about. Once they can afford everything, show the best
  // one, so the card reads as an achievement rather than an empty target.
  const next = printers.find((p) => p.priceCredits > have) ?? printers[printers.length - 1]
  const price = next?.priceCredits ?? PRINTER_FLOOR_COINS
  const label = next?.name ?? "a 3D printer"

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
