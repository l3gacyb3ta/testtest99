/**
 * The grand-prize catalogue — the thing every banked coin is aimed at.
 *
 * Numbers come straight from the budget sheet (Half life budget – Printers),
 * and nothing here is invented on top of them. One coin is one dollar, so a
 * machine costs its shop price. Banked hours a week are the sheet's column 4:
 *
 *   banked = (shopPrice - 5 hours * 5 build weeks * $5) / 5 design weeks / $5
 *
 * Those banked hours are the same whatever tier you are on — the tier decides
 * how many funded hours sit underneath them, not how much you bank.
 */

export type PrinterKind = "bedslinger" | "corexy" | "resin" | "cnc";

export interface PrinterGoal {
  id: string;
  name: string;
  /** Sticker price, before anyone ships anything. */
  price: number;
  /** What it actually costs us — shipping and tax included. */
  shopPrice: number;
  /** What it costs in the shop. One coin is one dollar. */
  coins: number;
  /** Hours a week on tier 1 that land this by the end of the season. */
  hoursPerWeek: number;
  /** Of those hours, the ones that bank instead of funding your project. */
  bankedHours: number;
  /** Coins a design week earns at that pace — banked hours at $5 each. */
  coinsPerWeek: number;
  kind: PrinterKind;
  link: string;
  /** Short flag for anything that is not a plain FDM printer. */
  note?: string;
  blurb: string;
}

/**
 * Nobody is asked for less than ten hours a week on tier 1. The cheapest
 * machine works out at 9.76 on the budget sheet, so it is held here at the
 * floor; every other goal already clears it on its own.
 */
export const TIER1_MIN_HOURS = 10;

const SHEET: PrinterGoal[] = [
  {
    id: "ender-3-v3-se",
    name: "Ender 3 V3 SE",
    price: 199,
    shopPrice: 218.9,
    coins: 219,
    hoursPerWeek: 9.76,
    bankedHours: 3.76,
    coinsPerWeek: 219,
    kind: "bedslinger",
    link: "https://store.creality.com/products/ender-3-v3-se-3d-printer",
    blurb: "Open-frame bed-slinger, and the machine half the internet learned on.",
  },
  {
    id: "bambu-a1-mini",
    name: "Bambu A1 Mini",
    price: 219,
    shopPrice: 240.9,
    coins: 241,
    hoursPerWeek: 10.64,
    bankedHours: 4.64,
    coinsPerWeek: 241,
    kind: "bedslinger",
    link: "https://us.store.bambulab.com/products/a1-mini",
    blurb: "Bed-slinger, auto-levelling, genuinely good. Small bed, no excuses.",
  },
  {
    id: "elegoo-mars-4",
    name: "ELEGOO Mars 4",
    price: 225,
    shopPrice: 247.5,
    coins: 248,
    hoursPerWeek: 10.9,
    bankedHours: 4.9,
    coinsPerWeek: 248,
    kind: "resin",
    note: "Resin",
    link: "https://us.elegoo.com/collections/lcd-printers/products/mars-5-4k-6-6inch-monochrome-lcd-resin-3d-printer",
    blurb: "Detail you will never get out of a nozzle. Gloves and ventilation are not optional.",
  },
  {
    id: "elegoo-neptune-4",
    name: "ELEGOO Neptune 4",
    price: 249,
    shopPrice: 273.9,
    coins: 274,
    hoursPerWeek: 11.96,
    bankedHours: 5.96,
    coinsPerWeek: 274,
    kind: "bedslinger",
    link: "https://us.elegoo.com/collections/fdm-printers/products/elegoo-neptune-4-fdm-3d-printer",
    blurb: "Direct drive and a bigger bed, still an open frame you can reach into.",
  },
  {
    id: "monoprice-cnc",
    name: "Monoprice CNC Router",
    price: 249.99,
    shopPrice: 274.99,
    coins: 275,
    hoursPerWeek: 12,
    bankedHours: 6,
    coinsPerWeek: 275,
    kind: "cnc",
    note: "Not a printer",
    link: "https://www.monoprice.com/product?p_id=44220",
    blurb: "A benchtop router kit. It cuts wood, acrylic and soft metal instead of adding plastic.",
  },
  {
    id: "elegoo-centauri-2",
    name: "ELEGOO Centauri 2",
    price: 299,
    shopPrice: 328.9,
    coins: 329,
    hoursPerWeek: 14.16,
    bankedHours: 8.16,
    coinsPerWeek: 329,
    kind: "corexy",
    link: "https://us.elegoo.com/collections/fdm-printers/products/centauri-2",
    blurb: "Enclosed CoreXY at roughly open-frame money. Fast, and it keeps the heat in.",
  },
  {
    id: "bambu-a1",
    name: "Bambu A1",
    price: 299,
    shopPrice: 328.9,
    coins: 329,
    hoursPerWeek: 14.16,
    bankedHours: 8.16,
    coinsPerWeek: 329,
    kind: "bedslinger",
    link: "https://us.store.bambulab.com/products/a1",
    blurb: "The Mini's big sibling. Same idea, 256mm of bed to spread out on.",
  },
  {
    id: "bambu-p1s",
    name: "Bambu P1S",
    price: 399,
    shopPrice: 438.9,
    coins: 439,
    hoursPerWeek: 18.56,
    bankedHours: 12.56,
    coinsPerWeek: 439,
    kind: "corexy",
    link: "https://us.store.bambulab.com/products/p1s",
    blurb: "Enclosed CoreXY, filters, the lot. The one people stop upgrading from.",
  },
];

/** The coins one banked hour is worth. The sheet's $5, at a coin to the dollar. */
export const COINS_PER_HOUR = 5;

/**
 * Column 4 is the economy and is left exactly as the sheet has it — every tier
 * banks the same hours for the same machine. The ten-hour floor only touches
 * the tier-1 hours figure the goal picker shows; it must never reach the
 * banked hours, or the sheet's arithmetic stops landing on the price.
 */
export const PRINTERS: PrinterGoal[] = SHEET.map((p) => ({
  ...p,
  hoursPerWeek: Math.max(TIER1_MIN_HOURS, p.hoursPerWeek),
  coinsPerWeek: p.bankedHours * COINS_PER_HOUR,
}));

export const DEFAULT_GOAL_ID = "bambu-a1-mini";

/** The steepest weekly commitment on the board — the scale everything else reads against. */
export const MAX_HOURS_PER_WEEK = Math.max(...PRINTERS.map((p) => p.hoursPerWeek));

export function printerById(id: string): PrinterGoal {
  return PRINTERS.find((p) => p.id === id) ?? PRINTERS.find((p) => p.id === DEFAULT_GOAL_ID)!;
}

/** Whole weeks of banking left, at the pace that goal assumes. */
export function weeksToGo(goal: PrinterGoal, coins: number): number {
  return Math.max(0, Math.ceil((goal.coins - coins) / goal.coinsPerWeek));
}
