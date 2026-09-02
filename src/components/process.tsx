import ImageSlot from "@/components/image-slot";
import { ASIDES, DESIGN_WEEKS, STEPS } from "@/lib/content";
import { at, box, u } from "@/lib/stage";

/**
 * The connector bands, verbatim from the comp's exported vectors. Each is a
 * quadrilateral whose two ends differ in width, so the band visibly thickens
 * or thins along its run instead of reading as a uniform rule.
 *
 *   275:181  hero arrow, drops out of "how does it work?"   (lives in Hero)
 *   275:132  step 1 bottom-right  ->  step 2 top-left
 *   275:133  step 2 bottom-left   ->  step 3 top-right
 *   275:148  step 3 bottom-right  ->  step 4 top-left
 */
const CONNECTORS = [
  {
    id: "one-to-two",
    x: 780,
    y: 694.5,
    w: 253.5,
    h: 154,
    d: "M110.5 0H0L121 154H253.5L110.5 0Z",
  },
  {
    id: "two-to-three",
    x: 803.5,
    y: 1172.5,
    w: 217.5,
    h: 180,
    d: "M113 180H0L96.5 0H217.5L113 180Z",
  },
  {
    id: "three-to-four",
    x: 677.5,
    y: 1842.5,
    w: 318.5,
    h: 183.5,
    d: "M145.5 0H0L145.5 183.5H318.5L145.5 0Z",
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

export default function Process() {
  const [design, funding, build, printer] = STEPS;
  const [viral, community] = ASIDES;

  return (
    <section
      id="how-it-works"
      aria-label="How Half Life works"
      className="relative z-0 isolate bg-hl-ink"
    >
      <SchematicGround />

      {/* ── Comp reproduction, 1180px and up ───────────────────────────── */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ height: u(2550) }}
      >
        {/* Step 1 — design weeks */}
        <div
          className="absolute bg-hl-paper text-hl-ink"
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
          className="absolute bg-hl-paper text-hl-ink"
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
          className="absolute bg-hl-paper text-hl-ink"
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
          className="absolute bg-hl-paper text-hl-ink"
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

        {/* Asides — small plates orbiting the band */}
        <Aside
          aside={viral}
          className="absolute"
          style={box(1114, 1451, 555, 261.227)}
          titleAt={at(44.5, 33.4)}
          bodyAt={at(21.4, 106.2)}
        />
        <Aside
          aside={community}
          className="absolute"
          style={box(59, 2123, 555, 261.227)}
          titleAt={at(44.5, 33.4)}
          bodyAt={at(21.4, 106.2)}
        />

        {/* Connectors, drawn last so they ride over the plates they join */}
        {CONNECTORS.map((connector) => (
          <svg
            key={connector.id}
            className="absolute"
            style={box(connector.x, connector.y, connector.w, connector.h)}
            viewBox={`0 0 ${connector.w} ${connector.h}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <path d={connector.d} fill="var(--color-hl-paper)" />
          </svg>
        ))}
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
    <div className="bg-hl-paper px-5 py-7 text-hl-ink sm:px-8 sm:py-9">
      {children}
    </div>
  );
}

function StackConnector({ lean }: { lean: "left" | "right" }) {
  const d =
    lean === "right"
      ? "M30 0H110L180 120H90L30 0Z"
      : "M90 0H170L105 120H20L90 0Z";
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

type AsideProps = {
  aside: (typeof ASIDES)[number];
  className?: string;
  style?: React.CSSProperties;
  titleAt?: { left: string; top: string };
  bodyAt?: { left: string; top: string };
  stacked?: boolean;
};

function Aside({
  aside,
  className = "",
  style,
  titleAt,
  bodyAt,
  stacked = false,
}: AsideProps) {
  if (stacked) {
    return (
      <div className="bg-hl-lavender px-5 py-6 text-hl-ink sm:px-7">
        <h3 className="font-display text-xl font-bold sm:text-2xl">
          {aside.title}
        </h3>
        <p className="mt-3 text-[0.975rem] leading-relaxed sm:text-base">
          {aside.body}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-hl-lavender text-hl-ink ${className}`}
      style={style}
    >
      <h3
        className="absolute font-display font-bold"
        style={{
          ...titleAt,
          width: u(490),
          fontSize: u(30.833),
          lineHeight: 1.1,
        }}
      >
        {aside.title}
      </h3>
      <p
        className="absolute"
        style={{
          ...bodyAt,
          width: u(513.889),
          fontSize: u(22.269),
          lineHeight: u(28),
        }}
      >
        {aside.body}
      </p>
    </div>
  );
}

/** A faint measured grid so the ink ground reads as a board, not a void. */
function SchematicGround() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 opacity-[0.16]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, var(--color-hl-cyan) 0 1px, transparent 1px 96px), repeating-linear-gradient(to bottom, var(--color-hl-cyan) 0 1px, transparent 1px 96px)",
      }}
    />
  );
}
