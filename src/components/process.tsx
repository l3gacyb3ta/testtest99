import type { CSSProperties } from "react";

import Image from "next/image";

import ImageSlot from "@/components/image-slot";
import type { Step } from "@/lib/content";
import { ASIDES, DESIGN_WEEKS, STEPS } from "@/lib/content";
import { COMP_WIDTH, at, band, box, u } from "@/lib/stage";

/**
 * The connector bands, as centrelines rather than exported vectors.
 *
 * Each is the comp's own axis — the midpoints of its two ends — and the comp's
 * own average thickness. `band` turns those into the quad and its box, so the
 * taper is `BAND_TAPER` in one place and not four sets of path data that have
 * to be kept in agreement by hand.
 *
 *   275:181  hero arrow, drops out of "how does it work?"   (lives in Hero)
 *   275:132  step 1 bottom-right  ->  step 2 top-left
 *   275:133  step 2 bottom-left   ->  step 3 top-right
 *   275:148  step 3 bottom-right  ->  step 4 top-left
 */
const CONNECTORS = [
  {
    id: "one-to-two",
    from: [835.25, 694.5],
    to: [967.25, 848.5],
    mean: 92.2,
  },
  {
    id: "two-to-three",
    from: [960.5, 1252.5],
    to: [860, 1432.5],
    mean: 102.2,
  },
  {
    id: "three-to-four",
    from: [750.25, 1981.5],
    to: [909.5, 2165],
    mean: 120.3,
  },
] as const;

/**
 * How wide a step's artwork is actually painted.
 *
 * These files run 8439 to 11876 across and the widest any is ever drawn is
 * 503px, so an undeclared `sizes` would pull a candidate ten times the box.
 * Stage: 736 comp units at the 1180 cap is 502.6px. Stacked: the plate runs
 * the full `max-w-2xl` column, the same 608px the lead week pairing gets.
 */
const STEP_ART_SIZES = {
  stage: "510px",
  /** Step 1's picture is the whole 975-unit plate, 666px at the 1180 cap. */
  weeks: "670px",
  stacked: "(min-width: 640px) 610px, 100vw",
} as const;

/**
 * The width the composition stops scaling at — and with it, the one number
 * that decides this section's height.
 *
 * Everything in the stage is a comp pixel expressed in `cqw`, so every length
 * in here is a share of the stage's own width. That includes the height: 2601
 * comp units is 150.52cqw, which means widening the window made the section
 * taller, 1:1.51. From 1180 to 1728 that added 825px of scroll — a page
 * getting longer as it gets more room, which is backwards.
 *
 * `.stage` caps at 1728, so the section was constant above that and variable
 * below it; the whole problem lived in the one band between the breakpoint and
 * the cap. Capping here at the breakpoint itself removes the band: the stage is
 * 1180 wide at 1180 and 1180 wide at 3840, so the height is a flat 1776px at
 * every width this layout is ever shown at — which it now actually is; see the
 * stage element below for the `cqw` fallback that was defeating this cap.
 *
 * Nothing is smaller than it already was, which is the part worth being clear
 * about: 1180 was always the narrowest this layout renders at, so the type now
 * sits everywhere at the size a 1180 screen has always shown it — the week
 * labels at 13.7px, the step titles at 27.3px. The composition simply stops
 * growing rather than shrinking. The section's ground and its wave stay
 * full-bleed; only the plates are held to a centred column.
 *
 * Raising this trades exactness for scale. Any value above 1180 re-opens a
 * band between the two where the height moves again — 1280 gives 16px week
 * labels and 151px of travel, 1400 gives 16.2px and 331px.
 */
const STAGE_CAP = 1180;

/**
 * The bottom edge of the lowest plate — step 4 at 2143 + 458 — so the stage is
 * exactly its own content and nothing more.
 */
const STAGE_H = 2601;

/**
 * A step's artwork: the picture where there is one, the drawn footprint where
 * there is not — the same optional-path-with-slot-fallback the week backdrops
 * and the carousel cards already use.
 *
 * Unlike a week backdrop this is a picture on show rather than a ground, so
 * nothing is screened, blended or thrown away: the comp's boxes were refitted
 * to the artwork's own proportions instead. `getfunding.png` is 3.133:1 into a
 * slot the comp drew at 4.748:1, `build.png` is 2.242:1 into one drawn at
 * 2.736:1, and `prizes.png` is 2.863:1 into that same 2.736:1 — so every box
 * took its picture's shape and the plates below moved to make room. Step 4 is
 * the only one that moved *up*: its picture is wider than the slot the comp
 * drew, so the plate lost 12 units rather than gaining them, and being the
 * last plate it took the section's height down with it.
 *
 * `cover` rather than `contain` after all that, and only because the refitted
 * boxes are whole comp units: 736x235 is 3.1319:1 against the file's 3.1333:1.
 * Cover answers that 0.05% with 0.05% of the picture; contain would answer it
 * with a hairline of bare plate down one edge, which is the visible one.
 */
function StepArt({
  step,
  className = "",
  style,
  scale,
  sizes,
}: {
  step: Step;
  className?: string;
  style?: CSSProperties;
  /** Only reaches the drawn fallback; a photograph has no fittings to scale. */
  scale?: number;
  sizes: string;
}) {
  if (!step.slot) return null;

  if (!step.art) {
    return (
      <ImageSlot
        label={step.slot.label}
        ratio={step.slot.ratio}
        className={className}
        style={style}
        scale={scale}
      />
    );
  }

  return (
    <div
      className={`overflow-hidden ${className}`}
      // `position` lives in `style` for the same reason it does on ImageSlot
      // and the week backdrops: the stage passes `absolute` here, where it has
      // to be able to beat the component's own `relative`.
      style={{ position: "relative", ...style }}
    >
      {/* Decorative: each of these sits directly under the heading that says
          what the step is, and the drawn slot it replaces carried only its own
          footprint label. If either picture turns out to carry information the
          heading does not — an order-flow diagram would — it wants real alt
          text rather than this. */}
      <Image
        src={step.art}
        alt=""
        fill
        sizes={sizes}
        quality={90}
        className="object-cover"
      />
    </div>
  );
}

/**
 * The five design weeks, for anything that cannot see the picture.
 *
 * `allweeks.png` carries the subjects and their week numbers as drawing, so
 * this is where that content still lives as text — for a screen reader, for
 * find-in-page, and for anything indexing the page. It is the same
 * `DESIGN_WEEKS` the five pairings were built from, so the two cannot drift.
 */
function WeekList() {
  return (
    <ul className="sr-only">
      {[DESIGN_WEEKS.lead, ...DESIGN_WEEKS.rest].map((week) => (
        <li key={week.subject}>{`${week.week}: ${week.subject}`}</li>
      ))}
    </ul>
  );
}

export default function Process() {
  const [design, funding, build, printer] = STEPS;
  const [viral, community] = ASIDES;

  return (
    <section
      id="how-it-works"
      aria-label="How Half Life works"
      className="relative z-0 isolate min-[1180px]:pb-[10vh]"
    >
      {/* ── Comp reproduction, 1180px and up ───────────────────────────── */}
      {/* Every child here is absolutely positioned, so the stage has no
          intrinsic height and has to be told one — as a ratio of its own
          width, never as a `cqw` length.

          `height: u(2474)` looked equivalent and was not. A container query
          unit resolves against the nearest *ancestor* container, and an element
          is never its own: `.stage` is the container here, so its own `cqw`
          height found no eligible ancestor and fell back to the viewport, the
          spec's last resort. The children, being descendants, did resolve
          against `.stage` and stopped at its 1180 cap. So the content ended at
          a flat 1689px while the box claimed 143.17vw, and every pixel past the
          cap became dead air under step 4 — 372 at 1440, 1060 at 1920, 1976 at
          2560, growing without limit. (Those are the numbers as they stood;
          `STAGE_H` has moved twice since, with the artwork.)

          `aspect-ratio` is self-referential by definition and needs no
          container, which is why the hero's below-fold block is already written
          this way. Height is now `STAGE_H`/1728 of the used width at every
          size, so it is the flat pixel count the cap was introduced to
          deliver.

          The trailing air below it is the section's `pb-[10vh]`. Viewport
          height, not the comp grid: this gap is the beat between two sections
          and what makes it feel long or short is how much screen is left to
          look at, not how wide the window is. */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ maxWidth: STAGE_CAP, aspectRatio: `${COMP_WIDTH} / ${STAGE_H}` }}
      >
        {/* Step 1 — design weeks, now one piece of artwork.

            `allweeks.png` is 1920x1080 and this plate is 975x547, which is
            1.7778 against 1.7824 — a 0.26% match, and the reason the picture
            is treated as the whole plate rather than as something standing
            inside it. The five hand-placed pairings, their five screened
            backdrops and the comp's own week marks are all inside it now.

            The heading and the five weeks stay in the document. A picture that
            replaces text has to hand that text back or the page has quietly
            lost it: the `h2` keeps step 1 in the outline alongside the other
            three, and the list carries the subjects and their week numbers. */}
        <div
          className="absolute overflow-hidden bg-hl-lavender-pale text-hl-ink"
          style={box(57, 164, 975, 547)}
        >
          <h2 className="sr-only">{design.title}</h2>
          {design.art ? (
            <Image
              src={design.art}
              alt=""
              fill
              sizes={STEP_ART_SIZES.weeks}
              quality={90}
              className="object-cover"
            />
          ) : null}
          <WeekList />
        </div>

        {/* Step 2 — funding */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(812, 836, 823, 445)}
        >
          <h2
            className="absolute font-display font-bold"
            style={{
              ...at(94, 38),
              width: u(690),
              fontSize: u(40),
              lineHeight: 1.1,
            }}
          >
            {funding.title}
          </h2>
          <StepArt
            step={funding}
            style={{ ...box(53, 109, 736, 235), position: "absolute" }}
            scale={1.05}
            sizes={STEP_ART_SIZES.stage}
          />
          <p
            className="absolute whitespace-nowrap font-semibold"
            style={{ ...at(323, 353), fontSize: u(20), lineHeight: 1 }}
          >
            {funding.caption}
          </p>
        </div>

        {/* Step 3 — build */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(57, 1406, 958, 582)}
        >
          <h2
            className="absolute font-display font-bold"
            style={{
              ...at(68, 42),
              width: u(821),
              fontSize: u(40),
              lineHeight: 1.1,
            }}
          >
            {build.title}
          </h2>
          <StepArt
            step={build}
            style={{ ...box(111, 158, 736, 328), position: "absolute" }}
            scale={1.35}
            sizes={STEP_ART_SIZES.stage}
          />
        </div>

        {/* Step 4 — the printer */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(731, 2143, 943, 458)}
        >
          <h2
            className="absolute font-display font-bold"
            style={{
              ...at(69, 52),
              width: u(700),
              fontSize: u(40),
              lineHeight: 1.1,
            }}
          >
            {printer.title}
          </h2>
          <StepArt
            step={printer}
            style={{ ...box(106, 140, 736, 257), position: "absolute" }}
            scale={1.35}
            sizes={STEP_ART_SIZES.stage}
          />
        </div>

        {/* Asides — small plates orbiting the band. Only where they sit
            differs; the plate itself is the same object twice. */}
        <Aside aside={viral} origin={[1114, 1531]} />
        <Aside aside={community} origin={[59, 2262]} />

        {/* Connectors, drawn last so they ride over the plates they join */}
        {CONNECTORS.map((connector) => {
          const b = band(connector.from, connector.to, connector.mean);
          return (
            <svg
              key={connector.id}
              className="absolute"
              style={box(b.x, b.y, b.w, b.h)}
              viewBox={`0 0 ${b.w} ${b.h}`}
              preserveAspectRatio="none"
              fill="none"
              aria-hidden
            >
              {/* The bands are the plates' own material, not a rule drawn
                  between them — they ride over the plates they join, so a band
                  in any other colour reads as a weld in a second metal. */}
              <path d={b.d} fill="var(--color-hl-lavender-pale)" />
            </svg>
          );
        })}
      </div>

      {/* ── Stacked layout, below 1180px ───────────────────────────────── */}
      <div className="px-4 pt-20 pb-24 sm:px-8 min-[1180px]:hidden">
        <ol className="mx-auto flex max-w-2xl flex-col">
          <li>
            <Plate>
              <h2 className="sr-only">{design.title}</h2>
              {design.art ? (
                <div className="relative aspect-[1920/1080] w-full overflow-hidden">
                  <Image
                    src={design.art}
                    alt=""
                    fill
                    sizes={STEP_ART_SIZES.stacked}
                    quality={90}
                    className="object-cover"
                  />
                </div>
              ) : null}
              <WeekList />
            </Plate>
          </li>

          <StackConnector lean="right" />

          <li>
            <Plate>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {funding.title}
              </h2>
              <StepArt
                step={funding}
                className="mt-6 aspect-[11876/3790] w-full"
                sizes={STEP_ART_SIZES.stacked}
              />
              <p className="mt-4 font-semibold">{funding.caption}</p>
            </Plate>
          </li>

          <StackConnector lean="left" />

          <li>
            <Plate>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {build.title}
              </h2>
              <StepArt
                step={build}
                className="mt-6 aspect-[9673/4315] w-full"
                sizes={STEP_ART_SIZES.stacked}
              />
            </Plate>
          </li>

          <li className="pt-10">
            <Aside aside={viral} stacked />
          </li>

          <StackConnector lean="right" />

          <li>
            <Plate>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {printer.title}
              </h2>
              <StepArt
                step={printer}
                className="mt-6 aspect-[8439/2948] w-full"
                sizes={STEP_ART_SIZES.stacked}
              />
            </Plate>
          </li>

          <li className="pt-10">
            <Aside aside={community} stacked />
          </li>
        </ol>
      </div>
    </section>
  );
}

function Plate({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-hl-lavender-pale px-5 py-7 text-hl-ink sm:px-8 sm:py-9">
      {children}
    </div>
  );
}

function StackConnector({ lean }: { lean: "left" | "right" }) {
  // The stage bands' taper, carried to the stacked layout so the two layouts
  // read as the same drawing. Applied to the horizontal edges directly, not
  // through `band`: this svg scales with `preserveAspectRatio="none"`, so its
  // viewBox units are stretched unequally and a perpendicular thickness
  // computed in them would not survive the scale. Mean edge 85, so 65.38 into
  // 104.62 — the same 1.6 either way, and both leans get the one pair so the
  // mirrored halves match.
  const d =
    lean === "right"
      ? "M37.31 0H102.69L187.31 120H82.69Z"
      : "M97.31 0H162.69L114.81 120H10.19Z";
  return (
    <li role="presentation" aria-hidden className="flex justify-center">
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="none"
        fill="none"
        className="h-16 w-40 sm:h-24 sm:w-56"
      >
        <path d={d} fill="var(--color-hl-cyan)" />
      </svg>
    </li>
  );
}

/**
 * The aside plate.
 *
 * Its two pieces used to be absolute boxes at fixed y inside the plate, which
 * is what made the spacing read as an accident: the title's height depends on
 * whether it wraps, but the body's top did not move with it. "earn more prizes
 * by going viral!" takes two lines and left a 5-unit gap; "100,000 more of you"
 * takes one and left 39. The plate's own padding was uneven too — 33 over the
 * title, 43 under the body — and the body box sat 21.4 from the left against
 * 19.7 from the right, so it was a fraction off centre.
 *
 * It is a flow box now: one padding value on each axis, one gap, and the title
 * and body both centred, so the two plates space themselves identically
 * whatever their copy does. The comp's own type sizes are kept; only the
 * spacing is re-derived.
 */
const ASIDE = {
  /** The comp's plate. Height is a floor, not a fixed size, so a title that
   *  wraps lengthens the plate instead of crushing the gap below it. */
  w: 555,
  minH: 261.227,
  padX: 34,
  padY: 30,
  gap: 18,
  titleSize: 30.833,
  bodySize: 22.269,
} as const;

/**
 * Stacked takes no origin and the stage plate cannot do without one, so the
 * two are separate shapes rather than one with everything optional.
 */
type AsideProps = { aside: (typeof ASIDES)[number] } & (
  | { stacked: true; origin?: never }
  /** Where the plate sits on the stage, in comp pixels. */
  | { stacked?: false; origin: readonly [number, number] }
);

function Aside(props: AsideProps) {
  const { aside } = props;

  if (props.stacked) {
    return (
      <div className="bg-hl-lavender px-5 py-7 text-center text-hl-indigo sm:px-7">
        <h3 className="font-display text-xl font-bold sm:text-2xl">
          {aside.title}
        </h3>
        <p className="mt-4 text-[0.975rem] leading-relaxed sm:text-base">
          {aside.body}
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute flex flex-col justify-center bg-hl-lavender text-center text-hl-indigo"
      style={{
        ...at(props.origin[0], props.origin[1]),
        width: u(ASIDE.w),
        minHeight: u(ASIDE.minH),
        padding: `${u(ASIDE.padY)} ${u(ASIDE.padX)}`,
      }}
    >
      <h3
        className="font-display font-bold"
        style={{ fontSize: u(ASIDE.titleSize), lineHeight: 1.15 }}
      >
        {aside.title}
      </h3>
      <p
        style={{
          marginTop: u(ASIDE.gap),
          fontSize: u(ASIDE.bodySize),
          lineHeight: 1.5,
        }}
      >
        {aside.body}
      </p>
    </div>
  );
}

