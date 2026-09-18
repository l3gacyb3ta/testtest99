---
name: Half Life
description: A ten-week hardware programme from Hack Club — a marketing world, a platform world, and the staff console, deliberately unalike.
colors:
  # ── Landing page (src/app/(site)/globals.css) ──────────────────────────────
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
  # ── Platform (src/app/(platform)/globals.css) ──────────────────────────────
  cream: "#fcf7f7"
  paper: "#ffffff"
  navy: "#1c1a59"
  navy-soft: "#4a4785"
  ink: "#262a2d"
  sky: "#52b4d5"
  sky-deep: "#2e8cae"
  sky-pale: "#cfeaf4"
  teal: "#06ae97"
  teal-deep: "#048372"
  teal-mid: "#75d0c9"
  mint: "#aef2dd"
  magenta: "#b21b9b"
  coral: "#f35757"
  coral-deep: "#c73b3b"
  orange: "#fba62f"
  orange-deep: "#d07f0e"
  violet: "#a47cc0"
  violet-deep: "#7b519b"
  violet-pale: "#ece2f2"
  sand: "#f4dfc6"
  sand-deep: "#cdae8a"
  gold: "#f6c63f"
  gold-deep: "#c9930f"
  gold-pale: "#fdf1cc"
  line: "#c8c3d6"
  line-strong: "#9a94b4"
  # ── Staff console (src/app/(platform)/ops.css) ─────────────────────────────
  # The platform's earlier system, kept whole for admin, review and login
  # rather than half-translated. It redefines four names it shares with the
  # platform, which is why it is scoped to the (ops) route group.
  ops-surface: "#fcf7f7"
  ops-surface-raised: "#ffffff"
  ops-surface-sunken: "#f2ecec"
  ops-border: "#cacedd"
  ops-ink: "#100f30"
  ops-ink-strong: "#1c1a59"
  ops-ink-muted: "#696e82"
  ops-accent: "#52b4d5"
  ops-accent-bright: "#61cdf1"
  ops-teal: "#06ae97"
  ops-mint: "#aef2dd"
  ops-magenta: "#b21b9b"
  ops-coin: "#fba62f"
  ops-flame: "#f35757"
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
  # The hand-lettered voice. The comp names COMICO, which is not on Google
  # Fonts and ships no licensed file here; Shantell Sans is the substitute in
  # use, and `--font-hand` is the one place to change that.
  app-hand:
    fontFamily: "Shantell Sans, Plus Jakarta Sans, ui-sans-serif, sans-serif"
    fontWeight: 500
    letterSpacing: "0.04em"
  app-label:
    fontFamily: "Shantell Sans, Plus Jakarta Sans, ui-sans-serif, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.11em"
    lineHeight: 1.25
    textTransform: "uppercase"
rounded:
  control: "4px"
  button: "8px"
  panel: "10px"
  rail: "14px"
  square: "0px"
  # The platform's own radius, on every sketched border unless overridden.
  hl: "16px"
  hl-button: "12px"
spacing:
  tight: "0.75rem"
  base: "1rem"
  stack: "1.5rem"
  card: "1.4rem 1.5rem"
  gutter: "2.4rem"
components:
  # ── Platform ───────────────────────────────────────────────────────────────
  button-solid:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.paper}"
    borderColor: "{colors.violet-deep}"
    borderWidth: "2px"
    rounded: "{rounded.hl-button}"
    height: "2.75rem"
    padding: "0 1.25rem"
    typography: "{typography.app-label}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    borderColor: "{colors.gold-deep}"
    borderWidth: "2px"
    rounded: "{rounded.hl-button}"
  button-teal:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    borderColor: "{colors.teal-deep}"
    borderWidth: "2px"
    rounded: "{rounded.hl-button}"
  button-coral:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.paper}"
    borderColor: "{colors.coral-deep}"
    borderWidth: "2px"
    rounded: "{rounded.hl-button}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    borderColor: "{colors.violet}"
    borderWidth: "2px"
    rounded: "{rounded.hl-button}"
  # A drawn border on a pseudo-element, so the wobble never touches the content
  # it frames. `.sketch` for an outline, `.torn` for a filled shape.
  panel-sketch:
    borderColor: "{colors.line}"
    rounded: "{rounded.hl}"
  # The checkpoint token: a rim disc behind, a face on top, an ambient shadow
  # beneath, and a press that sinks the face onto the rim.
  puck-upcoming:
    backgroundColor: "{colors.sky}"
    borderColor: "{colors.sky-deep}"
    aspectRatio: "1 / 0.92"
  puck-done:
    backgroundColor: "{colors.teal}"
    borderColor: "{colors.teal-deep}"
    aspectRatio: "1 / 0.92"
  puck-current:
    backgroundColor: "{colors.gold}"
    borderColor: "{colors.gold-deep}"
    aspectRatio: "1 / 0.92"
  puck-gate:
    backgroundColor: "{colors.magenta}"
    aspectRatio: "1 / 0.92"
  puck-locked:
    backgroundColor: "{colors.sand}"
    borderColor: "{colors.sand-deep}"
    aspectRatio: "1 / 0.92"
  # ── Staff console ──────────────────────────────────────────────────────────
  ops-button-primary:
    backgroundColor: "{colors.ops-accent-bright}"
    textColor: "{colors.ops-ink-strong}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  ops-button-default:
    backgroundColor: "{colors.ops-surface-raised}"
    textColor: "{colors.ops-ink-strong}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  ops-button-danger:
    backgroundColor: "{colors.ops-flame}"
    textColor: "{colors.ops-surface-raised}"
    rounded: "{rounded.button}"
    padding: "0.5rem 1.1rem"
  ops-card:
    rounded: "{rounded.panel}"
    padding: "{spacing.card}"
    textColor: "{colors.ops-ink}"
  ops-input:
    backgroundColor: "{colors.ops-surface-raised}"
    textColor: "{colors.ops-ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 0.75rem"
---

# Design System: Half Life

## Overview

Half Life runs **two visual worlds on purpose**, and the split is the first thing
to understand before writing any screen. The marketing site sells a ten-week
hardware programme to teenagers who have never soldered anything. The platform
is where those same teenagers then work, for ten weeks, most days. A world that
serves the first badly serves the second, so they were never merged.

There is a third, which is not a world so much as a back room: the staff console
under `(ops)` — admin, review, login — carries the platform's earlier design
system in `ops.css`, kept whole rather than half-translated when the participant
platform was rebuilt from the comp. Its tokens are prefixed `ops-` throughout
this document. It shares four names with the platform (`ink`, `magenta`, `mint`,
`teal`) and redefines them, which is exactly why it is scoped to that route
group: loaded globally it would quietly repaint the trail.

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
- The platform's borders are drawn, not declared: `.sketch` puts a wobbling marker outline on a pseudo-element so the line never touches the content it frames, and `.torn` applies the same displacement to a filled shape — which is how the week banners and page signs get their torn-tape edge.
- Its checkpoint token is the `.puck`: a rim disc behind, a face on top, a real ambient shadow beneath, and a press that sinks the face onto the rim.
- The platform's primary structure is a progress path, not a dashboard of cards.
- Illustration is the programme's own: a cast of gato characters and five theme paintings, all die-cut stickers with a pale outline.
- Secondary text is tinted from its surface, never neutral grey.

## Colors

Three palettes. Nothing crosses between the landing and the platform; the staff
console's is the platform's own ancestor and is named apart so the two cannot be
confused for each other.

### Primary

- **Programme Cyan** (`#8ed3dc`): the landing page's accent — primary CTA, focus ring, and the stroke on the process band's ground pattern.
- **Sky** (`#52b4d5`): the platform's accent. Links, focus rings, and the face of an unreached checkpoint.
- **Violet** (`#a47cc0`): the platform's action colour — every primary button and the outline variant's border. Distinct from the accent on purpose: a page full of links and a page full of buttons should not read as the same surface.

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
**Platform — Display and Body:** Plus Jakarta Sans · **Hand:** Shantell Sans.

**Character:** The landing pairs a tight geometric display face with a neutral
workhorse body, and keeps its brush face for identity alone. The platform runs
one humanist sans for everything structural and reserves a hand-lettered face
for small uppercase labels and the two counters — the only place its voice gets
loose.

### Hierarchy

- **Display** (Plus Jakarta 800, `clamp(1.75rem, 4vw, 3.75rem)`, 1.05): the page title on its hanging board. One per screen.
- **Headline** (Plus Jakarta 800, `clamp(1.5rem, 2.6vw, 2.5rem)`, 1.05): the week banner's "DESIGN YOUR PCB". Ceiling set so the longest theme name takes two lines, not three.
- **Title** (Plus Jakarta 700, 1.375rem): nav items, participant names, reel authors.
- **Body** (Plus Jakarta 400, 1rem, 1.5): everything else.
- **Label** (`.label` — Shantell Sans 700, 0.78rem, +0.11em, uppercase): "VIEW MORE", "LOG OUT", "TODAY", every button, every timestamp.
- **Hand** (`.hand` — Shantell Sans 500, +0.04em): the asides written in the margin — "that is everything. go build something."
- **Counter**: the coin and streak numerals, set in the display face at label size rather than in the hand, so two digits stay legible at a glance.

### Named Rules

**The Brush Bookends Rule.** On the landing, Masterpiece is identity, never
voice. It sets the wordmark and the footer's column labels and nothing else —
it ships one 400 weight whose strokes overhang their advances (`I` carries
0.52em of ink on a 0.32em advance), so it is already heavy and a synthesised
bold smears it. `font-synthesis-weight: none` is set for that reason.

**The Hand Is Not Body Rule.** The platform's hand-lettered face sets labels,
asides and nothing longer. The comp names COMICO, which is not on Google Fonts
and ships no licensed file here; Shantell Sans stands in, loaded in the platform
root layout and reached everywhere through `--font-hand`. Swapping it is that
one variable, because no component names a face directly.

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

**The Drawn Edge Rule.** A platform border is drawn, not stroked. Use `.sketch`
(or `.sketch-2` / `.sketch-3`, which carry different seeds) rather than a CSS
border, and vary which one between adjacent cards. Two cards with the same
wobble read as a repeated texture, which is the opposite of hand-made. In the
staff console the equivalent is `.hl-wobbly` plus `<WobbleBorder/>` with a
`seed` prop.

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

Page titles hang from two navy straps pinned above the content. On the platform
the board is a torn painted plate in the page's own accent — orange for the
shop, sky for Explore, magenta for the leaderboard — so each destination is
recognisable before a word of it is read. Used on every screen except the
trail, which has the week banner instead. `PageSign` in the platform, the
`.hl-sign` pair in the staff console.

### The week banner (signature)

A band of torn painted paper carrying the week number in the hand face and the
headline in Plus Jakarta 800, with the week's theme illustration at its right
and the week's checkpoint count on a pill. It pins to the top of the frame while
that week's nodes flow beneath it and is then shoved off by the next one, which
is what makes ten weeks read as a distance rather than a list.

### Doomscroller rail

Sticky, drawn border, with a recessed inner panel and a snap column of reels
inside it. Its title is set in the hand face. Whether it is open is per-browser
ceremony rather than a fact on the server, so a second device does not inherit
a rail somebody closed on a laptop.

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
