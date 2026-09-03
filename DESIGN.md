# DESIGN.md — Half Life

Recorded from the built landing page, not from intention. Ground truth is
`src/app/globals.css` (tokens) and `src/components/*` (usage).

## Atmosphere

A ten-week hardware production line, drawn as the line itself. The page reads
like control-panel silkscreen laid over a workshop: flat plates, hard square
corners, no shadows, and a thick cyan band that physically links each stage of
the programme to the next. Energetic and workshop-bright rather than sleek —
the audience is 13–18 and the promise is a soldering iron, not a SaaS trial.

Light or dark is decided by the scene, not by category: this is read on a phone
in a bedroom or on a school laptop, so the ground is ink and the informational
plates are paper, giving the copy the highest-contrast surface on the page.

## Color

Palette is the Figma "color scheme" frame (node `275:222`) verbatim. No
additional hues were invented.

| Token                 | Value     | Role                                                     |
| --------------------- | --------- | -------------------------------------------------------- |
| `--color-hl-ink`      | `#31222c` | Page ground, process band, footer, image-slot interiors  |
| `--color-hl-paper`    | `#ededed` | Step plates, FAQ plates, carousel cards, body text on ink |
| `--color-hl-cyan`     | `#8ed3dc` | Connector bands, primary CTA, focus ring, section accents |
| `--color-hl-blue`     | `#619cc3` | Carousel belt ground (inset in cyan), disabled CTA        |
| `--color-hl-blue-deep`| `#397cbe` | Hero plate                                                |
| `--color-hl-periwinkle`| `#a39bd6`| FAQ band                                                  |
| `--color-hl-lavender` | `#c9c7ec` | Aside plates                                              |

Strategy: **full palette** — four named band roles, each owning a whole scroll
region rather than appearing as an accent. The scroll reads
`hero art → ink → cyan/blue → periwinkle → ink`.

Secondary text is never gray. It is tinted from the surface's own foreground:

- `--color-hl-ink-soft` = ink 80% over paper — 5.14:1 on `#ededed`
- `--color-hl-paper-soft` = paper 78% over ink — used on the ink footer

Verified contrast: ink on cyan 8.98:1, ink on periwinkle 5.92:1, ink on
lavender 9.22:1, ink on paper 12.3:1, paper on ink 12.3:1. On a light image
slot the worst case is a soft week label over a paper grid rule, at 5.10:1. Text on the deep
blue hero plate is 3.64:1 and is therefore only ever set at large scale
(≥ 24px, or ≥ 18.66px bold), which is how the comp sets it.

## Typography

- **Hand** — Masterpiece, `--font-hand`. The comp's own brush face, and the
  page's bookends: the wordmark (hero and footer), the two hand-angled hero
  labels, and the footer column labels. One 400 weight only.
- **Display** — Bricolage Grotesque (variable), `--font-display`. Everything
  between the bookends: process, carousel and FAQ headlines, step titles, week
  subjects. Tracking −0.02em to −0.045em at display sizes.
- **Body** — Archivo (variable), `--font-body`. Paragraphs, captions, form
  fields, links — including inside the hero and footer, which take the brush
  face on their display type only.

Archivo and Bricolage are self-hosted through `next/font/google`; Masterpiece
through `next/font/local` from `public/fonts`. It is free per the author's
read-me, which asks for a charitable donation on commercial use.

Masterpiece is not a drop-in for Bricolage's metrics, and three things follow
from that:

- **No bold, ever.** It ships one 400 weight whose strokes overhang their
  advances — `I` carries 0.52em of ink on a 0.32em advance — so it is already
  heavy, and a synthesised bold smears the strokes into each other.
  `.font-hand` sets `font-synthesis-weight: none`, and the weight utilities
  were dropped from the elements that use it.
- **It sets wider.** "how does it work?" ran 4% past its 918 plate at the
  comp's 100, so the plate line is set at 84 instead — 87% of the plate, which
  keeps a paper margin rather than running the ink off its own edge.
- **Its cap height is 0.568em** against Bricolage's ~0.72, so a size carried
  over unchanged reads a fifth smaller. The footer's column labels are set at
  0.95rem where they were `text-xs`, which lands the caps where they were.

Scale is not a fixed ramp. Inside the comp stage every size is a comp pixel
expressed in `cqw`; outside it, sizes are `clamp()` pairs. Body measure stays
under 75ch by capping paragraph widths (aside body 513px of the comp grid, FAQ
answer 665px).

## Layout

Two systems, deliberately:

1. **Comp stage** (≥ 1180px) — `.stage` sets `container-type: inline-size` and
   caps at the comp's own 1728px. Every offset and size is written as the
   literal Figma pixel through `u()` in `src/lib/stage.ts`, so the hero and the
   process diagram reproduce the comp exactly and scale continuously instead of
   snapping between breakpoints.
2. **Flow layout** (< 1180px) — the same content stacked, with the connector
   bands re-drawn as short vertical tapers between plates.

The hero is split in two: a fold block that is at least one viewport tall
(`min-h: 100svh`), and a second block below it carrying "how does it work?".
The comp put that header at y 970 of a 1092-tall hero, so it broke the fold by
sitting half in view — an invitation you could miss. Below the fold it is
reliably out of sight on load and is the first thing a scroll reveals, with the
cue pointing at it. The fold block is three grid rows, `1fr / auto / 1fr`:
equal outer rows centre the plate, and the cue lives in the last row in flow
rather than absolutely positioned, so on a short wide window the two cannot
land on top of each other. The below-fold block keeps the comp's own numbers
re-based onto a 96-unit lead-in, so the header still overhangs the band beneath
it by 79 and the connector still drops 179 into it.

Because the fold is now a real viewport, the plate is centred in that block
rather than at a fixed y: one number cannot stay centred in a height that
varies. On a 16:9 viewport, where the painting exactly fills the fold, it lands
on 486 — the painting's own centre, exactly where it sat before.

One deliberate departure from the comp: the hero plate and everything set on
it are scaled to 0.688 of their comp size, taking the plate from 1256 wide to
864 — half the grid, and literally 50vw at every width the stage layout runs
at — and the group is then centred on the grid rather than left at the comp's
x. The comp's 73%-wide plate spanned the painting behind it frame to frame and
closed its open middle; at half the width, centred, it sits in the opening
bg.png was painted to leave and both pipe columns read. `.stage` and the art
layer both cap at 1728 and centre, so the plate is centred over the painting's
own centre at every width.

Two consequences. The comp's hand-placed absolute boxes inside the plate are
gone: once the group is centred, per-child comp offsets fight the centring, so
the plate is a flex column with `items-center` / `justify-center` and centring
is structural. The comp still owns every size and the rhythm between them,
scaled, and `justify-center` reproduces the comp's own 123/109 vertical padding
to within 7 units. And the comp's caption and group shot are gone from the
hero: at half width and centred, the plate's footprint covered both, and the
carousel band already answers what you can build. Uncovering that corner also
lets the painting's fox read for the first time.

Rhythm: more space above a heading than below it; tight groups, generous band
separation. The `how does it work?` plate still overhangs the band below it,
though it no longer breaks the fold -- it now sits wholly beneath one.

## Components

- **Plate** — flat `#ededed` block, square corners, no border, no shadow. The
  only container in the system. Never nested.
- **Connector band** — filled SVG quadrilateral whose two ends differ in width
  (110→132, 121→113, 145→173 comp px), so the band thickens or thins along its
  run. Path data is the comp's exported vectors verbatim.
- **Image slot** (`image-slot.tsx`) — reserved artwork footprint drawn in the
  page's own grammar: ink plate, cyan registration ticks at the corners, a
  measured grid masked to the centre, and a label with the artwork's native
  size. Replace with `next/image` in place; the wrapper box is already correct.
  Currently standing in for the artwork behind each week pairing in step 1.
  The carousel's cards have taken their real photographs: `photo` on a
  `BuildCard` is optional, so a card without one still draws the slot and the
  belt can fill up a project at a time.

  Two variants. `tone="light"` swaps the ink plate for lavender, for slots that
  land on paper and carry the page's ink over them; its grid rules are drawn in
  paper rather than ink, because a dark grid pulled the soft week labels down
  to 3.3:1 while a light one only ever lifts them. `backdrop` drops the centred
  caption, which would collide with whatever is set over the slot, and takes it
  out of the accessibility tree, because a background image is decorative — the
  `label` and `ratio` stay as the in-source record of what artwork belongs
  there. Position comes from `style`, not a class: as a class, the component's
  own `relative` could not be beaten by a caller's `absolute`, and positioned
  slots silently fell into flow.
- **Week backdrops** — one light slot behind each subject-and-week pairing in
  step 1, each the measured union of its own two lines padded 22 across and 18
  down. Deliberately ragged rather than a uniform band: the comp hand-places
  the five at different heights, and squaring them into a row would flatten
  that. Neighbours clear each other by 19-28 and the plate by 13.
- **CTA** — square cyan block with the comp's exported check vector. Hover and
  focus go to white; pending goes to `--color-hl-blue` with a spinner.
- **Hero backdrop** — `public/art/bg.png`, one painted plant-room scene at
  1920x1080, shown whole. It is composed rather than tileable: piping and
  foliage frame its left and right edges, the fox sits in its lower-left
  corner, and the middle is left open — which is where the hero plate now
  sits. So the art layer takes the painting's aspect ratio instead of the
  section's — full width,
  top-aligned, capped and centred at the comp's 1728 exactly as `.stage` is,
  with nothing cropped and nothing repeated. 1092/1728 is taller than 1/1.778,
  so the picture always fits inside the stage's own height. It sits at 0.66
  opacity over ink and dissolves into it over the bottom 22% of its own box,
  so the fade scales with the picture rather than eating a third of it on a
  phone.
- **Confirmation plate** — the success state is a cyan plate absolutely
  positioned over the field row, exactly its footprint, `pointer-events-none`
  and `aria-hidden`, so nothing on the page moves while it is up and the field
  underneath stays reachable. Its sentence is set at 0.75em: that holds one
  line inside the comp stage's 866 and, where it wraps on a narrow phone, two
  lines still sit within the field's own 2.1667em. Announcement is not its job
  — a persistent `sr-only` live region carries every status, because a live
  region that mounts with its text already in it is unreliably read out.
- **Rail** — a continuously travelling belt built on a native scroll container,
  and the one component with no controls of its own: no buttons, no progress
  bar, no scrollbar. A moving belt already says there is more, and a cycle bar
  on an endless loop measures nothing. The card set is repeated three times so
  the wrap point is never in view, and the scroller carries `tabindex="0"` so
  the keyboard path survives the missing buttons.

  The comp ran the belt full-bleed across its 1728 grid with 386 cards. It is
  brought in to 1360 — card, gap, inset and card padding all times 1360/1728,
  so 386 cards become 304 and 3.31 of them stand in view exactly as before.
  The belt now reads as an object sitting inside the cyan band rather than as
  the band itself, and the cyan shows on all four sides of it: the band carries
  bottom padding to match the padding above its heading, where previously it
  ended on the blue block's own edge and the colour naming the section only
  ever read above the carousel.

  The 1360 wrapper is a container, and the belt's parts are sized in `cqw`
  against it rather than `vw` against the viewport. As `vw` they kept growing
  past the cap, and above 1360 the cards would have outgrown their own stage.

  Project photographs are contained, never cropped — a build is the thing on
  show, and a macropad with its ends cut off is not the macropad. The box is a
  4:3 frame the whole picture sits inside, and the paper left around it is the
  card's own colour, so it reads as a mount rather than a gap. The comp's
  portrait 329 x 377 could not hold this photography, which runs square to wide
  (1.05 to 1.83); where the frame lands inside that spread barely matters, as
  every ratio from 1.25 to 1.5 leaves the same ~19% of the box unused. What
  matters is that there is one ratio, so every card carries the same photo
  footprint and the row does not jump as it travels.

  Card width is set by the credit rather than by the comp: `width: max-content`
  is the width at which the line does not wrap, so the card is exactly as wide
  as its credit needs. The comp's 304 survives as the floor.

Icons are drawn SVG at a consistent square-cap 2.75px stroke. No icon fonts, no
emoji, no unicode glyphs standing in for icons.

## Motion

**Nothing enters on scroll.** Plates, cards, asides, FAQ answers and the
connector bands all ship in their finished state — no
fade, no rise, no stagger, no draw-on. Reinterpreting every scrolled section as
a staggered list is animation debt, not a thesis.

The production line in particular is drawn in full from the first paint. It is
a diagram of the ten-week programme, and a diagram is either legible or it is
not; making it a reward for scrolling would mean the reader who lands halfway
down the page sees a broken line. The bands' meaning is spatial, not temporal.

The page has one authored moment, one piece of feedback, and one standing
invitation:

- **The belt runs.** The `What can I build?` rail is the one place the
  production line is still in motion: finished work travels past at a constant
  mechanical pace, linear like the bands are drawn, one card every 8s at every
  breakpoint. Speed is derived from the set's measured pitch rather than fixed
  in pixels, so a phone and the comp stage read at the same tempo — averaged
  across the set, since a card is only as wide as its own credit. The position
  is held modulo that pitch and measured off rects rather than whole-pixel
  `offsetLeft`, so the loop comes back into range in one step and on identical
  content however far out something else has put the scroller. Nothing
  snaps — snapping would yank a card out from under the cursor at the exact
  moment you stopped the belt to look at it.
- **The confirmation passes down the line.** A successful signup is a part on
  the belt, not a terminus. A cyan plate wipes in over the email field from the
  left on a `clip-path` cut (320ms, `cubic-bezier(0.16, 1, 0.3, 1)`), the comp's
  exported tick draws itself over 460ms on `stroke-dashoffset`, the sentence
  holds for 3s, and the plate then carries on off the right (220ms,
  `cubic-bezier(0.4, 0, 1, 1)`) and hands back an empty field. It leaves in the
  direction it was travelling — retreating the way it came would read as the
  signup being undone — and it leaves faster than it arrives, because by then it
  has been read and the field is what is wanted. A clip cut is the only exit
  this world has: these plates are flat, square-cornered and shadowless, so
  there is nothing to fade or lift. Reaching the field early, by click or by
  tab, clears the plate ahead of its timer; a second submit replaces it
  outright.

- **The scroll cue beckons.** A downward arrow sits at the bottom of the fold,
  and it is the one element on the page whose entire meaning is a direction of
  travel — so it is the one place a loop earns its keep. A 16% nudge over 2.6s,
  on the glyph rather than the link box, which is doing the centring. Slow and
  small on purpose: a scroll hint that bounces reads as a toy, and this page is
  a workshop. It is a real link to `#how-it-works`, because an arrow above the
  fold is a thing people click, which also puts it on the keyboard path.

Supporting states are the smallest change that makes cause and result clear:
the CTA swaps to white on hover and focus, to `--color-hl-blue` with a spinner
while pending. Putting a pointer on the belt — or tabbing into it — stops it
where it stands: velocity decays on a 0.11s time constant, so it halts within
about 350ms and 5px, and winds back up on a slower 0.34s constant. A loaded
belt has mass, and it stops faster than it starts. The halt is the belt's whole
feedback vocabulary; it has no other controls to give feedback for.

Cost and fallbacks: nothing is ever hidden waiting for a trigger, and no
scroll-driven animation runs at all — the bands carry no `animation-timeline`,
so there is nothing to guard with `@supports` and nothing that degrades. The
belt is the page's only JavaScript motion: one `requestAnimationFrame` writing
`scrollLeft`, with no React render per frame. It never starts under
`prefers-reduced-motion: reduce`, and it cancels itself whenever it is not
earning its keep — stopped by hover or focus, scrolled out of view
(`IntersectionObserver`), or backgrounded with the tab. The rail is a real
scroll container underneath, so touch, trackpad and keyboard still drive it
directly whether or not the belt is running — which is what pays for having no
buttons. Stopping on hover and focus is not, on its own, a WCAG 2.2.2 pause
control; `prefers-reduced-motion: reduce` is what actually turns the motion
off.

## Accessibility

- Skip link to `#how-it-works`.
- `:focus-visible` is a 3px cyan outline with 3px offset, everywhere but the
  belt: cyan on `--color-hl-blue` is 1.77:1, so the rail's ring is ink (5.05:1)
  and inset, since a full-bleed scroller's outer ring would be clipped.
- The form has a real label, `aria-describedby`, `aria-invalid`, and an
  `aria-live` status region; errors name the problem and the recovery.
- Carousel slides are `role="group"` with `aria-roledescription="slide"`; the
  rail is `aria-roledescription="carousel"`, focusable, and arrow-scrollable.
  The two repeated copies behind it are `aria-hidden` and `inert`.
- Decorative art, connector bands and the schematic ground are `aria-hidden`.
- Only one `<h1>` is ever in the accessibility tree — the stage and flow
  layouts are mutually `display: none`.
