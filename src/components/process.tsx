import ImageSlot from "@/components/image-slot";
import { ASIDES, DESIGN_WEEKS, STEPS } from "@/lib/content";
import { at, band, box, u } from "@/lib/stage";

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
 * `label` and `ratio` record the artwork each one wants; the slots render as
 * decorative backdrops, so neither is drawn.
 */
const WEEK_BACKDROPS = [
  { id: "week-1", label: "PCBs bench shot", x: 341, y: 125, w: 300, h: 191 },
  { id: "week-2", label: "CAD screen", x: 13, y: 380, w: 139, h: 116 },
  { id: "week-3", label: "synth build", x: 180, y: 380, w: 197, h: 116 },
  { id: "week-4", label: "display test", x: 398, y: 380, w: 232, h: 116 },
  { id: "week-5", label: "breadboard rig", x: 649, y: 363, w: 313, h: 165 },
] as const;

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
 * every width this layout is ever shown at.
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
          intrinsic height and has to be told one. 2474 is not arbitrary: it is
          the bottom edge of the lowest plate — step 4 at 2004 + 470 — so the
          stage is exactly its own content and nothing more.

          The trailing air below it is the section's `pb-[10vh]`. Viewport
          height, not the comp grid: this gap is the beat between two sections
          and what makes it feel long or short is how much screen is left to
          look at, not how wide the window is. */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ maxWidth: STAGE_CAP, height: u(2474) }}
      >
        {/* Step 1 — design weeks */}
        <div
          className="absolute bg-hl-lavender-pale text-hl-ink"
          style={box(57, 164, 975, 547)}
        >
          {WEEK_BACKDROPS.map((slot) => (
            <ImageSlot
              key={slot.id}
              label={slot.label}
              ratio={`${slot.w} × ${slot.h}`}
              tone="light"
              backdrop
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
                <ImageSlot
                  label="PCBs bench shot"
                  ratio="300 × 191"
                  tone="light"
                  backdrop
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
                    <ImageSlot
                      label={`${week.subject} artwork`}
                      ratio="232 × 116"
                      tone="light"
                      backdrop
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

