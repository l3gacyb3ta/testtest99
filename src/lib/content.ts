/**
 * Every word and fact on the page. Copy is taken from the approved comp
 * (Figma "landing page (claude)", node 275:8). Nothing here is invented:
 * program claims — dates, prize list, funding cap, community size —
 * are the comp's own.
 */

export const BRAND = {
  name: "Half Life",
  tagline: "become a hardware expert in 10 weeks, get a 3D printer",
} as const;

export type DesignWeek = { subject: string; week: string };

/** Week 1 leads at display scale; weeks 2–5 sit beneath it. */
export const DESIGN_WEEKS: { lead: DesignWeek; rest: DesignWeek[] } = {
  lead: { subject: "PCBs", week: "week 1" },
  rest: [
    { subject: "CAD", week: "week 2" },
    { subject: "synths", week: "week 3" },
    { subject: "displays", week: "week 4" },
    { subject: "breadboard logic", week: "week 5" },
  ],
};

export type Step = {
  id: string;
  title: string;
  /** Slot the user drops a real photo into. */
  slot?: { label: string; ratio: string };
  caption?: string;
};

export const STEPS: Step[] = [
  {
    id: "design",
    title: "spend 5 weeks designing 5 projects",
  },
  {
    id: "funding",
    title: "get funding and order your parts!",
    slot: { label: "order flow", ratio: "736 × 155" },
    caption: "up to $100 per project!",
  },
  {
    id: "build",
    title: "then spend 5 weeks building your projects!",
    slot: { label: "build photo", ratio: "736 × 269" },
  },
  {
    id: "printer",
    title: "get a 3D printer!",
    slot: { label: "prize lineup", ratio: "736 × 269" },
  },
];

export type Aside = { id: string; title: string; body: string };

export const ASIDES: Aside[] = [
  {
    id: "viral",
    title: "earn more prizes by going viral!",
    body: "Make videos, posts, and blogs about your Half Life projects! If they hit our virality threshold, you'll earn extra prizes like plushies, drawing tablets, and iPads!",
  },
  {
    id: "community",
    title: "100,000 more of you",
    body: "Hack Club has a community of over 100,000 teenagers from around the globe, who all love building projects and learning how to build projects. Join now at hackclub.com/slack!",
  },
];

export type BuildCard = {
  id: string;
  /** Names the project. Not drawn -- it is the photograph's alt text. */
  label: string;
  credit: string;
  /**
   * The project photograph, as a path under `public/`. Optional on purpose: a
   * card without one falls back to the drawn slot, so the belt fills up one
   * project at a time instead of needing the whole set before it renders.
   */
  photo?: string;
  /** The drawn footprint, standing in until `photo` lands. */
  slot: { label: string; ratio: string };
};

export const BUILD_CARDS: BuildCard[] = [
  {
    id: "hexapod",
    label: "hexapod",
    credit: "by Joshua, 18, from Quebec",
    photo: "/imgs/hexapod.png",
    slot: { label: "project photo", ratio: "329 x 377" },
  },
  {
    id: "jukebox",
    label: "jukebox",
    credit: "by Dani, 17, from New York",
    photo: "/imgs/jukebox.png",
    slot: { label: "project photo", ratio: "329 x 377" },
  },
  {
    id: "macropad",
    label: "macropad",
    credit: "by Nirvaan, 14, from New Jersey",
    photo: "/imgs/macropad.png",
    slot: { label: "project photo", ratio: "329 x 377" },
  },
  {
    id: "flightcontroller",
    label: "flight controller",
    credit: "by Archit, 15, from Australia",
    photo: "/imgs/flightcontroller.png",
    slot: { label: "project photo", ratio: "329 x 377" },
  },
];


export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Who is this for?",
    a: "Half Life is for teenagers 13-18 (inclusive)! Whether you've never touched hardware before or you're a multiplexing master, Half Life is your place to become a well-rounded hardware expert.",
  },
  {
    q: "I don't know hardware!",
    a: "That's okay! We have guided projects and hardware experts to help you out. Half Life is for beginners, experts, and all the levels in between.",
  },
  {
    q: "Is this free?",
    a: "Yep! Hack Club programs are free to participate in. We provide funding for hardware projects and all prizes (like 3D printers) are free! We do not cover customs costs.",
  },
  {
    q: "What's Hack Club?",
    a: "Hack Club is a 501(c)(3) nonprofit that helps teenagers around the world build technical projects and go on awesome adventures!",
  },
  {
    q: "How long does this last?",
    a: "Half Life is running for 10 weeks! September 14th to 25th will be warmup weeks, and then PCB Week will start!",
  },
  {
    q: "What do I get?",
    a: "Up to $100 of funding per project, a 3D printer or a laptop for finishing all ten weeks, and extra prizes — plushies, drawing tablets, iPads — if your project posts go viral.",
  },
];

/**
 * The one group shot under "here's what you'll make!" — every project in a
 * single frame, where the comp scattered five separate prints.
 *
 * Currently rendered as an `ImageSlot`. To ship the real photograph: drop it
 * at `/art/make/make-all.png`, then swap `ImageSlot` for `next/image` in
 * `hero.tsx` — both call sites already reserve the correct box, so nothing
 * around them has to move.
 */
export const MAKE_PHOTO = {
  label: "every project",
  /** Footprint on the comp's 1728px grid; supply the art at 2x. */
  ratio: "380 × 214",
} as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Half Life",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "What you can build", href: "#what-can-i-build" },
      { label: "FAQ", href: "#faq" },
      { label: "Sign up", href: "#signup" },
    ],
  },
  {
    heading: "Hack Club",
    links: [
      { label: "hackclub.com", href: "https://hackclub.com" },
      { label: "Philosophy", href: "https://hackclub.com/philosophy" },
      { label: "Team", href: "https://hackclub.com/team" },
      { label: "Donate", href: "https://hackclub.com/donate" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Slack", href: "https://hackclub.com/slack" },
      { label: "Scrapbook", href: "https://scrapbook.hackclub.com" },
      { label: "GitHub", href: "https://github.com/hackclub" },
      { label: "Conduct", href: "https://hackclub.com/conduct" },
    ],
  },
] as const;
