import type { CSSProperties } from "react";

import Image from "next/image";
import SignupForm from "@/components/signup-form";
import Wordmark from "@/components/wordmark";
import { BRAND } from "@/lib/content";
import { COMP_WIDTH, band, box, u } from "@/lib/stage";

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
 * The painting's dissolve, as a mask on the picture rather than a scrim over
 * it.
 *
 * It used to be a `<div>` of `transparent -> hl-blue-deep` laid on top. That works
 * only while the thing underneath is flat colour: the ground now carries the
 * raked-arc pattern, and an opaque scrim would paint the texture out again
 * exactly where the dissolve is supposed to be revealing it. Masking the
 * picture instead takes the painting to nothing and lets whatever the room is
 * standing on come up through it, so the pattern arrives as the painting
 * leaves — one handoff instead of two.
 *
 * The stops are `1 - smoothstep(t)` sampled every eighth over the run, not a
 * straight line. A linear ramp is the severe one: alpha is continuous but its
 * slope is not, so the eye finds the kink where the fade starts and the kink
 * where it stops, and reads them as two edges drawn across the picture.
 * Smoothstep leaves 1 and arrives at 0 with zero slope, so neither end has a
 * position to find. The run is the bottom 28% against the old 22% — longer,
 * but the first quarter of it is still above 94% opacity, so the fox in the
 * lower-left corner keeps roughly the exposure it had and only the last
 * sliver, which is what has to be gentle, gives up more than before.
 */
const ART_FADE = [
  "linear-gradient(to bottom",
  "#000 0 72%",
  "rgb(0 0 0/.94) 76%",
  "rgb(0 0 0/.80) 80%",
  "rgb(0 0 0/.61) 84%",
  "rgb(0 0 0/.39) 88%",
  "rgb(0 0 0/.20) 92%",
  "rgb(0 0 0/.06) 96%",
  "transparent 100%)",
].join(",");

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
/**
 * How wide the wordmark art runs on the stage.
 *
 * 604.8 is the plate column's 864 taken down 30%, which is where this was
 * asked to sit. It is now its own number rather than `u(PLATE_W)`: at 70% of
 * the column the mark no longer spans it, so the two have to be free to differ
 * — see `PLATE_SIZE` below, which holds the column at the comp's half-grid so
 * that shrinking the mark does not drag the tagline and the form in with it.
 *
 * What the number buys, since the file carries its own inset: the ink is 1125
 * of a 1280 canvas and the box crops nothing horizontally, so the visible mark
 * is 88% of the box — 532 units. Height follows at 0.7 to 1, so it stands 423.
 *
 * Worth knowing before this moves again. 532 of ink sits *under* the 585
 * tagline and the 596 form beneath it, so the mark is no longer the widest
 * thing in the column; it still leads on mass, standing 423 tall against a
 * 22px line, but the three widths are now close enough to read as an
 * near-miss rather than a decision. The two clean stops either side are
 * `u(678)`, where the ink lands on the form's own 596 and the group shares one
 * edge, and `u(PLATE_W)`, where it spans the column outright.
 *
 * The fold has room to spare: 423 for the mark, 172 for the copy and form, 90
 * for the cue — 685 against a 16:9 fold's 972, so anything squarer than 2.5:1
 * fits outright and `min-h` grows the block rather than clipping it.
 */
const LOGO_STAGE_W = u(604.8);

/**
 * The stacked layout's own width, also taken down 30% — 60 to 42, and the
 * ceiling below from 24rem to 16.8rem.
 *
 * This one is worth watching. The column here is not the comp's plate but
 * whatever the phone's padding leaves — 318 units on a 390 screen — so the
 * stage's proportions do not carry over. At 42 the mark's ink is 144 of that
 * 318, which sets it at about half the width of the tagline block beneath it,
 * and a wordmark narrower than its own tagline stops reading as the page's
 * h1. It was 60 for that reason. 55 is roughly where the mark and the tagline
 * come level, if this wants pulling back.
 */
const LOGO_FLOW_VW = 42;

/**
 * The plate is a content column, not a box with a ground, so it is sized to
 * hold what it carries rather than to a drawn rectangle.
 *
 * `minHeight`, not `height`: at the comp's 466 a wordmark this size spilled
 * out of its grid row and into the scroll cue's. The width is the comp's
 * half-grid plate outright, and deliberately not the mark's: the column has to
 * hold a 585 tagline and a 596 form whatever the wordmark above them is doing,
 * so a mark taken below the column's width shrinks alone rather than crushing
 * the two rows under it.
 */
const PLATE_SIZE = {
  width: u(PLATE_W),
  minHeight: u(PLATE_H),
} as const;

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

/**
 * The band that drops out of the plate into the process section — comp node
 * 275:181, and the first of the page's four connectors. It shares the other
 * three's centreline-and-mean construction so it shares their taper: it is the
 * page's opening move, and an opening that flattens while the three joints
 * below it gather would read as a different drawing.
 *
 * The comp's own axis and 70.6 mean, so it keeps its weight and its 6 units of
 * overlap into the plate above; only the distribution changes.
 */
const ARROW = band([857.5, howY(1165)], [820.75, howY(1165) + 106], 70.6);

export default function Hero() {
  return (
    <section
      id="signup"
      className="relative z-10 isolate"
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
          className="row-start-2 flex flex-col items-center justify-center text-center"
          style={PLATE_SIZE}
        >
          {/* `cqw` rather than `vw`: the stage caps at 1728 and centres, so a
              real `vw` would keep growing the mark on a wider monitor while
              everything around it had stopped. Against the stage it is 35vw up
              to the cap and 35% of the composition after it. `fontSize` is
              still here for the live-type branch, which renders if LOGO_SRC is
              ever cleared again. */}
          <Wordmark
            as="h1"
            art
            artWidth={LOGO_STAGE_W}
            fontSize={onPlateU(226.768)}
            className="w-full"
          />

          {/* One line, and sized so it stays one line.

              The measure is not a guess: set in Ubuntu 400, this sentence is
              25.301em wide, so its size and its length are the same number and
              only one of them is free. At `u(32.8)` the line runs 830 units
              inside the 864 column, leaving 17 either side — enough that the
              metric-adjusted fallback face can miss Ubuntu's advances by 3.9%
              before anything touches the edge.

              It has to be a stage unit rather than a fixed px, which is what
              was actually causing the wrap: at a flat 2rem the sentence needed
              810px of a box that is only 428px at a 1280 window, because the
              box scaled with the stage and the type did not. In `cqw` the two
              move together, so the ratio holds at every width this layout runs
              at — and at the stage's 1728 cap it lands on 32.8px, which is
              where the 2rem was aiming.

              No `width`, no `text-balance`: with one line there is nothing to
              balance, and an explicit measure narrower than the line would only
              give the text something to overflow. As a centred flex item it
              takes its own content width. */}
          <p
            className="font-tagline whitespace-nowrap text-hl-paper"
            style={{
              marginTop: onPlateU(27),
              fontSize: u(32.8),
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
          style={{ marginBottom: u(56) }}
          fontSize={u(22)}
        />
      </div>

      {/* ── Below the fold ─────────────────────────────────────────────── */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ aspectRatio: `${COMP_WIDTH} / ${HOW_BLOCK_H}` }}
      >
        {/* "how does it work?" — still overhangs the band below */}
        <div
          className="absolute grid place-items-center bg-hl-lavender-pale"
          style={box(474, howY(970), 918, 201)}
        >
          <p
            className="whitespace-nowrap font-display font-bold text-hl-ink"
            style={{
              // The comp's own 100, restored. The 84 it had been stepped down
              // to was compensation for Masterpiece, which set this line 4%
              // past its 918 plate; Urbanist has room to spare at 100.
              fontSize: u(100),
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {HOW_LABEL}
          </p>
        </div>
        <svg
          className="absolute"
          style={box(ARROW.x, ARROW.y, ARROW.w, ARROW.h)}
          viewBox={`0 0 ${ARROW.w} ${ARROW.h}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          {/* The header plate's own material, like the three bands below it
              carry the step plates'. It was a hardcoded #EDEDED, which is the
              one way a fill can drift out of step with the surface it is meant
              to be continuous with. */}
          <path d={ARROW.d} fill="var(--color-hl-lavender-pale)" />
        </svg>
      </div>

      {/* ── Stacked layout, below 1180px ───────────────────────────────── */}
      <div className="min-[1180px]:hidden">
        {/* pb leaves the cue its own room; without it `justify-center` centres
            the plate against the cue and the two crowd each other. */}
        <div className="relative flex min-h-[100svh] flex-col justify-center px-4 pt-16 pb-28 sm:px-8">
          <div className="bg-hl-blue-deep px-5 pt-7 pb-8 sm:px-9 sm:pt-10 sm:pb-11">
            {/* 42vw here, with a ceiling. Uncapped it is right on a phone and
                wrong by 768, where even 42vw is 323 across for a mark sitting
                above a form — the stacked layout runs to 1180, and 16.8rem
                holds it at a wordmark's size rather than a splash screen's.
                Both numbers are the old 60 and 24rem less 30%. */}
            <Wordmark
              as="h1"
              art
              artWidth={`min(${LOGO_FLOW_VW}vw, 16.8rem)`}
              fontSize="clamp(3.2rem, 15vw, 7.5rem)"
              className="w-full"
            />
            <p
              className="mt-4 max-w-[34ch] font-tagline text-hl-paper"
              style={{ fontSize: "clamp(1.05rem, 4.1vw, 1.5rem)", lineHeight: 1.25 }}
            >
              {BRAND.tagline}
            </p>
            <SignupForm
              className="mt-6"
              fontSize="clamp(1rem, 4.2vw, 1.375rem)"
            />
          </div>

          <ScrollCue
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            fontSize="clamp(0.8rem, 3vw, 1rem)"
          />
        </div>

        {/* Out of the viewport block above, so the header is below the fold on
            a phone too. `items-start` is the old `self-start`, and the
            overhang into the band below is unchanged. */}
        <div className="flex flex-col items-start px-4 sm:px-8">
          <div className="relative -mb-9 mt-14 bg-hl-lavender-pale px-5 py-3 sm:px-8 sm:py-4">
            <p
              className="font-display font-bold text-hl-ink"
              style={{
                // The floor was held down by Masterpiece, which set this line
                // wide enough to push past a 320px viewport; Urbanist sets it
                // narrower, so the plate can carry the comp's weight again.
                fontSize: "clamp(1.75rem, 8vw, 3.25rem)",
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
/**
 * The cue, as its own word rather than a chevron.
 *
 * Set in the display face, uppercase, tracked 0.14em — the treatment the image
 * slots already use for their labels, which is this page's grammar for a small
 * word that is naming something rather than saying it. The CTA beside it is
 * lowercase because a button speaks; a cue labels.
 *
 * The bob stays and is now load-bearing. A chevron points on its own; a word
 * does not, so the one thing still saying *down* is the 16% translate the
 * animation gives it.
 *
 * `text-hl-paper`, and now in every state rather than only at rest.
 *
 * Cyan used to carry the hover and the focus. That was already the second
 * attempt — the arrow's original classes asked for cyan at rest, and both
 * paths carried a hardcoded `stroke="white"`, so no `color` ever reached the
 * glyph and neither did the hover; moving cyan to the interaction state was
 * the fix. On the steel ground it does not survive there either. Cyan is
 * 4.60:1 on bare steel, 4.27:1 over one arc of the ground pattern and 3.97:1
 * where two cross, and this word is 12.8-16px, so it owes 4.5:1 in every
 * state. Nothing in the palette between cyan and paper clears it: on the
 * worst ground only paper, lavender-pale, blue-pale and white do.
 *
 * So the cyan moved off the text and onto a rule under it. The word holds at
 * 5.70:1 whatever the arcs are doing, the interaction is still signalled in
 * the page's own interaction colour, and an underline is non-text — it owes
 * 3:1 and has 3.97:1. Focus is left to the global `:focus-visible` ring,
 * which is the same cyan at the same 3:1 and is the treatment every other
 * control on the page gets; a colour change underneath it was never what was
 * doing the work.
 */
function ScrollCue({
  className = "",
  style,
  fontSize,
}: {
  className?: string;
  style?: CSSProperties;
  /** The label's size, as a CSS length. */
  fontSize?: string;
}) {
  return (
    <a
      href="#how-it-works"
      // `py-1.5` is the tap target, not spacing: the word is a 16-22px line, and
      // 12px of vertical padding is what takes the box past the 24px floor.
      className={`inline-block px-2 py-1.5 font-display font-bold uppercase text-hl-paper decoration-hl-cyan decoration-2 underline-offset-[0.3em] hover:underline ${className}`}
      style={{ ...style, fontSize, letterSpacing: "0.14em" }}
    >
      {/* The visible word first and the rest of the sentence after it, so the
          accessible name reads "scroll to see how it works" — a name that
          contains the label on screen. An `aria-label` of "See how it works"
          over the word "scroll" would have been the natural move and would
          have failed WCAG 2.5.3, which asks the two to agree.

          The negative margin takes back the trailing letter-space that 0.14em
          adds after the final L, which would otherwise push the word half a
          space left of the centre it is being centred on. */}  
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
 * Below the picture, and up through its dissolve, is the steel ground and the
 * raked-arc pattern that the hero and the process section now share from one
 * box in `page.tsx` — so the painting resolves into the room it hands off to
 * rather than into a flat field that the room's texture then switches on in.
 *
 * It spans the screen at every width. Capped at the comp's 1728 it left ink
 * shoulders on anything wider, and the painting is the hero's ground rather
 * than an object standing on it.
 *
 * `max-height: 100%` is the guard that buys. Uncapped, a 16:9 box on a wide
 * screen grows taller than the section it sits in -- a 2560 window only 800
 * tall wants 1440 of painting against 1018 of section -- and `overflow-hidden`
 * would take the difference off the bottom as a hard cut, dissolve and all.
 * Clamped to the section instead, the box stops being 16:9 and `object-cover`
 * trims the picture rather than the layer, so the fade still lands on the
 * bottom edge that is actually visible. Below that width nothing is cropped at
 * all: the box is the painting's own ratio and cover has nothing to take.
 */
function HeroArt() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${ART.w} / ${ART.h}`, maxHeight: "100%" }}
      >
        {/* The scene dissolves at its own lower edge rather than at a fixed
            distance from the bottom of the section, so the fade scales with
            the picture instead of eating a third of it on a phone.

            Size and repeat are pinned for the same reason the ground patterns
            pin theirs: a gradient has no intrinsic dimensions, so it is drawn
            at the size of its box by a rule worth stating rather than leaning
            on silently. `-webkit-` alongside, for Safari before 15.4. */}
        <Image
          src="/art/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover"
          style={{
            maskImage: ART_FADE,
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskImage: ART_FADE,
            WebkitMaskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}
