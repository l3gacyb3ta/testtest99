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

/** A plate on the comp grid, in comp pixels. */
export type Plate = { x: number; y: number; w: number; h: number };

/** Declare a plate. `box(...spread)` draws it; `weld` joins it to another. */
export function plate(x: number, y: number, w: number, h: number): Plate {
  return { x, y, w, h };
}

/**
 * A weld between two plates — the band, expressed as the joint it actually is.
 *
 * `band` takes a centreline, which means whoever calls it has to know where
 * both plates are and keep two absolute midpoints in agreement with them by
 * hand. That is how the page ended up with a connector drawn in one
 * coordinate system landing on a plate laid out in another: the bands were a
 * copy of the plates' truth rather than derived from it, so a plate could move
 * and its band would not.
 *
 * A weld is named against the plates instead. `at` is how far along the edge
 * the end sits, as a fraction of that plate's own width, so a plate that is
 * resized keeps its band near the same corner. `rise` and `drop` are how far
 * the end reaches *inside* the plate it meets, which is the overlap that makes
 * the joint a weld and not two shapes touching. Move a plate — or grow one,
 * the way step 1 grew to hold its heading — and both its bands follow.
 */
export function weld(
  exit: { plate: Plate; at: number; rise: number },
  entry: { plate: Plate; at: number; drop: number },
  mean: number,
) {
  return band(
    [
      exit.plate.x + exit.plate.w * exit.at,
      exit.plate.y + exit.plate.h - exit.rise,
    ],
    [entry.plate.x + entry.plate.w * entry.at, entry.plate.y + entry.drop],
    mean,
  );
}

/**
 * The stacked layout's weld, on the same taper and the same anchor pair.
 *
 * Not `weld`: these svgs scale with `preserveAspectRatio="none"`, so a
 * thickness measured perpendicular to the run would not survive the stretch —
 * the taper goes on the horizontal edges directly, which is the one dimension
 * the viewBox and the box agree about. `STACK_ANCHORS` is where the run
 * leaves and lands across the 200-unit box, and a weld takes the pair in
 * whichever order it leans, so one band's exit is the last one's entry and the
 * zigzag down the column is continuous. Both were hand-drawn before and the
 * left-leaning one missed its own pair by 5 units.
 */
const STACK_MEAN_EDGE = 85;
const STACK_ANCHORS = [70, 135] as const;
export const STACK_VIEW = { w: 200, h: 120 } as const;

export function stackWeld(lean: "left" | "right"): string {
  const [near, far] =
    lean === "right" ? STACK_ANCHORS : [STACK_ANCHORS[1], STACK_ANCHORS[0]];
  const thin = (2 * STACK_MEAN_EDGE) / (1 + BAND_TAPER);
  const thick = thin * BAND_TAPER;
  const r = (n: number) => Number(n.toFixed(2));

  return (
    `M${r(near - thin / 2)} 0H${r(near + thin / 2)}` +
    `L${r(far + thick / 2)} ${STACK_VIEW.h}H${r(far - thick / 2)}Z`
  );
}

/** A plate's absolute box, for `style`. */
export function plateBox(p: Plate) {
  return box(p.x, p.y, p.w, p.h);
}
