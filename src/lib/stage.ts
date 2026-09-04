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

/**
 * The connector bands' taper — thick end over thin.
 *
 * The comp's four bands came in at 1.07, 1.09, 1.19 and 1.20, and two of them
 * tapered one way while two tapered the other. Under about 1.3 the eye reads a
 * taper as a drawing error rather than a decision, so all four were flat and
 * inconsistently flat. At 1.6 the wide end is half again the narrow one, which
 * is unmistakable, and every band now runs the same way: thin where it leaves
 * the plate above, thick where it lands on the one below. A band that gathers
 * as it descends makes each arrival a weld rather than a dwindle, which is the
 * industrial read this page is after.
 */
export const BAND_TAPER = 1.6;

/**
 * A connector band, built from its centreline instead of exported path data.
 *
 * `from` and `to` are the midpoints of the band's two ends — the comp's own
 * axis, untouched — and `mean` is its average perpendicular thickness, also
 * the comp's. Holding the mean is what lets the taper change without changing
 * the page's weight: each band keeps the presence the comp gave it, and keeps
 * the progression between them, where the line grows as the programme does
 * (92 through the first joint, 120 through the last).
 *
 * The ends are horizontal cuts, not perpendicular ones, because that is how
 * they meet the plates. So an end's thickness is its edge foreshortened by the
 * axis's own slope, and the edge that delivers a wanted thickness is that
 * thickness divided back out — which is why the paths carry no round numbers.
 */
export function band(
  from: readonly [number, number],
  to: readonly [number, number],
  mean: number,
) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const foreshorten = Math.abs(dy) / Math.hypot(dx, dy);

  const thin = (2 * mean) / (1 + BAND_TAPER) / foreshorten;
  const thick = thin * BAND_TAPER;

  const topLeft = x0 - thin / 2;
  const topRight = x0 + thin / 2;
  const botLeft = x1 - thick / 2;
  const botRight = x1 + thick / 2;

  const left = Math.min(topLeft, botLeft);
  const r = (n: number) => Number(n.toFixed(2));
  const h = r(dy);

  return {
    x: r(left),
    y: y0,
    w: r(Math.max(topRight, botRight) - left),
    h,
    d:
      `M${r(topLeft - left)} 0H${r(topRight - left)}` +
      `L${r(botRight - left)} ${h}H${r(botLeft - left)}Z`,
  };
}
