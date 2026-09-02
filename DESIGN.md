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
| `--color-hl-blue`     | `#619cc3` | Carousel rail ground, disabled CTA                        |
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
  comp's 100, and the hero caption's first letter fell 14 units off the left
  edge of the stage. The plate line is set at 84; the caption keeps its size
  and its frame moved right instead, so it still rakes across the group shot.
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

Rhythm: more space above a heading than below it; tight groups, generous band
separation. The `how does it work?` plate deliberately overhangs the band below
it so it breaks the fold.

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
  Currently standing in for the carousel's project photos, the hero's group
  shot, and the artwork behind each week pairing in step 1.

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
- **Group shot** — one photograph of every project under "here's what you'll
  make!", where the comp scattered five separate prints (275:183). It keeps
  the pile's angle (-17.21deg) and its centre of mass, so the corner carries
  the same weight; the box clears the signup form above and the "how does it
  work?" plate below, and rides the hero plate's lower-left corner as the
  tallest scattered print did. The handwritten caption rakes within 1.4deg of
  it and is lifted above it on `z-index` with the carousel's ink shadow — a
  pile has gaps to read the caption through, one print does not.
- **CTA** — square cyan block with the comp's exported check vector. Hover and
  focus go to white; pending goes to `--color-hl-blue` with a spinner.
- **Rail** — a continuously travelling belt built on a native scroll container,
  and the one component with no controls of its own: no buttons, no progress
  bar, no scrollbar. A moving belt already says there is more, and a cycle bar
  on an endless loop measures nothing. The card set is repeated three times so
  the wrap point is never in view, and the scroller carries `tabindex="0"` so
  the keyboard path survives the missing buttons.

Icons are drawn SVG at a consistent square-cap 2.75px stroke. No icon fonts, no
emoji, no unicode glyphs standing in for icons.

## Motion

**Nothing enters on scroll.** Plates, cards, asides, FAQ answers, the hero
group shot and the connector bands all ship in their finished state — no
fade, no rise, no stagger, no draw-on. Reinterpreting every scrolled section as
a staggered list is animation debt, not a thesis.

The production line in particular is drawn in full from the first paint. It is
a diagram of the ten-week programme, and a diagram is either legible or it is
not; making it a reward for scrolling would mean the reader who lands halfway
down the page sees a broken line. The bands' meaning is spatial, not temporal.

The page has exactly one authored moment and one piece of feedback:

- **The belt runs.** The `What can I build?` rail is the one place the
  production line is still in motion: finished work travels past at a constant
  mechanical pace, linear like the bands are drawn, one card every 8s at every
  breakpoint. Speed is derived from the measured card pitch rather than fixed
  in pixels, so a phone and the comp stage read at the same tempo. Nothing
  snaps — snapping would yank a card out from under the cursor at the exact
  moment you stopped the belt to look at it.
- **The confirmation check strokes itself in.** On a successful signup the
  comp's exported tick draws over 460ms on `stroke-dashoffset` with
  `cubic-bezier(0.16, 1, 0.3, 1)`, spent at the one moment a state actually
  changes.

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
