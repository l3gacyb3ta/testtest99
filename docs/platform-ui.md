# Half Life — platform UI

The logged-in product for [Half Life](https://halflife.hackclub.com): ten weeks of hardware for
teenagers, laid out as a Duolingo-style trail of checkpoints. Everything here is front-end only —
no backend, no auth, no uploads. All data is dummy data and progress lives in `localStorage`.

```bash
npm install
npm run dev     # http://localhost:3000
```

To replay the first-run experience (cinematic → spotlight → setup → tab tour), clear the save:

```js
localStorage.removeItem("halflife.save.v2");
```

## What is here

| Route | What it is |
| --- | --- |
| `/` | The checkpoint trail: 10 weeks, 59 checkpoints, week banners, grand prize |
| `/explore` | Journal feed grouped by day |
| `/shop` | Coin shop with category filter and buy states |
| `/docs`, `/docs/[slug]` | Five short reference pages |
| `/leaderboard` | Hours logged and weeks shipped |

## The curriculum

`src/lib/curriculum.ts` is the single source of truth for the program, and it encodes the
Checkpoint framework exactly:

- **Week 1 (PCB, design)** — onboarding → first journal → idea reel → journal to 10h → progress
  reel → submit (files, BOM/cart/tier, closing reel).
- **Design weeks 2–5** (CAD, synth, displays, breadboard computer) — project creation with tier
  selection → idea reel → journal to 10h → reel → journal to 10h → reel → submit (files,
  BOM/cart, closing reel).
- **Build weeks 6–10** — the same five themes, built for real: journal to 10h → reel → journal to
  10h → reel → submit, which needs a 30–60 second video of the project working, or an honest
  write-up of what needs to change if it does not.

Change `THEMES` in that file and the trail, week banners, onboarding reveal, project modals and
illustrations all follow.

## First run

1. **Cinematic** (`components/onboarding/Cinematic.tsx`) — one unbroken fall down the trail. The
   camera opens on the whole platform, then drops through all ten weeks in order and decelerates
   onto the Ender V3 waiting at the bottom of the run. The claim Half Life makes is "ten weeks",
   so the intro spends its time proving the distance rather than describing it: each week banner
   pins to the top of the frame while that week's checkpoints flow beneath it and is then shoved
   off by the next one, exactly as it behaves on the real trail, and a counter on the right names
   whichever header is currently on screen. Sticky is done by hand in the camera loop — CSS
   sticky needs a scroll container and the stage is a transform — and the whole thing is one
   `requestAnimationFrame` loop writing transforms straight to refs. Skippable, with a short
   landing so the camera and the banners stay in step; reduced motion parks on the prize.
2. **Spotlight** on the yellow first checkpoint.
3. **Setup** (`components/modals/FirstCheckpoint.tsx`) — six steps: hardware experience → the
   week themes → PCB week (a primer for beginners, example projects for everyone else) → project
   creation with starter ideas → funding tier (suggested from step 1, locked to tier 1 if a
   starter project was picked) → time tracking, with a dismiss in the corner for people who have
   journalled before.
4. **Tab tour** across the Doomscroller, Explore, Shop, Docs and Leaderboard. One highlight
   travels between targets rather than re-entering at each step, so the eye can follow it; the
   measure loop that keeps it glued to its target runs in bounded windows, since measuring every
   frame forever re-triggers the CSS transition and strands the box between steps.

## Design system

Brand comes from the Figma file: Plus Jakarta Sans for display, a hand-lettered face for labels,
and the cream / navy / sky / teal / magenta / coral / orange palette. Two things carry the look:

- **`.sketch`** — a wobbling marker outline drawn on a pseudo-element by an SVG
  `feTurbulence` + `feDisplacementMap` filter, so every panel border is hand-drawn without
  touching the content it frames. `.torn` applies the same displacement to a filled shape, which
  is how the week banners and page signs get their torn-tape edge.
- **`.puck`** — the checkpoint token: a rim disc behind, a face on top, a real ambient shadow
  beneath, and a press that sinks the face onto the rim.

Filters live in `components/art.tsx` (`SketchDefs`), mounted once in the root layout. Every
illustration — the fox, the five week scenes, the printer, the shop objects, the reel backdrops —
is authored SVG in that same file. Icons are a single hand-drawn-adjacent set on a 24px grid at
one stroke weight (`components/icons.tsx`).

## Responsive

- **≥1280px** — rail + trail + Doomscroller.
- **1024–1279px** — rail + trail; the Doomscroller opens as a drawer from the Reels button.
- **<1024px** — top bar with logo and stats, bottom tab bar, full-width trail, Doomscroller as a
  sheet. Modals become bottom sheets.

The trail itself is resolution-independent: node positions are a sine function of the checkpoint
index expressed as a percentage of the column width, so the curve holds from 360px to 1760px.
