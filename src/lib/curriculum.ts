import type { Checkpoint, Phase, Tier, WeekMeta } from "./types";

/**
 * Ten weeks: five design weeks, then the same five themes built for real.
 * Checkpoint sequences follow the Checkpoint framework exactly — week 1 opens
 * with the yellow onboarding checkpoint, later design weeks alternate
 * journal/reel pairs, and build weeks end on a working-demo video.
 */

interface ThemeSeed {
  theme: string;
  designHeadline: string;
  buildHeadline: string;
  fullName: string;
  summary: string;
  primer: string;
  examples: string[];
  accent: string;
  accentDeep: string;
}

const THEMES: ThemeSeed[] = [
  {
    theme: "PCB",
    designHeadline: "DESIGN YOUR PCB",
    buildHeadline: "SOLDER YOUR PCB",
    fullName: "Printed Circuit Board Week",
    summary: "Draw a schematic, route a board, and order it from a real fab.",
    primer:
      "A PCB is the flat green (or purple, or black) board inside every piece of electronics. Copper lines etched onto it replace the messy wires you would otherwise solder by hand. You will draw a schematic — a diagram of which part connects to which — then lay those parts out on a board and let the software route copper between them. At the end you export a set of Gerber files and a real factory turns them into a board you can hold.",
    examples: [
      "A macropad with hot-swap sockets and per-key LEDs",
      "An ESP32 dev board with a built-in battery charger",
      "A USB-C power delivery trigger you can set with a dial",
      "A badge PCB shaped like your handle, with blinky eyes",
    ],
    accent: "var(--color-sky)",
    accentDeep: "var(--color-sky-deep)",
  },
  {
    theme: "CAD",
    designHeadline: "MODEL YOUR PART",
    buildHeadline: "PRINT YOUR PART",
    fullName: "Computer Aided Design Week",
    summary: "Model a part in 3D with tolerances that survive a real printer.",
    primer:
      "CAD is drawing an object as a solid with exact dimensions instead of a sketch. You start from a 2D sketch, pull it into 3D, then cut and round it until it is the shape you want. The hard part is not the software — it is tolerance: a hole modelled at exactly 3mm will not fit a 3mm screw once the printer squishes plastic into it.",
    examples: [
      "An enclosure for the PCB you designed in week 1",
      "A desk arm that clamps a phone at eye height",
      "A parametric spool holder that fits any spool width",
      "A mechanical keyboard case with a gasket mount",
    ],
    accent: "var(--color-teal)",
    accentDeep: "var(--color-teal-deep)",
  },
  {
    theme: "Synth",
    designHeadline: "DESIGN YOUR SYNTH",
    buildHeadline: "WIRE YOUR SYNTH",
    fullName: "Synth & Music Week",
    summary: "Make something that makes noise on purpose.",
    primer:
      "A synth turns voltage into sound. The simplest one is an oscillator — a circuit that flips a pin on and off fast enough to hear — plus something to shape the volume over time. Add a filter and you have a voice. You can build this from a 555 timer, from op-amps, or from a microcontroller running a wavetable. All three count.",
    examples: [
      "A 555-based drone synth with three detuned oscillators",
      "A MIDI controller with velocity-sensitive pads",
      "A Eurorack-format LFO module in 4HP",
      "A pocket sampler that records to an SD card",
    ],
    accent: "var(--color-magenta)",
    accentDeep: "#7d0f6c",
  },
  {
    theme: "Displays",
    designHeadline: "DESIGN YOUR DISPLAY",
    buildHeadline: "DRIVE YOUR DISPLAY",
    fullName: "Displays Week",
    summary: "Put pixels somewhere they do not belong.",
    primer:
      "Displays are the fastest way to make a project feel finished. E-paper sips power and holds an image with none. OLED is crisp and tiny. LED matrices are bright enough to read across a room. Each one talks a different protocol — SPI, I2C, or raw shift registers — and the driver you pick decides how much of your microcontroller is left over for anything else.",
    examples: [
      "An e-paper name badge that updates over Bluetooth",
      "A 32x32 LED matrix that mirrors your now-playing track",
      "A split-flap display driven by stepper motors",
      "A tiny OLED wristwatch with a custom watchface",
    ],
    accent: "var(--color-orange)",
    accentDeep: "var(--color-orange-deep)",
  },
  {
    theme: "Breadboard computer",
    designHeadline: "PLAN YOUR COMPUTER",
    buildHeadline: "BUILD YOUR COMPUTER",
    fullName: "Breadboard Computer Week",
    summary: "A working computer out of logic chips and a lot of wire.",
    primer:
      "Underneath every processor is a clock, a register, an adder and some way to decide what happens next. Wire those four things together out of 74-series logic chips and you have a computer — slow, hot, and entirely yours. Start with the clock module, get an LED blinking at a speed you can follow, then add a register you can load by hand.",
    examples: [
      "An 8-bit SAP-1 computer across four breadboards",
      "A 4-bit ALU with carry-lookahead you can single-step",
      "A relay-based adder you can hear compute",
      "A programmable clock module with manual step mode",
    ],
    accent: "var(--color-violet)",
    accentDeep: "var(--color-violet-deep)",
  },
];

const cp = (c: Checkpoint): Checkpoint => c;

/** A build week is the same five hours for everyone: two, then three. */
export const BUILD_BLOCKS = [2, 3];
export const BUILD_HOURS = BUILD_BLOCKS.reduce((n, h) => n + h, 0);

/** Every week's fixed half — everything that does not depend on the tier. */
export const WEEK_META: WeekMeta[] = [
  ...THEMES.map((seed, i) => ({
    id: i + 1,
    phase: "design" as Phase,
    theme: seed.theme,
    headline: seed.designHeadline,
    fullName: seed.fullName,
    summary: seed.summary,
    primer: seed.primer,
    examples: seed.examples,
    accent: seed.accent,
    accentDeep: seed.accentDeep,
  })),
  ...THEMES.map((seed, i) => ({
    id: i + 6,
    phase: "build" as Phase,
    theme: seed.theme,
    headline: seed.buildHeadline,
    fullName: `${seed.fullName} — Build`,
    summary: `Assemble the ${seed.theme.toLowerCase()} project you designed in week ${i + 1}.`,
    primer: seed.primer,
    examples: seed.examples,
    accent: seed.accent,
    accentDeep: seed.accentDeep,
  })),
];

/** Reels land on the clock: one every ten hours of logged work, indefinitely. */
export const REEL_EVERY = 10;

/**
 * A reel older than this cannot close a week. Going quiet for eight hours and
 * then submitting would put work on the board nobody ever saw, so the submit
 * path asks for a fresh one — while the ten-hour cadence governs carrying on.
 */
export const REEL_STALE = 8;

/**
 * The week's checkpoints.
 *
 * Every journal entry is its own node, so the trail is as long as the work
 * actually was — plus one live node for the entry about to be written. Reels
 * are milestones on the week's clock: one falls due every ten hours, placed at
 * the entry that crossed the mark so the trail reads as a chronology rather
 * than a queue with the reels swept to the end. The next, unearned reel always
 * trails the chain so the cadence is visible before you get there.
 *
 * Submit opens the moment the tier's funded hours are on the board — that is
 * the fork: wrap up, or keep logging. The closing reel is not a node at all; it
 * is the last step inside Submit, so submitting always ships a reel.
 */
export function checkpointsFor(
  meta: WeekMeta,
  tier: Tier,
  entryMinutes: number[],
  isDone: (id: string) => boolean,
): Checkpoint[] {
  const id = (n: string) => `w${meta.id}-${n}`;
  const out: Checkpoint[] = [];

  const entry = (n: number) =>
    cp({
      id: id(`entry-${n}`),
      weekId: meta.id,
      kind: "journal",
      title: `Entry ${n}`,
      blurb: "One session: what you did, and the timelapse that proves it.",
      entryTarget: 1,
    });

  const milestoneReel = (k: number) =>
    cp({
      id: id(`reel-${k}`),
      weekId: meta.id,
      kind: "reel",
      atHours: k * REEL_EVERY,
      title: `${k * REEL_EVERY}h reel`,
      blurb:
        k === 1
          ? "Ten hours in. Show where the work actually got to."
          : "What has changed since the last one.",
      reelBrief:
        k === 1
          ? "Screen-share what you have and narrate one decision you reversed."
          : "Put the last version next to this one and say what moved.",
    });

  const catchUpReel = (k: number) =>
    cp({
      id: id(`reel-catchup-${k}`),
      weekId: meta.id,
      kind: "reel",
      atHours: k * REEL_EVERY + REEL_STALE,
      title: "Catch-up reel",
      blurb: "Eight hours since your last reel. One more before the week closes.",
      reelBrief: "Where it stands right now, and the one thing you still have not solved.",
    });

  // Walk the entries, dropping a reel in wherever the clock crosses ten hours.
  let hours = 0;
  let reels = 0;
  const live = entryMinutes.length + 1;
  const pushEntry = (n: number) => {
    out.push(entry(n));
    hours += (entryMinutes[n - 1] ?? 0) / 60;
    while (Math.floor(hours / REEL_EVERY) > reels) {
      // A catch-up taken at this level stays on the trail, in the place it
      // happened: just before the milestone that superseded it.
      if (isDone(id(`reel-catchup-${reels}`))) out.push(catchUpReel(reels));
      reels += 1;
      out.push(milestoneReel(reels));
    }
  };

  if (meta.phase === "design") {
    const ideaReel = cp({
      id: id("reel-idea"),
      weekId: meta.id,
      kind: "reel",
      title: "Idea reel",
      blurb: "30 seconds on what you are making and why anyone should care.",
      reelBrief: "Hold up a sketch, say the idea out loud, name one thing you are unsure about.",
    });

    if (meta.id === 1) {
      out.push(
        cp({
          id: id("onboard"),
          weekId: meta.id,
          kind: "onboarding",
          title: "Get started",
          blurb: "Six quick questions, then your first project exists.",
        }),
      );
      // Week one keeps its ritual: write one entry, then pitch the idea.
      pushEntry(1);
      out.push(ideaReel);
      for (let n = 2; n <= live; n += 1) pushEntry(n);
    } else {
      out.push(
        cp({
          id: id("project"),
          weekId: meta.id,
          kind: "project",
          title: "New project",
          blurb: `Name your ${meta.theme.toLowerCase()} project and pick a funding tier.`,
        }),
        ideaReel,
      );
      for (let n = 1; n <= live; n += 1) pushEntry(n);
    }
  } else {
    for (let n = 1; n <= live; n += 1) pushEntry(n);
  }

  // Submitting on a stale reel: past the tier's floor, eight hours since the
  // last reel, and the next ten-hour milestone not yet due. That band is the
  // only place this can bite — past it, the cadence takes over anyway.
  const floor = meta.phase === "build" ? BUILD_HOURS : tier.fundingHours;
  const catchUpAt = reels * REEL_EVERY + REEL_STALE;
  const overdue = hours >= catchUpAt && hours >= floor;
  if (overdue || isDone(id(`reel-catchup-${reels}`))) out.push(catchUpReel(reels));

  // The next one on the clock, so the cadence is visible before it is due.
  out.push(milestoneReel(reels + 1));

  out.push(
    cp({
      id: id("submit"),
      weekId: meta.id,
      // Opens on the tier's funded hours — the moment wrapping up becomes a
      // real choice rather than the only road left.
      atHours: meta.phase === "build" ? BUILD_HOURS : tier.fundingHours,
      kind: "submit",
      title: "Submit",
      blurb:
        meta.phase === "build"
          ? "A working demo, or an honest write-up of what still needs changing."
          : "Files, bill of materials, your tier, and the reel that closes the week.",
    }),
  );

  return out;
}

export const TIERS: Tier[] = [
  {
    id: 1,
    funding: 30,
    hours: "6–8 hours of work",
    toBank: "6 hours fund the project, the rest banks at 5 coins an hour",
    fundingHours: 6,
    prize: "On track for a Bambu A1 Mini",
    detail:
      "The right pick if this is your first board, model or circuit. Parts are cheap, the scope is one evening of soldering, and nothing here needs a tool you do not already have.",
  },
  {
    id: 2,
    funding: 65,
    hours: "13–15 hours of work",
    toBank: "13 hours fund the project, the rest banks at 5 coins an hour",
    fundingHours: 13,
    prize: "On track for a Creality Ender V3",
    detail:
      "For a project with a real enclosure, a handful of ICs, or a part you have to wait on. Most people land here by week three.",
  },
  {
    id: 3,
    funding: 120,
    hours: "24+ hours of work",
    toBank: "24 hours fund the project, the rest banks at 5 coins an hour",
    fundingHours: 24,
    prize: "On track for a Prusa Core One",
    detail:
      "Four-layer boards, motorised anything, or a build that needs two revisions to work. Pick this only if you have shipped something before.",
  },
];

export const STARTER_IDEAS = [
  {
    id: "macropad",
    name: "Three-key macropad",
    blurb: "Three switches, one microcontroller, zero surprises.",
    art: "pcb" as const,
  },
  {
    id: "badge",
    name: "Blinky name badge",
    blurb: "Your handle in copper with two LEDs for eyes.",
    art: "badge" as const,
  },
  {
    id: "usb",
    name: "USB-C breakout",
    blurb: "Break a USB-C port out to pins you can actually probe.",
    art: "usb" as const,
  },
  {
    id: "sensor",
    name: "Desk air monitor",
    blurb: "One sensor, one display, one small board.",
    art: "sensor" as const,
  },
];

export const SUBMIT_FILES_DESIGN = [
  { id: "schematic", label: "Schematic (.kicad_sch or PDF)", hint: "Every net named, no floating pins." },
  { id: "layout", label: "Board layout (.kicad_pcb)", hint: "Source file, not just an export." },
  { id: "gerbers", label: "Gerbers + drill files (.zip)", hint: "The exact zip you would hand a fab." },
  { id: "readme", label: "README with build notes", hint: "What it does, what you would change." },
  { id: "photos", label: "Renders or screenshots", hint: "At least one 3D view of the board." },
];

export const SUBMIT_FILES_BUILD = [
  { id: "demo", label: "30–60 second working demo", hint: "Show it doing the thing, with your voice over it." },
  { id: "photos", label: "Three photos of the finished build", hint: "Front, back, and one detail shot." },
  { id: "notes", label: "Assembly notes", hint: "What you got wrong the first time." },
];

export const BOM_ROWS = [
  { ref: "U1", part: "RP2040 microcontroller", qty: 1, unit: 1.1, vendor: "DigiKey" },
  { ref: "D1–D3", part: "1N4148 diode (SOD-123)", qty: 3, unit: 0.09, vendor: "DigiKey" },
  { ref: "SW1–SW3", part: "Kailh hot-swap socket", qty: 3, unit: 0.35, vendor: "LCSC" },
  { ref: "J1", part: "USB-C receptacle, 16-pin", qty: 1, unit: 0.62, vendor: "LCSC" },
  { ref: "—", part: "PCB fabrication, 4 boards", qty: 1, unit: 12.4, vendor: "JLCPCB" },
  { ref: "—", part: "Keycaps, blank PBT", qty: 3, unit: 0.9, vendor: "AliExpress" },
];
