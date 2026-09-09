# Half Life

Landing page for Half Life — Hack Club's ten-week hardware programme. Built to
the Figma frame **"landing page (claude)"** (`275:8`), using the palette from
the **"color scheme"** frame (`275:222`).

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build && pnpm start
```

Visual system is documented in [DESIGN.md](./DESIGN.md).

## What's where

```
src/app/page.tsx              section composition
src/app/layout.tsx            fonts, metadata, direction contract
src/app/globals.css           palette tokens, .stage, reveal states
src/app/api/subscribe/        email capture endpoint
src/app/api/slack/            channel auto-invite + #halflife-help ticket bot
src/lib/content.ts            every word and fact on the page
src/lib/stage.ts              comp-pixel -> container-unit helpers
src/lib/signups.ts            signup sinks + rate limit
src/components/               hero, process, carousel, faq, footer
public/art/                   hero painting, scatter photos, comp SVG exports
```

## Things you'll want to swap

### 1. The logo

`src/components/wordmark.tsx` sets the wordmark in live type by default. Drop
your artwork in `public/brand/` and set one constant:

```ts
const LOGO_SRC = "/brand/half-life-wordmark.svg";
const LOGO_ASPECT = 981 / 261; // your file's width ÷ height
```

The comp reserves a 981 × 261 box. The slot fills its width either way, so
nothing else changes.

### 2. The step photos and project photos

Every reserved photo is an `<ImageSlot>` — an ink plate with cyan registration
ticks and the artwork's native size printed in it, so an empty slot reads as a
deliberate footprint rather than a broken image. Each one tells you its size:

| Where                          | Native size | File                                  |
| ------------------------------ | ----------- | ------------------------------------- |
| Step 2 — "get funding…"        | 736 × 155   | `src/components/process.tsx`          |
| Step 3 — "then spend 5 weeks…" | 736 × 269   | `src/components/process.tsx`          |
| Step 4 — "get a 3D printer!"   | 736 × 269   | `src/components/process.tsx`          |
| Carousel cards (×5)            | 329 × 377   | `src/lib/content.ts` → `BUILD_CARDS`  |

Replace an `<ImageSlot …/>` with `<Image …/>` in the same wrapper — the box is
already the comp's box.

### 3. Where the emails go

`POST /api/subscribe` validates, normalises and de-duplicates, then writes to
one of two sinks:

| Env                     | Behaviour                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `SIGNUP_WEBHOOK_URL`    | `POST { email, source, at }` to your list provider or relay      |
| `SIGNUP_WEBHOOK_TOKEN`  | optional `Authorization: Bearer …` for that webhook              |
| *(neither set)*         | appends JSON Lines to `./data/signups.jsonl` (gitignored)         |

The file sink is fine for local development and any host with a writable disk.
**It is not durable on serverless** — point `SIGNUP_WEBHOOK_URL` at a real
provider before launch. The rate limit is per-instance and coarse; put Vercel
BotID or a WAF rule in front of the route for real abuse protection.

### 4. The Slack bot

`src/app/api/slack/events/` and `src/app/api/slack/interactions/` back a bot
that:

- invites anyone who joins the main Half Life channel into
  `#halflife-bulletin` and `#halflife-help`
- posts every new top-level message in `#halflife-help` into a private
  tickets channel with a **Mark as helped** button (anyone with access to
  that channel can click it), and replies in-thread in `#halflife-help` with
  an **I'm all set** button that only the ticket's own author can click

Either button resolves the ticket: it edits its own message in place, and —
for the author's button — also updates the tickets-channel message so staff
can see it's already handled. There's no database; each button's own
`value` carries the pointer(s) it needs back to the other message(s). One
known gap: if staff resolve a ticket first, the author's button is left
active and clicking it afterward will just re-mark things as resolved by
the author — harmless, but slightly confusing if it happens.

Create the app from `slack-app-manifest.yml` at the repo root (see the
comments in that file for the exact steps), then set:

| Env                          | What                                                      |
| ----------------------------- | ---------------------------------------------------------- |
| `SLACK_BOT_TOKEN`             | Bot User OAuth Token (`xoxb-…`)                            |
| `SLACK_SIGNING_SECRET`        | Basic Information → Signing Secret, verifies both routes  |
| `SLACK_MAIN_CHANNEL_ID`       | channel that triggers the auto-invite                      |
| `SLACK_BULLETIN_CHANNEL_ID`   | `#halflife-bulletin`'s channel ID                          |
| `SLACK_HELP_CHANNEL_ID`       | `#halflife-help`'s channel ID                               |
| `SLACK_TICKETS_CHANNEL_ID`    | private channel new/resolved tickets get posted to         |

The bot needs to be a member of all four channels — invite it manually after
installing.

### 5. Facts to confirm before launch

- The carousel credits are the comp's placeholder credit ("by Meghana, 17, from
  Ohio") repeated across five cards — replace with the real makers.
- Hack Club's EIN (`81-2908499`) is in the footer. Confirm it and decide whether
  you also want the mailing address, which the Hack Club footer carries.
- FAQ card six ("What do I get?") replaces a duplicated "What's Hack Club?" in
  the comp. Its copy is assembled from facts the comp already states.

## Responsive behaviour

Two layouts, on purpose:

- **≥ 1180px** — `.stage` reproduces the comp's 1728px grid exactly. Every
  offset is written as its literal Figma pixel and resolved in `cqw`, so the
  composition scales continuously instead of snapping.
- **< 1180px** — the same content stacked, with the connector bands re-drawn as
  short vertical tapers between plates.
