---
name: Half Life
description: A ten-week hardware programme from Hack Club — a marketing world and a platform world, deliberately unalike.
colors:
  # ── Landing page (src/app/(site)) ──────────────────────────────────────────
  hl-ink: "#31222c"
  hl-paper: "#ededed"
  hl-cyan: "#8ed3dc"
  hl-blue: "#88BCDF"
  hl-blue-deep: "#0E86B9"
  hl-blue-pale: "#9AB5D8"
  hl-teal: "#2E96A3"
  hl-teal-deep: "#11616B"
  hl-periwinkle: "#a39bd6"
  hl-lavender: "#c9c7ec"
  hl-lavender-pale: "#E6E5FC"
  hl-indigo: "#34316c"
  hl-yellow: "#A2C4DA"
  hl-yellow-pale: "#EBF7FF"
  # ── Platform (src/app/(platform)) ──────────────────────────────────────────
  surface: "#fcf7f7"
  surface-raised: "#ffffff"
  surface-sunken: "#f2ecec"
  border: "#cacedd"
  ink: "#100f30"
  ink-strong: "#1c1a59"
  ink-muted: "#696e82"
  accent: "#52b4d5"
  accent-bright: "#61cdf1"
  accent-media: "#51bce1"
  teal: "#06ae97"
  teal-soft: "#75d0c9"
  mint: "#aef2dd"
  magenta: "#b21b9b"
  node-upcoming: "#fbe3d0"
  coin: "#fba62f"
  flame: "#f35757"
typography:
  site-display:
    fontFamily: "Urbanist, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  site-body:
    fontFamily: "Open Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  site-hand:
    fontFamily: "Masterpiece, cursive"
    fontWeight: 400
  site-tagline:
    fontFamily: "Ubuntu, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.1
  app-display:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
  app-title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
  app-body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  app-label:
    fontFamily: "Comico, Comic Sans MS, Chalkboard SE, sans-serif"
    fontSize: "0.75rem"
    letterSpacing: "0.03em"
  app-counter:
    fontFamily: "Comico, Comic Sans MS, Chalkboard SE, sans-serif"
    fontSize: "1.875rem"
    lineHeight: 1
rounded:
  control: "4px"
  button: "8px"
  panel: "10px"
  rail: "14px"
  square: "0px"
spacing:
  tight: "0.75rem"
  base: "1rem"
  stack: "1.5rem"
  card: "1.4rem 1.5rem"
  gutter: "2.4rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-bright}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink-strong}"
  button-default:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  button-default-hover:
    backgroundColor: "{colors.mint}"
  button-danger:
    backgroundColor: "{colors.flame}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  card:
    rounded: "{rounded.panel}"
    padding: "{spacing.card}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 0.75rem"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.app-title}"
    padding: "0.55rem 0.25rem"
  checkpoint-node-done:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-raised}"
    width: "119px"
    height: "104px"
  checkpoint-node-current:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.surface-raised}"
    width: "119px"
    height: "104px"
  checkpoint-node-upcoming:
    backgroundColor: "{colors.node-upcoming}"
    textColor: "{colors.ink-muted}"
    width: "119px"
    height: "104px"
  checkpoint-node-locked:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    width: "119px"
    height: "104px"
---

# Design System: Half Life

## Overview

Half Life runs **two visual worlds on purpose**, and the split is the first thing
to understand before writing any screen. The marketing site sells a ten-week
hardware programme to teenagers who have never soldered anything. The platform
is where those same teenagers then work, for ten weeks, most days. A world that
serves the first badly serves the second, so they were never merged.

**Landing page — Creative North Star: "The Production Line"**

A ten-week hardware production line, drawn as the line itself. The page reads
like control-panel silkscreen laid over a workshop: flat plates, hard square
corners, no shadows, and a thick band that physically welds each stage of the
programme to the next. The ground is ink and the informational plates are paper,
because this is read on a phone in a bedroom or a school laptop, and the copy
deserves the highest-contrast surface on the page. Energetic and
workshop-bright rather than sleek — the promise is a soldering iron, not a SaaS
trial.

**Platform — Creative North Star: "The Field Notebook"**

Every outline is a drawn ink stroke rather than a rectangle: card borders
wobble, the rules between nav items wander, and the week arrives as a band of
torn painted paper. It reads as something kept by hand alongside the hardware,
which is what journalling and timelapses actually are. Where the landing page is
ink-grounded and engineered, the platform is paper-grounded and warm, and its
structure is a path you walk rather than a page you read.

**Key Characteristics:**

- Two grounds, never mixed: `#31222c` ink for the landing, `#fcf7f7` warm paper for the platform.
- The landing has no shadows and no rounded corners; the platform has drawn edges and one solid drop.
- The platform's primary structure is a progress path, not a dashboard of cards.
- Illustration is the programme's own: a cast of gato characters and five theme paintings, all die-cut stickers with a pale outline.
- Secondary text is tinted from its surface, never neutral grey.

## Colors

Two palettes, one per world. Nothing crosses between them.

### Primary

- **Programme Cyan** (`#8ed3dc`): the landing page's accent — primary CTA, focus ring, and the stroke on the process band's ground pattern.
- **Signal Blue** (`#52b4d5`): the platform's accent. Links, focus rings, the caret, and the pressed state of the hanging sign.
- **Sign Blue** (`#61cdf1`): the brighter face used for the page-title board and primary buttons, so the sign reads as lit rather than painted.

### Secondary

- **Deep Ink Navy** (`#1c1a59`): the platform's structural colour — every outline, every heading, the straps the page title hangs from. Carries more of the platform's identity than the accent does.
- **Programme Teal** (`#06ae97`): completion. Finished checkpoint nodes, the printer-fund bar, success.
- **Mint** (`#aef2dd`): the unfilled half of any progress track, and the hover fill on secondary buttons.

### Tertiary

- **Coin Orange** (`#fba62f`) and **Streak Red** (`#f35757`): the two counters, and by extension warning and danger. They are the only saturated hues in the platform's chrome and they appear at exactly two sizes: the counter numerals and a badge.
- **Periwinkle** (`#a39bd6`) and **Lavender** (`#c9c7ec`): the landing's band and aside plates.

### Neutral

- **Ink** (`#31222c` landing / `#100f30` platform): body text, and the landing's page ground.
- **Paper** (`#ededed` landing / `#fcf7f7` platform): the landing's plates; the platform's entire ground. The platform's is deliberately warm rather than white — white appears only on cards that sit on top of it.
- **Line** (`#cacedd`): every drawn border and rule on the platform.
- **Muted** (`#696e82`): platform secondary text.

### Named Rules

**The Two Worlds Rule.** A token from one world never appears in the other. If a
platform screen needs an accent, it is `accent`, not `hl-cyan`. The two palettes
do not share a single value, and a screen that mixes them belongs to neither.

**The Tinted Secondary Rule.** Secondary text is tinted from its own surface,
never neutral grey. The landing derives `hl-ink-soft` as ink at 80% over paper
and `hl-paper-soft` as paper at 78% over ink. The platform's `ink-muted` is its
ink hue (228°) darkened until it clears contrast, not a grey swapped in.

**The Misnamed Yellow Rule.** `--color-hl-yellow` (`#A2C4DA`) and
`--color-hl-yellow-pale` (`#EBF7FF`) are **blue**. The landing was recoloured
after those variables were named and the names were never updated, so the
carousel cards read as pale blue while the code says yellow. Trust the value,
not the name — and rename them before adding anything new that uses them.

### Measured contrast

Recomputed against the current CSS, not inherited from an earlier palette.

Landing: ink on paper 12.85:1 · ink on cyan 8.96:1 · ink on periwinkle 5.89:1 ·
ink on lavender 9.22:1 · indigo on lavender 7.14:1 · ink on lavender-pale
12.16:1 · ink on `hl-yellow` 8.20:1 · ink on `hl-yellow-pale` 13.81:1 · white on
`hl-teal-deep` 7.13:1. White on `hl-blue-deep` is **4.09:1**, so that pairing is
large-scale only (≥24px, or ≥18.66px bold), which is how the hero sets it.

Platform: ink on surface 17.46:1 · ink-strong on surface 14.75:1 · ink-muted on
surface 4.76:1 and on white 5.06:1 · ink-strong on sign blue 8.58:1 · ink-strong
on mint 12.33:1.

**Three known failures, inherited from the comp and not yet resolved:**

- `teal` on the page ground is **2.64:1**, and it colours the `110/300`
  progress label at 12px. That label fails.
- `coin` on the page ground is **1.87:1**. The coin counter is 30px, so even
  the 3:1 large-text floor is missed.
- `flame` on the page ground is **3.13:1** — passes as large text at 30px,
  fails anywhere smaller.

These are stated rather than silently corrected because the colours are the
programme's own and changing them is a brand decision. Do not reuse any of the
three for body-size text until they are resolved.

## Typography

**Landing — Display:** Urbanist · **Body:** Open Sans · **Hand:** Masterpiece ·
**Tagline:** Ubuntu.
**Platform — Display and Body:** Plus Jakarta Sans · **Accent:** Comico.

**Character:** The landing pairs a tight geometric display face with a neutral
workhorse body, and keeps its brush face for identity alone. The platform runs
one humanist sans for everything structural and reserves a comic hand for small
uppercase labels and the two counters — the only place its voice gets loose.

### Hierarchy

- **Display** (Plus Jakarta 800, `clamp(1.75rem, 4vw, 3.75rem)`, 1.05): the page title on its hanging board. One per screen.
- **Headline** (Plus Jakarta 800, `clamp(1.5rem, 2.6vw, 2.5rem)`, 1.05): the week banner's "DESIGN YOUR PCB". Ceiling set so the longest theme name takes two lines, not three.
- **Title** (Plus Jakarta 700, 1.375rem): nav items, participant names, reel authors.
- **Body** (Plus Jakarta 400, 1rem, 1.5): everything else.
- **Label** (Comico, 0.75rem, +0.03em, uppercase): "VIEW MORE", "LOG OUT", "YESTERDAY", timestamps.
- **Counter** (Comico, 1.875rem): the coin and streak numerals only.

### Named Rules

**The Brush Bookends Rule.** On the landing, Masterpiece is identity, never
voice. It sets the wordmark and the footer's column labels and nothing else —
it ships one 400 weight whose strokes overhang their advances (`I` carries
0.52em of ink on a 0.32em advance), so it is already heavy and a synthesised
bold smears it. `font-synthesis-weight: none` is set for that reason.

**The Comico Is Not Body Rule.** The platform's accent face is for uppercase
labels and numerals. It is not on Google Fonts and no licensed file ships in
this repo, so `--font-accent` currently falls back to a comic-ish system stack.
Dropping the file into `public/fonts/` and restoring three lines in the
platform layout switches every accent surface at once, because they all resolve
through that one variable.

**The Metric Drift Rule.** Ubuntu is not a drop-in for Open Sans. Against the
same fallback reference Next scales Open Sans to 105.15% and Ubuntu to 102.06%,
so Ubuntu sets about 3% smaller at the same `font-size`, and its declared ink
box is 1.0984em against Open Sans's 1.2951em. Both were left as the comp set
them; the drift is under the threshold where compensating would be worth
breaking the comp's own measurements.

## Layout

**Landing.** Two layouts on purpose. At ≥1180px a `.stage` reproduces the comp's
1728px grid exactly: every offset is written as its literal Figma pixel and
resolved in `cqw`, so the composition scales continuously instead of snapping.
Below 1180px the same content stacks, with the connector bands redrawn as short
vertical tapers between plates.

**Platform.** Three columns: a 343px sidebar of outlined cards, the content
well, and a 409px Doomscroller rail. The hairline the comp runs down the page is
the content column's left border, not a separate element. Below 1400px the rail
is dropped — at that width the feed matters more than the panel. Below 900px the
grid collapses to one column **and the content well is ordered first**, because
the sidebar is three tall cards of chrome and leading with it means scrolling
past the nav, the printer card and the account card to reach the thing the
participant opened the app for.

Rhythm is a small set of stack gaps: 0.75rem tight, 1.5rem standard, 2.4rem
between columns. Cards are padded `1.4rem 1.5rem`.

## Elevation & Depth

**The landing is flat.** No shadows anywhere. Depth is tonal: plates of paper
and lavender sit on an ink ground, and the bands that weld them are the plates'
own material. Anything that needs to read as lifted is lifted by hue, not by
blur.

**The platform is flat except in one place.** Cards are outlined, never
shadowed. The single exception is the checkpoint node, which carries a solid
zero-blur drop (`0 6px 0`) in a darker tone of its own fill. That is not a
neobrutalist affectation: the comp draws each node as two stacked ellipses, and
the solid drop is that second ellipse. It is what makes the nodes read as
pressable, and it is the only depth cue in the system.

The Doomscroller rail's inner panel carries `inset 0 1px 1px rgb(0 0 0 / 0.1)` —
a recess, not a lift.

### Named Rules

**The Outline-Not-Shadow Rule.** Depth on the platform comes from a drawn
outline and the page ground showing through, never from a shadow. If something
needs separating, give it a border and a gap.

**The One Solid Drop Rule.** The zero-blur drop belongs to the checkpoint node
and nothing else. Reaching for it on a card or a button imports a neobrutalist
costume this world did not choose.

## Shapes

**Landing:** hard square corners, with one exception — the step and header
plates take a `rounded-xl`. Everything else is cut square. The form language is
plate-and-band: rectangular slabs joined by thick connectors.

**Platform:** soft and drawn. Radii are 4px (small controls and the nav tab),
8px (buttons, inputs, avatars), 10px (cards, reels), 14px (the rail). The
defining move is not the radius but the **stroke**: every border is a wobbling
ink line generated by an SVG turbulence displacement, roughly 20px between
wiggles with about 2px of travel, seeded per card so neighbours are not
identical tracings.

Illustration carries its own shape language: every gato and theme painting is a
die-cut sticker with a pale outline baked into the art.

### Named Rules

**The Drawn Edge Rule.** A platform border is drawn, not stroked. Use
`.hl-wobbly` plus `<WobbleBorder/>` rather than a CSS border, and vary `seed`
between adjacent cards. Two cards with the same wobble read as a repeated
texture, which is the opposite of hand-made.

**The Filter Applies To The Edge Rule.** The displacement filter goes on the
border element only, never on a container. Filtering an element that holds text
drags the text through the same displacement and turns it to mush.

## Components

### Buttons

- **Shape:** softly rounded (8px), with a 2px navy outline on every variant.
- **Primary:** sign blue (`#61cdf1`) on navy text, `0.5rem 1.1rem`. Hover deepens to `accent`.
- **Default:** white ground, navy text and outline. Hover fills mint.
- **Danger:** flame ground, white text; hover darkens by filter rather than by a second token.
- **Disabled:** 45% opacity and `not-allowed`. No colour change — the outline stays, so the control still reads as a control.
- **Focus:** a 3px `accent` ring at 2px offset, shared by every focusable surface in the system.

### Cards / Containers

- **Corner:** 10px, with the drawn border rather than a CSS one.
- **Background:** transparent on the page ground for sidebar cards; white for panels that carry forms or feed content.
- **Padding:** `1.4rem 1.5rem`.
- **Never nested.** A card inside a card has no meaning in this system.

### Inputs / Fields

- White ground, 2px line border, 8px radius, `0.6rem 0.75rem`.
- Label above in Plus Jakarta 700 at 0.95rem; hint below in muted.
- Focus takes the same 3px accent ring as buttons. The caret is `accent`, not the browser's default.

### Navigation

- Nav items are Title-sized (1.375rem, 700) in a stack, separated by **drawn** rules rather than borders.
- **The current page is dimmed to 40%, not highlighted.** This is the comp's own device and it is the opposite of the usual convention — read it twice before "fixing" it.
- A red tab (`#f35757`, 102×33, 4px radius) rides the top edge of the nav card.

### The checkpoint path (signature)

The platform's primary structure, and the thing the dashboard is. **All ten
weeks render as one continuous track**, so a participant in week 2 can scroll
down and see the synth, the displays and the breadboard computer waiting. The
view lands on the current week on arrival rather than at the top.

A week is a header (theme art, number, headline, tally) above a winding lane of
119×104 nodes — project creation, first session, idea reel, hours, progress
reel, submit for a design week; sessions, hours, reel, submit for a build week.
Future weeks sit at 55% opacity and come up to full on hover or focus.

- **Done:** the comp's blue disc, white star, solid darker-blue drop.
- **Current:** the comp's magenta disc, play glyph, and a deeper tone of the same magenta rising from the bottom in proportion to progress — one hue at two depths, so it reads as one thing partly filled rather than two colours sharing a circle.
- **Upcoming:** the comp's cream disc with a quiet dot — **not** a padlock, and still linked. The programme's deadlines are soft, so nothing about a future week is actually forbidden and a lock would be a lie.
- **Locked:** sunken fill, padlock, muted text, and no link. Reserved for the one thing the platform genuinely refuses — submitting a build whose design is not yet approved.
- **Connectors:** a dotted curve drawn with the same displacement filter as every other edge, bowing toward the lane's swing. Teal once both ends are done, muted ink otherwise.
- Node offsets come from the comp — a lane that swings left of centre and back out, not a zig-zag — carried as fractions of the lane width so the shape survives at any size. The swing is dropped below 900px.

### The hanging sign (signature)

Page titles hang from two navy straps pinned above the content. The board is
sign blue with a 2px navy outline; the straps are 10px wide, drawn behind it,
and run up past its top edge. Used on every screen that is not the dashboard.

### The week banner (signature)

A band of torn painted paper carrying the week number in Comico and the
headline in Plus Jakarta 800, with the week's theme illustration at its right.
The tear is exported artwork, not a CSS mask: its surround is exactly the page
ground, so it blends without one.

### Doomscroller rail

Sticky, 409px, 14px radius, drawn border, with a recessed white inner panel. Its
title is Comico. Dismissal is per-browser and the panel is hidden during SSR so
it never flashes in and out on hydration.

## Do's and Don'ts

### Do:

- **Do** pick the world first. A platform screen uses the platform palette, Plus Jakarta, drawn edges and 10px cards; a landing section uses ink, Urbanist and square plates.
- **Do** draw platform borders with `<WobbleBorder/>` and vary the `seed` between neighbouring cards.
- **Do** tint secondary text from its surface — `ink-muted` on the platform, `hl-ink-soft` / `hl-paper-soft` on the landing.
- **Do** dim the current nav item rather than highlighting it.
- **Do** give every focusable surface the shared 3px `accent` ring at 2px offset.
- **Do** put the content column first when the platform collapses to one column.
- **Do** state a checkpoint's next action on the current node only, and leave locked nodes unlinked.

### Don't:

- **Don't** mix the two palettes, or put a platform component on a landing page.
- **Don't** add a shadow to a platform card. Depth is an outline and the ground showing through; the one solid drop belongs to the checkpoint node alone.
- **Don't** use `teal`, `coin` or `flame` for body-size text until their contrast is resolved — they are 2.64:1, 1.87:1 and 3.13:1 on the page ground.
- **Don't** trust `--color-hl-yellow*`: those variables hold blues.
- **Don't** set Masterpiece in bold, or use it for anything but the wordmark and the footer's column labels.
- **Don't** apply the wobble filter to anything containing text.
- **Don't** nest cards, and don't reach for a card when the content is a path, a feed or a form.
- **Don't** use a Unicode glyph as an icon. Icons are drawn SVG at a consistent stroke.
