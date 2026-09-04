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

Palette is the Figma "color scheme" frame (node `275:222`) verbatim, plus one
hue added since: `--color-hl-indigo`, the asides' text colour.

| Token                 | Value     | Role                                                     |
| --------------------- | --------- | -------------------------------------------------------- |
| `--color-hl-ink`      | `#31222c` | Page ground, process band, footer, image-slot interiors  |
| `--color-hl-paper`    | `#ededed` | FAQ plates, carousel cards, body text on ink, hero header plate |
| `--color-hl-lavender-pale` | `#E6E5FC` | Step plates and the bands welding them — the section ground's own hue, lifted to a surface |
| `--color-hl-cyan`     | `#8ed3dc` | Connector bands, primary CTA, focus ring, section accents |
| `--color-hl-blue`     | `#619cc3` | Disabled CTA                                             |
| `--color-hl-yellow`   | `#ffdf5e` | Carousel card ground, behind the project photographs      |
| `--color-hl-yellow-pale`| `#fffcd8`| Carousel card border and caption band                    |
| `--color-hl-blue-deep`| `#397cbe` | Hero plate                                                |
| `--color-hl-periwinkle`| `#a39bd6`| FAQ band                                                  |
| `--color-hl-lavender` | `#c9c7ec` | Aside plates                                              |
| `--color-hl-indigo`   | `#34316c` | Aside text — title and body                               |

Strategy: **full palette** — named band roles owning whole scroll regions
rather than appearing as accents. The scroll reads
`hero art → ink → periwinkle → ink`, and the carousel is the one section with
no band of its own: the reworked comp runs it straight on the page's ink and
puts all of its colour into the cards, so five yellow blocks arrive after the
longest ink stretch on the page. Cyan keeps its other jobs — connector bands,
the primary CTA, the focus ring.

Secondary text is never gray. It is tinted from the surface's own foreground:

- `--color-hl-ink-soft` = ink 80% over paper — 5.14:1 on `#ededed`
- `--color-hl-paper-soft` = paper 78% over ink — used on the ink footer

Verified contrast: ink on pale yellow 14.45:1 and at 80% 7.66:1, ink on
yellow 11.44:1, white on ink 15.05:1, a card against the ink behind it
14.45:1. Ink on cyan 8.98:1, ink on periwinkle 5.92:1, ink on
lavender 9.22:1, indigo on lavender 7.14:1, ink on paper 12.3:1, paper on
ink 12.3:1. On a light image
slot the worst case is a soft week label over a paper grid rule, at 5.10:1;
over a week backdrop's photograph it is 5.07:1, the screened picture being
unable to darken the lavender under it. Text on the deep
blue hero plate is 3.64:1 and is therefore only ever set at large scale
(≥ 24px, or ≥ 18.66px bold), which is how the comp sets it.

## Typography

- **Hand** — Masterpiece, `--font-hand`. The comp's own brush face, now the
  page's signature rather than its voice: the wordmark (hero and footer) and
  the footer's column labels. One 400 weight only.
- **Display** — Urbanist (variable), `--font-display`. Every header: "how does
  it work?", process step titles, week subjects, carousel and FAQ headlines,
  FAQ questions. Tracking −0.02em to −0.045em at display sizes.
- **Body** — Open Sans (variable), `--font-body`. Paragraphs, captions, form
  fields, links — the asides' copy and the FAQ's answers among them.
- **Tagline** — Ubuntu 400, `--font-tagline`. The hero's promise line under the
  wordmark, in both layouts, and nothing else. Named for the role rather than
  the face like the three above it, so the utility is `font-tagline`. It is the
  one static face on the page: Google ships Ubuntu as 300/400/500/700 with no
  variable axis, so its weight is declared, and only the 400 the line sets is
  requested. Its latin subset preloads at 13.8 KB.

"how does it work?" was set in the brush face, as the comp had it, and moved to
the display face with the other headers. The brush now bookends the page at the
wordmark alone, which is the one place it is doing identity rather than
carrying a sentence.

Urbanist, Open Sans and Ubuntu are self-hosted through `next/font/google`;
Masterpiece through `next/font/local` from `public/fonts`. It is free per the
author's read-me, which asks for a charitable donation on commercial use. Only
those four are loaded — the faces they replaced, Bricolage Grotesque and
Archivo, are no longer requested.

Ubuntu is not a drop-in for Open Sans's metrics either, and the numbers are the
build's own: against the same fallback reference Next scales Open Sans to
105.15% and Ubuntu to 102.06%, so Ubuntu sets about 3% smaller at the same
`font-size`. Its declared ink box is 1.0984em against Open Sans's 1.2951em, so
at the tagline's `line-height: 1.1` — unchanged — less ink sits in the same
baseline-to-baseline distance and the wrapped stage line reads airier than it
did. Both were left as the comp set them; the drift is under the threshold
where compensating would be worth breaking the comp's own 31.788.

Masterpiece is not a drop-in for Bricolage's metrics, and three things follow
from that:

- **No bold, ever.** It ships one 400 weight whose strokes overhang their
  advances — `I` carries 0.52em of ink on a 0.32em advance — so it is already
  heavy, and a synthesised bold smears the strokes into each other.
  `.font-hand` sets `font-synthesis-weight: none`, and the weight utilities
  were dropped from the elements that use it.
- **It set wider**, which is why the two lines it used to carry were stepped
  down. Both have since moved to Urbanist and been given the comp's own sizes
  back: "how does it work?" ran 4% past its 918 plate at the comp's 100 in the
  brush face and sits at 84% of it in Urbanist.
- **Its cap height is 0.568em** against Bricolage's ~0.72, so a size carried
  over unchanged reads a fifth smaller. The footer's column labels are set at
  0.95rem where they were `text-xs`, which lands the caps where they were. This
  is the one place the rule still bites, the wordmark being the only other.

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
   bands re-drawn as short vertical tapers between plates, carrying the same
   1.6× on their horizontal edges. Not through `stage.ts`: those svgs scale
   with `preserveAspectRatio="none"`, so a perpendicular thickness computed in
   their viewBox units would not survive the stretch.

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
bg.png was painted to leave and both pipe columns read. `.stage` caps at 1728
and centres and the painting spans the screen, so both share the screen's
centre line and the plate sits on the painting's own centre at every width.

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
- **Connector band** — filled SVG quadrilateral, built in `stage.ts` from the
  comp's own centreline and average thickness rather than from its exported
  path data, so one `BAND_TAPER` governs all four. Every band runs thin where
  it leaves the plate above to thick where it lands on the one below, at 1.6×,
  measured perpendicular to the run: 54→87, 71→113, 79→126, 92→148 comp px.
  The comp's own tapers were 1.07 to 1.20 and pointed in two directions, which
  read as four drawing errors rather than one decision. Each band's mean is
  held at the comp's, so the page's weight is unchanged and the line still
  grows as the programme does — 92 through the first joint, 120 through the
  last. The ends stay horizontal cuts, which is why no edge is a round number:
  an end's edge is its wanted thickness divided back out by the axis's slope.
- **Image slot** (`image-slot.tsx`) — reserved artwork footprint drawn in the
  page's own grammar: ink plate, cyan registration ticks at the corners, a
  measured grid masked to the centre, and a label with the artwork's native
  size. Replace with `next/image` in place; the wrapper box is already correct.
  Two places still draw it, both on the same terms: an optional path on the
  content record, with the slot as the fallback, so each fills in one piece at
  a time. `photo` on a `BuildCard` — every carousel card now has one — and
  `art` on a `DesignWeek`, where weeks 1, 2, 4 and 5 have their pictures and
  week 3 is still waiting for a synth shot.

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
- **Week backdrops** — one artwork patch behind each subject-and-week pairing
  in step 1, each the measured union of its own two lines padded 22 across and
  18 down. Deliberately ragged rather than a uniform band: the comp hand-places
  the five at different heights, and squaring them into a row would flatten
  that. Neighbours clear each other by 19-28 and the plate by 13.

  The photograph is screened onto the lavender at 0.55 rather than laid on it.
  These boxes are the type's own bounding box, so the week label stands
  directly on the picture, and at 13.7px it needs 4.5:1 against a ground that
  gives it only 5.07:1 bare. `mix-blend-mode: screen` can only lift a channel,
  never lower one, so the composite is at least as light as the lavender
  whatever the picture does and that floor holds for every pixel of every
  photograph — including ones not taken yet. It is the paper-grid-rule
  reasoning above, applied to a picture instead of a line. At 0.55 the
  composite runs from the patch's own `#c9c7ec` at the picture's black to
  `#e6e6f6` at its white, which is the step plate's `#E6E5FC`: the photograph
  is carried by the two colours the section already owns. The blend is
  `isolate`d, because the guarantee only holds against the lavender.
- **Section grounds** — one low-opacity pattern per band, so a reader scrolling
  knows which room they are in without being told. All three are drafting marks
  from the same silkscreen vocabulary, at an opacity where they register as
  texture rather than as content: **raked arcs** on the process band, a supplied
  70×8 tile of overlapping curves turned 60° and doubled, carried as a data-URI
  SVG — the line running on, rather than a sheet ruled for it; a **hexagonal
  lattice** on the carousel, a supplied 40×59.428 tile turned 20°, also a
  data-URI SVG; and ink **section hatching** at 45° on the FAQ, the drawing
  convention for a cut surface. Colour is diluted into the gradient with `color-mix` rather than
  carried by an opacity layer, so each is a `background-image` on the section
  itself — no extra element, no stacking context to arrange, and nothing in the
  accessibility tree.

  Both supplied patterns arrived stroked #ecc94b over an opaque #2b2b31 ground,
  and both needed the same two changes. The ground rect is dropped in each, so
  the section's own ink shows through and stays the single place that colour is
  set. The stroke takes the band's own colour rather than one shared accent:
  cyan on the process band, which already draws its connector bands and week
  marks in it; the card yellow on the carousel, which has no cyan left anywhere
  in it since the belt gave up its blue, so cyan there would import an accent
  the section does not use. Both are 12%.

  Each hex is written out inside its SVG, because a data URI is a separate
  document that no custom property reaches into — those two copies have to be
  kept in step with `--color-hl-cyan` and `--color-hl-yellow` by hand. Both
  also pin `background-size: 100% 100%` and `no-repeat`: the rule that an image
  with no intrinsic dimensions is drawn at the size of its box is what makes
  them work, and a browser falling back to the 300×150 default would tile a
  rotated pattern and seam it.

  Measured at the worst case, text sitting directly on a mark: white on the
  carousel's ground 10.92:1 and paper 9.33:1; ink on the FAQ's 5.07:1; paper on
  an arc of the process band's 9.88:1.

- **Aside plate** — lavender block, 555 × 261 on the comp grid, carrying a
  title over a paragraph. One departure from the comp: the title is centred on
  the plate rather than set from its left edge at 44.5. It is pinned to both
  edges with the comp's 490 measure kept as a cap, so the line still wraps
  where it did and the centre it finds is the plate's, not the text box's. The
  body stays left-aligned under it — the title is a label for the plate, the
  paragraph is something to read. The stacked layout centres its title too, so
  the two layouts say the same thing.
- **Email slot** — the signup field, drawn as a slot cut into the hero plate
  rather than a control sitting on it: ink ground, one soft cyan edge at 55%,
  and an `<input>` that carries no surface of its own — no background, no
  border, no ring — because the slot is the control. The cyan caret is the only
  accent, and it is only there while someone is typing.

  It briefly also carried the image slot's registration ticks, its measured
  grid and an uppercase tracked legend, on the reasoning that an empty field is
  a footprint waiting for its part. The reasoning was sound and the result was
  not: at 33px tall the grid ran three cells deep and the ticks were 8px
  specks, so five decorative systems were stacked at a scale where none of them
  resolved and the bar read as detail for its own sake. One surface, one
  boundary, one accent does the job the five were failing to — the lesson being
  that a device borrowed from elsewhere in a system still has to survive the
  size it is borrowed into.

  The edge sits at 55%, which is 3.71:1 on ink, where a control's boundary has
  to clear 3. Value text is paper on ink at 12.85:1, the placeholder
  `--color-hl-paper-soft` at 8.36:1, and the slot reads 3.44:1 against the hero
  plate it sits on.

- **CTA** — square cyan block labelled "sign up!" in display bold at 0.85em of
  the form's own size, sized by padding rather than a fixed width so the button
  is as wide as its word. The comp's exported check vector is no longer on it:
  a tick reads as *done* on a control whose job is *start*, and it is already
  the confirmation's own mark. Hover and focus go to white; pending goes to
  `--color-hl-blue`, the label hiding behind a spinner in the same grid cell so
  the row cannot resize mid-submit. Ink on all three: 8.96:1, 15.05:1, 5.05:1.
- **Hero backdrop** — `public/art/bg.png`, one painted plant-room scene at
  1920x1080, shown whole. It is composed rather than tileable: piping and
  foliage frame its left and right edges, the fox sits in its lower-left
  corner, and the middle is left open — which is where the hero plate now
  sits. So the art layer takes the painting's aspect ratio instead of the
  section's — full width at every size, top-aligned, nothing repeated. It sits
  at 0.66 opacity over ink and dissolves into it over the bottom 22% of its own
  box, so the fade scales with the picture rather than eating a third of it on
  a phone.

  It used to cap at the comp's 1728 and centre, which left ink shoulders on
  anything wider; the painting is the hero's ground, not an object standing on
  it. Uncapped, a 16:9 box outgrows its section on a wide screen — a 2560
  window 800 tall wants 1440 of painting against 1018 of section — so
  `max-height: 100%` clamps the box to the section. Past that point the box
  stops being 16:9 and `object-cover` trims the picture instead of
  `overflow-hidden` cutting the layer, which keeps the fade on the bottom edge
  that is actually visible. Below it nothing is cropped at all: the box is the
  painting's own ratio and cover has nothing to take.
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
  on an endless loop measures nothing. The scroller carries `tabindex="0"` so
  the keyboard path survives the missing buttons.

  It is a literal reproduction of the reworked "what can I build" frames on the
  comp's 1728 grid, every value written as the `cqw` fraction of it: cards
  386 × 368 on a 514 pitch, so a 128 gap; the run starts 78 in; the heading is
  60, white, centred, sitting 44 under the band above and 97 over the cards,
  which clear the band below by 156. The belt runs edge to edge, and carries no
  ground of its own — the comp gives this section no band, so it runs on the
  page's ink and the belt is the same colour as what it sits on.

  Copies of the card set are a function of that width. The belt wraps one set
  at a time, so at the wrap there must be `COPIES - 1` sets standing to the
  reader's right for the viewport to fit inside. The set repeats four times,
  which at a 2569-unit cycle covers any screen.

- **Project card** — the comp's `Plugin icon - 1` frame (301:56): a 30-radius
  block with a 20 border in pale yellow, yellow inside, and a pale-yellow
  caption band filling the bottom 105 of its 328 of content. The photograph
  sits on the yellow above it, contained and never cropped — a build is the
  thing on show, and the yellow left around it is the card's own ground rather
  than a gap, which is how the comp mounts these: each photograph a different
  size on the same field. Label at 25 over credit at 17, centred, both Open
  Sans, ink and ink at 80% rather than the comp's flat black so the card stays
  inside the page's palette. The card is a fixed 386 wide, so every card in the
  belt matches and the pitch the loop measures is the pitch it travels.

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
- `:focus-visible` is a 3px cyan outline with 3px offset. The email slot takes
  it on the slot rather than the input, through `:focus-within` — a text input
  matches `:focus-visible` whenever it is focused, pointer or keyboard, so the
  two fire together and the ring lands on the frame that is actually the
  control. The edge goes to full cyan under it. Everywhere but the belt: cyan on `--color-hl-blue` is 1.77:1, so the rail's ring is ink (5.05:1)
  and inset, since a full-bleed scroller's outer ring would be clipped.
- The form has a real label, `aria-describedby`, `aria-invalid`, and an
  `aria-live` status region; errors name the problem and the recovery.
- Carousel slides are `role="group"` with `aria-roledescription="slide"`; the
  rail is `aria-roledescription="carousel"`, focusable, and arrow-scrollable.
  The two repeated copies behind it are `aria-hidden` and `inert`.
- Decorative art and connector bands are `aria-hidden`. The section grounds
  need no such marking: they are background images, so they were never in the
  accessibility tree to remove.
- Only one `<h1>` is ever in the accessibility tree — the stage and flow
  layouts are mutually `display: none`.
