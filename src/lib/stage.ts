/**
 * Comp-space helpers.
 *
 * The approved comp is the Figma frame "landing page (claude)" (275:8),
 * 1728px wide. Everything inside a `.stage` is expressed as a fraction of
 * that width in `cqw` units, so a value written here is literally the
 * number of pixels it measures in Figma.
 */

export const COMP_WIDTH = 1728;

/** One comp pixel, as a container-relative length. */
export function u(px: number): string {
  return `${((px / COMP_WIDTH) * 100).toFixed(5)}cqw`;
}

/** Absolute box, in comp pixels. */
export function box(x: number, y: number, w: number, h: number) {
  return { left: u(x), top: u(y), width: u(w), height: u(h) } as const;
}

/** Absolute origin only — lets content size itself. */
export function at(x: number, y: number) {
  return { left: u(x), top: u(y) } as const;
}

/** Type set in comp pixels. */
export function type(size: number, lineHeight = 1.05) {
  return { fontSize: u(size), lineHeight } as const;
}
