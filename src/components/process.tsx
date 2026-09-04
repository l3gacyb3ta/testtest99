import type { CSSProperties } from "react";

import Image from "next/image";

import ImageSlot from "@/components/image-slot";
import type { DesignWeek } from "@/lib/content";
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
    from: [960.5, 1172.5],
    to: [860, 1352.5],
    mean: 102.2,
  },
  {
    id: "three-to-four",
    from: [750.25, 1842.5],
    to: [909.5, 2026],
    mean: 120.3,
  },
] as const;

const WEEK_MARKS = [
  { x: 92, labelX: 117, size: 45.736 },
  { x: 259, labelX: 309, size: 45.736 },
  { x: 477, labelX: 543, size: 45.736 },
] as const;

/**
 * Artwork behind each week pairing, in step-1-plate coordinates.
 *
 * Each box is the measured union of a subject and its own week label, padded
 * 22 across and 18 down. They are deliberately ragged rather than a uniform
 * band: the comp hand-places these five at different heights, and squaring
 * them into a row would flatten that. Gaps between neighbours run 19-28, and
 * the outermost clear the plate by 13.
 *
 * `label` and `ratio` record the artwork each one wants; they are drawn only
 * while a week is still waiting for its picture.
 *
 * The five are declared in week order, so `WEEKS[i]` is the pairing that
 * stands on `WEEK_BACKDROPS[i]` and carries the artwork for it.
 */
const WEEK_BACKDROPS = [
  { id: "week-1", label: "PCBs bench shot", x: 341, y: 125, w: 300, h: 191 },
  { id: "week-2", label: "CAD screen", x: 13, y: 380, w: 139, h: 116 },
  { id: "week-3", label: "synth build", x: 180, y: 380, w: 197, h: 116 },
  { id: "week-4", label: "display test", x: 398, y: 380, w: 232, h: 116 },
  { id: "week-5", label: "breadboard rig", x: 649, y: 363, w: 313, h: 165 },
] as const;

/** The five pairings, in the order their backdrops are declared above. */
const WEEKS = [DESIGN_WEEKS.lead, ...DESIGN_WEEKS.rest];

/**
 * How wide a backdrop is actually painted, per layout — for `sizes`, not for
 * geometry.
 *
 * The source files are 3000 x 3000 and the widest a backdrop is ever drawn is
 * 214px, on the stage. Left undeclared, `sizes` defaults to 100vw and the
 * browser pulls a candidate an order of magnitude past anything these boxes can
 * show. Both layouts sit in the DOM at once, but the hidden one's images are
 * lazy and never intersect, so only the layout on screen fetches at all.
 */
const ART_SIZES = {
  /** Stage: the widest backdrop is 313 comp units, 214px at the 1180 cap. */
  stage: "220px",
  /** Stacked: the lead pairing runs the full plate, 608px inside `max-w-2xl`. */
  lead: "(min-width: 640px) 610px, 100vw",
  /** Stacked: weeks 2-5 are a two-column grid inside that same plate. */
  grid: "(min-width: 640px) 310px, 50vw",
} as const;

/**
 * The width the composition stops scaling at — and with it, the one number
 * that decides this section's height.
 *
 * Everything in the stage is a comp pixel expressed in `cqw`, so every length
 * in here is a share of the stage's own width. That includes the height: 2474
 * comp units is 143.17cqw, which means widening the window made the section
 * taller, 1:1.43. From 1180 to 1728 that added 785px of scroll — a page
 * getting longer as it gets more room, which is backwards.
 *
 * `.stage` caps at 1728, so the section was constant above that and variable
 * below it; the whole problem lived in the one band between the breakpoint and
 * the cap. Capping here at the breakpoint itself removes the band: the stage is
 * 1180 wide at 1180 and 1180 wide at 3840, so the height is a flat 1689px at
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
 * labels and 144px of travel, 1400 gives 16.2px and 315px.
 */
const STAGE_CAP = 1180;

/**
 * The bottom edge of the lowest plate — step 4 at 2004 + 470 — so the stage is
 * exactly its own content and nothing more.
 */
const STAGE_H = 2474;

/**
 * The artwork behind a week pairing: the picture where there is one, the drawn
 * footprint where there is not.
 *
 * The picture cannot simply be laid in. These boxes are the measured union of a
 * subject and its own week label, so the type stands directly on them, and that
 * week label is `text-hl-ink-soft` at 13.7px — small text, which needs 4.5:1.
 * On the bare slot ground it has 5.07:1, the tightest margin anywhere in the
 * section, so a photograph darkening that ground by even a tenth takes it under.
 *
 * `mix-blend-mode: screen` is what makes it safe, and safe by construction
 * rather than by measurement: screening can only lift a channel, never lower
 * one, so the composite is at least as light as the lavender beneath it whatever
 * the picture does. The 5.07:1 floor therefore holds for every pixel of every
 * photograph, including ones nobody has taken yet. It is the same reasoning the
 * slot's own grid already runs on, where a paper rule was chosen over an ink one
 * because a light line only ever lifts a label.
 *
 * At 0.55 the composite runs from the slot's own `#c9c7ec` where the picture is
 * black to `#e6e6f6` where it is white — and the step plate is `#E6E5FC`. So
 * the photograph is carried entirely by the two colours this section already
 * owns: it modulates between the patch and the plate rather than punching bright
 * holes in a pale surface.
 *
 * `isolate` is load-bearing. Without a stacking context of its own the blend
 * reaches past this box into the plate and everything else painted below it, and
 * the guarantee above only holds against the lavender.
 */
function WeekBackdrop({
  week,
  label,
  ratio,
  sizes,
  scale,
  className = "",
  style,
}: {
  week: DesignWeek;
  /** What the drawn slot names, while this week is still waiting for a photo. */
  label: string;
  ratio: string;
  sizes: string;
  scale: number;
  className?: string;
  style?: CSSProperties;
}) {
  if (!week.art) {
    return (
      <ImageSlot
        label={label}
        ratio={ratio}
        tone="light"
        backdrop
        className={className}
        style={style}
        scale={scale}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`isolate overflow-hidden bg-hl-lavender ${className}`}
      // `position` lives in `style` for the same reason it does on ImageSlot: a
      // caller placing this box passes `absolute` here, where it can win.
      style={{ position: "relative", ...style }}
    >
      {/* Cover, not contain. The slot it replaces was a ground, not a picture
          on show, and these boxes take their shape from the words in front of
          them — 1.20 to 1.90 across the five — so a contained square would sit
          in a field of its own ground and read as a pasted-in thumbnail. */}
      <Image
        src={week.art}
        alt=""
        fill
        sizes={sizes}
        className="object-cover opacity-55 mix-blend-screen"
      />
    </div>
  );
}

export default function Process() {
  const [design, funding, build, printer] = STEPS;
  const [viral, community] = ASIDES;

  return (
    <section
      id="how-it-works"
      aria-label="How Half Life works"
      className="hl-ground-wave relative z-0 isolate bg-[#232231] min-[1180px]:pb-[10vh]"
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
          2560, growing without limit.

          `aspect-ratio` is self-referential by definition and needs no
          container, which is why the hero's below-fold block is already written
          this way. Height is now 2474/1728 of the used width at every size, so
          it is the flat 1689px the cap was introduced to deliver.

          The trailing air below it is the section's `pb-[10vh]`. Viewport
          height, not the comp grid: this gap is the beat between two sections
          and what makes it feel long or short is how much screen is left to
          look at, not how wide the window is. */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ maxWidth: STAGE_CAP, aspectRatio: `${COMP_WIDTH} / ${STAGE_H}` }}
      >
        {/* Step 1 — design weeks */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(57, 164, 975, 547)}
        >
          {WEEK_BACKDROPS.map((slot, index) => (
            <WeekBackdrop
              key={slot.id}
              week={WEEKS[index]}
              label={slot.label}
              ratio={`${slot.w} × ${slot.h}`}
              sizes={ART_SIZES.stage}
              style={{ ...box(slot.x, slot.y, slot.w, slot.h), position: "absolute" }}
              scale={0.9}
            />
          ))}

          <h2
            className="absolute font-display font-bold"
            style={{
              ...at(147, 24),
              width: u(760),
              fontSize: u(40),
              lineHeight: 1.1,
            }}
          >
            {design.title}
          </h2>

          <p
            className="absolute whitespace-nowrap font-display font-extrabold"
            style={{
              ...at(363, 143),
              fontSize: u(104.167),
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {DESIGN_WEEKS.lead.subject}
          </p>
          <p
            className="absolute whitespace-nowrap font-semibold text-hl-ink-soft"
            style={{ ...at(437, 272), fontSize: u(26), lineHeight: 1 }}
          >
            {DESIGN_WEEKS.lead.week}
          </p>

          {DESIGN_WEEKS.rest.slice(0, 3).map((week, index) => (
            <div key={week.subject}>
              <p
                className="absolute whitespace-nowrap font-display font-bold"
                style={{
                  ...at(WEEK_MARKS[index].x - 57, 398),
                  fontSize: u(WEEK_MARKS[index].size),
                  lineHeight: 1,
                }}
              >
                {week.subject}
              </p>
              <p
                className="absolute whitespace-nowrap font-semibold text-hl-ink-soft"
                style={{
                  ...at(WEEK_MARKS[index].labelX - 57, 458),
                  fontSize: u(20),
                  lineHeight: 1,
                }}
              >
                {week.week}
              </p>
            </div>
          ))}

          {/* week 5 sets on two lines, centred — comp node 275:42 */}
          <p
            className="absolute text-center font-display font-bold"
            style={{
              ...at(671, 381),
              width: u(269),
              fontSize: u(45.736),
              lineHeight: 1.02,
            }}
          >
            breadboard
            <br />
            logic
          </p>
          <p
            className="absolute whitespace-nowrap font-semibold text-hl-ink-soft"
            style={{ ...at(784, 490), fontSize: u(20), lineHeight: 1 }}
          >
            {DESIGN_WEEKS.rest[3].week}
          </p>
        </div>

        {/* Step 2 — funding */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(812, 836, 823, 365)}
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
          {funding.slot && (
            <ImageSlot
              label={funding.slot.label}
              ratio={funding.slot.ratio}
              style={{ ...box(53, 109, 736, 155), position: "absolute" }}
              scale={1.05}
            />
          )}
          <p
            className="absolute whitespace-nowrap font-semibold"
            style={{ ...at(323, 273), fontSize: u(20), lineHeight: 1 }}
          >
            {funding.caption}
          </p>
        </div>

        {/* Step 3 — build */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(57, 1326, 958, 523)}
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
          {build.slot && (
            <ImageSlot
              label={build.slot.label}
              ratio={build.slot.ratio}
              style={{ ...box(111, 158, 736, 269), position: "absolute" }}
              scale={1.35}
            />
          )}
        </div>

        {/* Step 4 — the printer */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(731, 2004, 943, 470)}
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
          {printer.slot && (
            <ImageSlot
              label={printer.slot.label}
              ratio={printer.slot.ratio}
              style={{ ...box(106, 140, 736, 269), position: "absolute" }}
              scale={1.35}
            />
          )}
        </div>

        {/* Asides — small plates orbiting the band. Only where they sit
            differs; the plate itself is the same object twice. */}
        <Aside aside={viral} origin={[1114, 1451]} />
        <Aside aside={community} origin={[59, 2123]} />

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
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {design.title}
              </h2>
              {/* Same artwork-behind-the-pairing as the stage, in flow: the
                  backdrop is the group's own box rather than a comp offset. */}
              <div className="relative isolate mt-6 px-4 py-3">
                <WeekBackdrop
                  week={DESIGN_WEEKS.lead}
                  label="PCBs bench shot"
                  ratio="300 × 191"
                  sizes={ART_SIZES.lead}
                  className="-z-10"
                  style={{ position: "absolute", inset: 0 }}
                  scale={0.9}
                />
                <p className="font-display text-6xl font-extrabold tracking-[-0.03em] sm:text-7xl">
                  {DESIGN_WEEKS.lead.subject}
                </p>
                <p className="mt-1 font-semibold text-hl-ink-soft">
                  {DESIGN_WEEKS.lead.week}
                </p>
              </div>
              <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5">
                {DESIGN_WEEKS.rest.map((week) => (
                  <li
                    key={week.subject}
                    className="relative isolate px-3 py-3"
                  >
                    <WeekBackdrop
                      week={week}
                      label={`${week.subject} artwork`}
                      ratio="232 × 116"
                      sizes={ART_SIZES.grid}
                      className="-z-10"
                      style={{ position: "absolute", inset: 0 }}
                      scale={0.72}
                    />
                    <p className="font-display text-xl font-bold sm:text-2xl">
                      {week.subject}
                    </p>
                    <p className="text-sm font-semibold text-hl-ink-soft">
                      {week.week}
                    </p>
                  </li>
                ))}
              </ul>
            </Plate>
          </li>

          <StackConnector lean="right" />

          <li>
            <Plate>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {funding.title}
              </h2>
              {funding.slot && (
                <ImageSlot
                  label={funding.slot.label}
                  ratio={funding.slot.ratio}
                  className="mt-6 aspect-[736/155] w-full"
                />
              )}
              <p className="mt-4 font-semibold">{funding.caption}</p>
            </Plate>
          </li>

          <StackConnector lean="left" />

          <li>
            <Plate>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {build.title}
              </h2>
              {build.slot && (
                <ImageSlot
                  label={build.slot.label}
                  ratio={build.slot.ratio}
                  className="mt-6 aspect-[736/269] w-full"
                  scale={1.15}
                />
              )}
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
              {printer.slot && (
                <ImageSlot
                  label={printer.slot.label}
                  ratio={printer.slot.ratio}
                  className="mt-6 aspect-[736/269] w-full"
                  scale={1.15}
                />
              )}
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

