import type { CSSProperties } from "react";

import Image from "next/image";
import SignupForm from "@/components/signup-form";
import Wordmark from "@/components/wordmark";
import { BRAND } from "@/lib/content";
import { COMP_WIDTH, box, u } from "@/lib/stage";

const HOW_LABEL = "how does it work?";

/**
 * The hero plate, taken to half the grid.
 *
 * The comp draws it 1256 wide — 73% of the 1728 grid — which read too heavy
 * against the painting behind it: bg.png is framed on both edges and left open
 * through the middle, and a plate that wide spanned frame to frame and closed
 * the opening. At 864 it is half the grid, and since the stage is the viewport
 * up to its 1728 cap, that is literally 50vw at every width the comp layout
 * runs at.
 *
 * Once it is half the grid it is centred on the grid rather than left where the
 * comp's wider plate started, and that is the relationship bg.png was painted
 * for: the picture carries a pipe column down each edge and is left open
 * through the middle, so a centred plate sits in the opening and leaves both
 * columns to read. `.stage` and the art layer both cap at 1728 and centre, so
 * centring on the grid centres the plate over the painting's own centre at
 * every width. Vertically it keeps the comp's y — the caption and group shot
 * hold the lower left, so there is no free height to centre into.
 *
 * Everything set on the plate scales by the same factor and moves with it, so
 * the comp's internal composition survives intact at a smaller size rather
 * than being re-fitted by hand: offsets are still measured from the comp's own
 * plate origin, and only where that origin lands has changed. Every number
 * below is still the literal Figma pixel DESIGN.md says it is.
 */
const PLATE = { x: 276, y: 98, w: 1256, h: 677 } as const;
const PLATE_SCALE = 864 / PLATE.w;
const PLATE_W = PLATE.w * PLATE_SCALE;
const PLATE_H = PLATE.h * PLATE_SCALE;

/** bg.png's own pixels, driving the art layer's box. */
const ART = { w: 1920, h: 1080 } as const;

/**
 * The plate is centred in the fold, not at a fixed y on the comp grid.
 *
 * Now that the fold is a real viewport rather than a 1092-unit block, a fixed
 * y cannot stay centred in it: the number that centres the plate on a 16:9
 * screen leaves it high on a tall viewport and past the fold on a short one.
 * Centring it in the block holds at every shape - and on a 16:9 viewport,
 * where the painting exactly fills the fold, it lands on 486, the painting's
 * own centre, which is precisely where it sat before.
 */
const PLATE_SIZE = { width: u(PLATE_W), height: u(PLATE_H) } as const;

/** A comp length on the plate. */
function onPlateU(px: number) {
  return u(px * PLATE_SCALE);
}

/**
 * "how does it work?", now below the fold.
 *
 * The comp put it at y 970 in a 1092-tall hero, so it broke the fold by
 * sitting half in view — an invitation you could miss by not scrolling. It
 * gets its own block after a hero that is at least one viewport tall, so it is
 * reliably out of sight on load and is the first thing the scroll reveals.
 *
 * The block keeps the comp's own numbers: `howY` re-bases them from the comp's
 * 970 onto a short lead-in, and the block is exactly as tall as the comp's gap
 * from the plate's top to the end of the hero section — so the plate still
 * overhangs the band below by 79 and the connector still drops 179 into it,
 * unchanged.
 */
const HOW_LEAD = 96;
const HOW_BLOCK_H = HOW_LEAD + (1092 - 970);
const howY = (y: number) => HOW_LEAD + (y - 970);

export default function Hero() {
  return (
    <section
      id="signup"
      className="relative z-10 isolate bg-hl-ink"
    >
      <HeroArt />

      {/* ── Comp reproduction, 1180px and up ───────────────────────────── */}
      {/* The fold: exactly one viewport, which is what makes "below the fold"
          mean anything. `min-h` rather than `h`, so a viewport too short to
          hold the plate grows instead of clipping it -- either way the block
          is never shorter than the fold, so the header below is never dragged
          up into view.

          Three rows, 1fr / auto / 1fr, rather than a centred plate with the
          cue absolutely positioned: equal outer rows still centre the plate,
          but the cue is in flow, so on a short wide window the two cannot land
          on top of each other. */}
      <div className="stage hidden min-h-[100svh] grid-rows-[1fr_auto_1fr] justify-items-center min-[1180px]:grid">
        {/* The hero plate. Its three pieces were hand-placed absolute boxes
            on the comp grid; centred, that arithmetic was fighting itself, so
            the plate is a flex column instead and centring is structural. The
            comp still owns every size and the rhythm between them, scaled —
            and `justify-center` lands the group within 7 units of where the
            comp's own 123/109 padding put it, so nothing moved by converting.
            `text-center` is set here rather than per-child so it reaches the
            signup form's own status line too, and does not reach the stacked
            layout, which stays left-aligned in its column. */}
        <div
          className="row-start-2 flex flex-col items-center justify-center bg-hl-blue-deep text-center"
          style={PLATE_SIZE}
        >
          <Wordmark
            as="h1"
            fontSize={onPlateU(226.768)}
            className="w-full"
          />

          {/* Balanced rather than ragged: at this measure the line wraps, and
              centred text that wraps unevenly reads as a mistake. */}
          <p
            className="text-balance text-hl-paper"
            style={{
              marginTop: onPlateU(27),
              width: onPlateU(851),
              fontSize: onPlateU(31.788),
              lineHeight: 1.1,
            }}
          >
            {BRAND.tagline}
          </p>

          <SignupForm
            style={{ marginTop: onPlateU(49), width: onPlateU(866) }}
            fontSize={onPlateU(30)}
          />
        </div>

        <ScrollCue
          className="row-start-3 self-end"
          style={{ marginBottom: u(56), width: u(29) }}
        />
      </div>

      {/* ── Below the fold ─────────────────────────────────────────────── */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ aspectRatio: `${COMP_WIDTH} / ${HOW_BLOCK_H}` }}
      >
        {/* "how does it work?" — still overhangs the band below */}
        <div
          className="absolute grid place-items-center bg-hl-paper"
          style={box(474, howY(970), 918, 201)}
        >
          <p
            className="whitespace-nowrap font-hand text-hl-ink"
            style={{
              // Masterpiece sets this line 4% wider than the 918 plate at the
              // comp's 100. 84 puts it at 87% of the plate, so the paper keeps
              // a margin instead of the ink running off its own edge.
              fontSize: u(84),
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {HOW_LABEL}
          </p>
        </div>
        <svg
          className="absolute"
          style={box(785, howY(1165), 111.5, 106)}
          viewBox="0 0 111.5 106"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path d="M111.5 0H33.5L0 106H71.5L111.5 0Z" fill="#EDEDED" />
        </svg>
      </div>

      {/* ── Stacked layout, below 1180px ───────────────────────────────── */}
      <div className="min-[1180px]:hidden">
        {/* pb leaves the cue its own room; without it `justify-center` centres
            the plate against the cue and the two crowd each other. */}
        <div className="relative flex min-h-[100svh] flex-col justify-center px-4 pt-16 pb-28 sm:px-8">
          <div className="bg-hl-blue-deep px-5 pt-7 pb-8 sm:px-9 sm:pt-10 sm:pb-11">
            <Wordmark
              as="h1"
              fontSize="clamp(3.2rem, 15vw, 7.5rem)"
              className="w-full"
            />
            <p
              className="mt-4 max-w-[34ch] text-hl-paper"
              style={{ fontSize: "clamp(1.05rem, 4.1vw, 1.5rem)", lineHeight: 1.25 }}
            >
              {BRAND.tagline}
            </p>
            <SignupForm
              className="mt-6"
              fontSize="clamp(1rem, 4.2vw, 1.375rem)"
            />
          </div>

          <ScrollCue className="absolute bottom-10 left-1/2 w-[clamp(1.1rem,4.6vw,1.6rem)] -translate-x-1/2" />
        </div>

        {/* Out of the viewport block above, so the header is below the fold on
            a phone too. `items-start` is the old `self-start`, and the
            overhang into the band below is unchanged. */}
        <div className="flex flex-col items-start px-4 sm:px-8">
          <div className="relative -mb-9 mt-14 bg-hl-paper px-5 py-3 sm:px-8 sm:py-4">
            <p
              className="font-hand text-hl-ink"
              style={{
                // Stepped down from 1.75rem/8vw/3.25rem: this line is nowrap
                // inside a self-sizing plate, and Masterpiece sets it wide
                // enough to push past a 320px viewport at the old floor.
                fontSize: "clamp(1.5rem, 7vw, 3rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {HOW_LABEL}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The scroll cue.
 *
 * Drawn in the page's icon grammar — square-cap strokes at the same 2.75
 * weight as every other icon here — rather than as one of the connector
 * bands, which are diagram parts and mean something specific. It is a real
 * link to the section it points at, because a downward arrow above the fold is
 * something people click, and that also puts it on the keyboard path.
 *
 * The nudge lives on the glyph, not on the link box, so it cannot fight the
 * box's own centring transform.
 */
function ScrollCue({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <a
      href="#how-it-works"
      className={`text-hl-cyan transition-colors hover:text-white focus-visible:text-white ${className}`}
      style={style}
    >
      <span className="sr-only">See how it works</span>
      <svg
        viewBox="0 0 24 40"
        fill="none"
        aria-hidden
        className="hl-scroll-cue block w-full"
      >
        <path d="M12 3V32" stroke="currentColor" strokeWidth={2.75} strokeLinecap="square" />
        <path
          d="M3 23L12 34L21 23"
          stroke="currentColor"
          strokeWidth={2.75}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </a>
  );
}

/**
 * One painted scene across the top of the hero, shown whole.
 *
 * bg.png is 1920x1080 and it is composed, not tileable: piping and foliage
 * frame its left and right edges, the fox sits in its lower-left corner, and
 * the middle is left open for the hero plate to land in. It was previously
 * drawn as two half-width tiles with the right one mirrored, which put the fox
 * and the framing on the page twice and — because a 16:9 painting cannot cover
 * a half-width, full-height box without losing about 55% of its width — cropped
 * off the frame that is the whole point of the picture.
 *
 * So the art layer takes the painting's aspect ratio rather than the section's:
 * full width, top-aligned, nothing cropped and nothing repeated. The box is cut
 * to 1920/1080, so `object-cover` has nothing to crop and cannot leave a
 * hairline of bare ink the way `object-contain` would under sub-pixel rounding.
 * Below the picture is the ink the page already stands on.
 *
 * It caps at the comp's own 1728 and centres, exactly as `.stage` does. Past
 * that width an uncapped 16:9 box grows taller than the 1092-unit section and
 * the clip takes the fox's body and the bottom-right cloud with it — and the
 * ink shoulders it leaves at the sides are the ones every other band on the
 * page already has.
 */
function HeroArt() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: COMP_WIDTH, aspectRatio: `${ART.w} / ${ART.h}` }}
      >
        <Image
          src="/art/bg.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1728px) 1728px, 100vw"
          className="object-cover"
        />
        {/* The scene dissolves into the ink at its own lower edge rather than
            at a fixed distance from the bottom of the section, so the fade
            scales with the picture instead of eating a third of it on a
            phone. */}
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-linear-to-b from-transparent to-hl-ink" />
      </div>
    </div>
  );
}
