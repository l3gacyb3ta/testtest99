import type { DocArticle, JournalEntry, LeaderRow, Reel, ShopItem } from "./types";

export const ME = {
  name: "John Cena",
  handle: "@johncena",
  avatar: "fox-blueprint",
  joined: "Week 1",
};

export const REELS: Reel[] = [
  {
    id: "hq-1",
    author: "Half Life HQ",
    handle: "@halflife",
    fromHQ: true,
    caption:
      "Week 1 is live. Ten weeks, five designs, five builds — and an Ender V3 at the end for everyone who finishes. Start with the yellow checkpoint.",
    week: "Week 1 · PCB",
    likes: 1284,
    comments: 219,
    views: 9420,
    scene: "hq",
  },
  {
    id: "r-2",
    author: "Joe Bob",
    handle: "@joebob",
    caption: "routed the whole board without a single ratline left. took four hours. worth it",
    week: "Week 1 · PCB",
    likes: 412,
    comments: 37,
    views: 2810,
    scene: "pcb",
  },
  {
    id: "r-3",
    author: "Froppii",
    handle: "@froppii",
    caption: "my enclosure fits. first try. i am never going to shut up about this",
    week: "Week 2 · CAD",
    likes: 908,
    comments: 121,
    views: 6140,
    scene: "cad",
  },
  {
    id: "r-4",
    author: "mira.builds",
    handle: "@mirabuilds",
    caption: "three 555s detuned by a few hertz each. headphones on, volume down, you have been warned",
    week: "Week 3 · Synth",
    likes: 655,
    comments: 88,
    views: 4390,
    scene: "synth",
  },
  {
    id: "r-5",
    author: "kelp",
    handle: "@kelp",
    caption: "e-paper badge updating over BLE. 40 days on one coin cell, allegedly",
    week: "Week 4 · Displays",
    likes: 733,
    comments: 64,
    views: 5021,
    scene: "display",
  },
  {
    id: "r-6",
    author: "sam0x",
    handle: "@sam0x",
    caption: "clock module ticking at 2Hz. next up: a register i can actually load",
    week: "Week 5 · Breadboard computer",
    likes: 489,
    comments: 52,
    views: 3307,
    scene: "bread",
  },
];

export const JOURNAL_FEED: JournalEntry[] = [
  {
    id: "j-1",
    author: "Joe Bob",
    avatar: "fox-goggles",
    project: "Hackpad",
    flames: 12,
    minutes: 214,
    when: "2h ago",
    group: "Today",
    body: "Today I started my first project in KiCad. I tried to follow the guide, but I ran into several issues because it is probably written for another version of KiCad. I had to google how to install the footprints and symbols, move the parts around, add the board outline, and so on. After figuring those out I finished my schematic and routed connections in PCB editor.",
    media: { kind: "board", caption: "Hackpad rev A — 2 layer, 60×42mm" },
  },
  {
    id: "j-2",
    author: "mira.builds",
    avatar: "fox-solder",
    project: "Loop Sampler",
    flames: 31,
    minutes: 176,
    when: "5h ago",
    group: "Today",
    body: "Spent the whole session on the power section. Turns out the regulator I picked drops out at 3.4V, which is exactly where the battery spends most of its life. Swapped it for a buck converter and now the noise floor is worse but it actually runs. Trade-offs, apparently.",
    media: { kind: "scope", caption: "Ripple on the 3V3 rail, 20mV/div" },
  },
  {
    id: "j-3",
    author: "Froppii",
    avatar: "fox-plain",
    project: "Pager",
    flames: 0,
    minutes: 48,
    when: "1 day, 6h ago",
    group: "Yesterday",
    body: "Today I ate a lot. Like very, very much. Good day, one might even say it is a great day. I am froppster of the froppland. I also moved two components on the board, which I am counting.",
  },
  {
    id: "j-4",
    author: "kelp",
    avatar: "fox-cap",
    project: "Inkbadge",
    flames: 18,
    minutes: 305,
    when: "1 day, 9h ago",
    group: "Yesterday",
    body: "E-paper refresh was ghosting badly until I found out you have to run a full clear cycle every ten partial updates. Wrote a tiny wrapper that tracks the count so I never have to think about it again. The display now looks like actual paper.",
    media: { kind: "bench", caption: "Bench setup: badge, probe, and too much coffee" },
  },
  {
    id: "j-5",
    author: "sam0x",
    avatar: "fox-goggles",
    project: "SAP-1",
    flames: 9,
    minutes: 132,
    when: "3 days ago",
    group: "Earlier this week",
    body: "Wired the clock module. The 555 astable is fine but the manual-step monostable was bouncing like crazy — added a proper debounce with a second 555 and now every button press is exactly one clock edge. Four breadboards to go.",
  },
  {
    id: "j-6",
    author: "nadia.k",
    avatar: "fox-solder",
    project: "Split-flap",
    flames: 24,
    minutes: 260,
    when: "4 days ago",
    group: "Earlier this week",
    body: "Modelled the flap drum in Fusion. Forty-five flaps at eight degrees each, which is where I learned that my printer cannot hold 0.2mm on a curved surface. Redesigned with a 0.4mm clearance and a chamfer on the leading edge.",
    media: { kind: "cad", caption: "Flap drum v4 — 45 positions, 0.4mm clearance" },
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "s-1",
    name: "Hardware grant",
    blurb: "$30 straight onto your project card. Spend it on parts, not shipping.",
    price: 31,
    category: "Grants",
    art: "grant",
    stock: "in",
  },
  {
    id: "s-2",
    name: "Bambu A1 Mini",
    blurb: "Bed-slinger, auto-levelling, genuinely good. Bank the coins on any tier.",
    price: 241,
    category: "Grants",
    art: "printer",
    stock: "low",
  },
  {
    id: "s-3",
    name: "Pinecil V2",
    blurb: "USB-C soldering iron that heats in six seconds and fits in a pencil case.",
    price: 64,
    category: "Tools",
    art: "iron",
    stock: "in",
  },
  {
    id: "s-4",
    name: "DS213 pocket scope",
    blurb: "Two channels, 100MS/s, small enough to live in your bag.",
    price: 185,
    category: "Tools",
    art: "scope",
    stock: "in",
  },
  {
    id: "s-5",
    name: "Starter parts kit",
    blurb: "Resistors, caps, headers, and the diodes you always run out of.",
    price: 42,
    category: "Parts",
    art: "kit",
    stock: "in",
  },
  {
    id: "s-6",
    name: "Half Life tee",
    blurb: "Heavyweight cotton, fox on the chest, half-life curve on the back.",
    price: 28,
    category: "Swag",
    art: "shirt",
    stock: "in",
  },
  {
    id: "s-7",
    name: "Sticker pack",
    blurb: "Eight die-cut vinyl stickers. Laptop lid, toolbox, your call.",
    price: 9,
    category: "Swag",
    art: "sticker",
    stock: "in",
  },
  {
    id: "s-8",
    name: "Bench multimeter",
    blurb: "Auto-ranging, true RMS, continuity beep that is actually fast.",
    price: 112,
    category: "Tools",
    art: "meter",
    stock: "out",
  },
  {
    id: "s-9",
    name: "PCB fab credit",
    blurb: "Covers five boards up to 100×100mm, including the shipping you forgot.",
    price: 35,
    category: "Grants",
    art: "grant",
    stock: "in",
  },
];

export const LEADERBOARD: LeaderRow[] = [
  { rank: 1, name: "mira.builds", handle: "@mirabuilds", hours: 118, ships: 7, streak: 61 },
  { rank: 2, name: "kelp", handle: "@kelp", hours: 104, ships: 6, streak: 54 },
  { rank: 3, name: "nadia.k", handle: "@nadiak", hours: 97, ships: 6, streak: 49 },
  { rank: 4, name: "sam0x", handle: "@sam0x", hours: 88, ships: 5, streak: 44 },
  { rank: 5, name: "Joe Bob", handle: "@joebob", hours: 81, ships: 5, streak: 38 },
  { rank: 6, name: "John Cena", handle: "@johncena", hours: 74, ships: 4, streak: 50, you: true },
  { rank: 7, name: "Froppii", handle: "@froppii", hours: 66, ships: 4, streak: 12 },
  { rank: 8, name: "tinny", handle: "@tinny", hours: 61, ships: 3, streak: 27 },
  { rank: 9, name: "opal", handle: "@opal", hours: 55, ships: 3, streak: 19 },
  { rank: 10, name: "brick", handle: "@brick", hours: 52, ships: 3, streak: 22 },
];

export const DOCS: DocArticle[] = [
  {
    slug: "how-it-works",
    title: "How Half Life works",
    section: "Start here",
    minutes: 4,
    summary: "Ten weeks, two halves, one printer at the end.",
    body: [
      {
        heading: "The shape of the program",
        paragraphs: [
          "Half Life runs for ten weeks. The first five are design weeks: each one has a theme, and you spend it designing a project around that theme. The second five are build weeks, in the same order — on week six you build the PCB you designed on week one, on week seven the CAD part from week two, and so on.",
          "You are not designing five things you will never make. Everything you draw in the first half arrives as real parts in the second.",
        ],
      },
      {
        heading: "Checkpoints",
        paragraphs: [
          "Each week is a chain of checkpoints. You cannot skip one — the next puck stays sand-coloured until the one before it is done. Most checkpoints are either a journal block (keep logging sessions until the week hits ten tracked hours) or a reel (a short video showing where you got to).",
          "The week ends on a submit gate. Design weeks ask for your files, a bill of materials, and a closing reel. Build weeks ask for a 30 to 60 second video of the thing working.",
        ],
        list: [
          "Journal checkpoints unlock at zero hours and close at the hour target.",
          "Reels are 30 seconds minimum and can be filmed on a phone.",
          "Submit gates are reviewed by a human, usually within two days.",
        ],
      },
      {
        heading: "What you get",
        paragraphs: [
          "Every project is funded up to its tier — $30, $65 or $120 — paid straight onto a card you can spend at real vendors. Hours beyond the funded block bank as coins at five an hour, and coins buy things in the shop.",
          "Finish all ten weeks and a printer is yours, shipped to you. Which one is up to you: you pick a goal, and the coins you bank buy it. Hit the hours every week and the cheapest machine is guaranteed — bank faster and you can aim higher.",
        ],
      },
    ],
  },
  {
    slug: "journalling",
    title: "Journalling and timelapses",
    section: "Start here",
    minutes: 3,
    summary: "How hours get counted, and what counts as a session.",
    body: [
      {
        heading: "What a session is",
        paragraphs: [
          "A session is one unbroken block of work on one project. Start the timer when you open the software, stop it when you walk away. If you take a twenty minute break, stop the timer — nobody is checking, but the reviewer can tell when four hours of logged time produced eleven minutes of timelapse.",
        ],
      },
      {
        heading: "Timelapses",
        paragraphs: [
          "Every session needs a screen recording or a camera pointed at the bench. The recorder speeds it up for you. A session with no timelapse still logs, but it does not count toward the hour target.",
        ],
        list: [
          "Screen recording for CAD, KiCad, and code.",
          "A phone on a stand for soldering and assembly.",
          "Both, if you are switching between them.",
        ],
      },
      {
        heading: "Writing the entry",
        paragraphs: [
          "Minimum is 200 characters. Say what you did, what broke, and what you are doing next. The best entries read like a note to yourself three weeks from now, because that is exactly who ends up reading them.",
        ],
      },
    ],
  },
  {
    slug: "tiers",
    title: "Funding tiers",
    section: "Money",
    minutes: 3,
    summary: "How much you get, and how hours turn into coins.",
    body: [
      {
        heading: "Picking a tier",
        paragraphs: [
          "You choose a tier when you create a project, and you can change it any time before you submit that week. Tier 1 funds $30 and expects six to eight hours. Tier 2 funds $65 and expects thirteen to fifteen. Tier 3 funds $120 and expects twenty-four or more.",
          "If you picked one of the starter projects during onboarding, your first week is locked to tier 1. That is on purpose — the starter projects are scoped so a $30 budget is genuinely enough.",
        ],
      },
      {
        heading: "How coins work",
        paragraphs: [
          "The first block of hours pays for the project itself. Everything after that banks at five coins an hour, and every dollar you save against your tier banks as one more coin. Work ten hours on a tier 1 project and you get $30 of funding plus twenty banked coins.",
          "Your tier does not decide which printer you finish with. That is what the banking is for, and it is the same five coins an hour on every tier — the tier only sets how many hours are funded underneath it. Bank a little each week on tier 3 projects and you finish with the cheapest machine; bank hard on tier 1 projects and you finish with the most expensive one.",
        ],
      },
    ],
  },
  {
    slug: "submitting",
    title: "Submitting a week",
    section: "Shipping",
    minutes: 4,
    summary: "The checklist reviewers actually use.",
    body: [
      {
        heading: "Design weeks",
        paragraphs: [
          "Three things: the files, the bill of materials, and a closing reel. Files means source files, not exports — a PDF of a schematic is not a schematic. The BOM needs a real vendor and a real price per line, and we ask for a screenshot of the cart so the numbers are checkable.",
        ],
        list: [
          "Every file in the checklist attached.",
          "BOM total inside your tier, or a note explaining why not.",
          "A 30 second reel walking through the final design.",
        ],
      },
      {
        heading: "Build weeks",
        paragraphs: [
          "One video, thirty to sixty seconds, of the project working, with your voice explaining what it does. If it does not work, that is still a valid submission — record what happens instead, and write up what needs to change. Reviewers pass honest failures and fail silent ones.",
        ],
      },
    ],
  },
  {
    slug: "reels",
    title: "Making a reel",
    section: "Shipping",
    minutes: 2,
    summary: "Thirty seconds, one idea, no editing required.",
    body: [
      {
        heading: "The format",
        paragraphs: [
          "Vertical, thirty to sixty seconds, filmed on whatever you have. Say what it is in the first five seconds. Show the thing, not your face. One idea per reel.",
        ],
      },
      {
        heading: "Where they go",
        paragraphs: [
          "Reels land in the Doomscroller, which is the feed on the right of your home screen and the main way anyone else in the program finds out what you are making. Likes and comments do nothing for your progress and everything for your mood.",
        ],
      },
    ],
  },
];
