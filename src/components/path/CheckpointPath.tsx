"use client";

import { useEffect, useRef } from "react";
import { EnderPrinter, WeekScene } from "@/components/art";
import {
  IconCheck,
  IconChevronsUp,
  IconClock,
  IconFilm,
  IconLock,
  IconPencil,
  IconPlay,
  IconSparkle,
  IconUpload,
} from "@/components/icons";
import { Chip, Meter, Panel, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Checkpoint, Week } from "@/lib/types";

/** Horizontal swing of the trail, as a percentage of the column width. */
const AMP = 23;
const CURVE = 1.02;

const offsetAt = (i: number) => Number((50 + AMP * Math.sin(i * CURVE)).toFixed(4));

const KIND_ICON = {
  onboarding: IconSparkle,
  project: IconPencil,
  journal: IconClock,
  reel: IconFilm,
  submit: IconUpload,
  demo: IconPlay,
} as const;

/**
 * A journal entry is a smaller beat than a milestone, and a long week is mostly
 * entries — so they get a smaller puck and a shorter stride. Big node, run of
 * small ones, big node: the week reads as rhythm instead of as a queue.
 */
const isBeat = (c: Checkpoint) => c.kind === "journal";

/** Where a node sits, counting the strides taken to reach it. */
const offsetOf = (full: number, beats: number, extra = "") =>
  `calc(var(--lead) + var(--step) * ${full} + var(--step-sm) * ${beats}${extra})`;

/** Hours, two decimals at most and never a trailing zero. */
const fmtH = (h: number) => `${Math.round(h * 100) / 100}h`;

function nodeTone(kind: Checkpoint["kind"], done: boolean, unlocked: boolean) {
  if (!unlocked) return "puck-locked";
  // The onboarding puck keeps its gold once it is finished. It is the landmark
  // for where the trail started; the check is what says it is done.
  if (kind === "onboarding") return "puck-gold";
  if (done) return "puck-done";
  if (kind === "submit" || kind === "demo") return "puck-gate";
  return "";
}

function CheckpointNode({
  checkpoint,
  top,
  left,
  isCurrent,
}: {
  checkpoint: Checkpoint;
  top: string;
  left: string;
  isCurrent: boolean;
}) {
  const { stateOf, isUnlocked, setOpenCheckpoint, phase } = useStore();
  const st = stateOf(checkpoint.id);
  const unlocked = isUnlocked(checkpoint.id);
  const Icon = st.done ? IconCheck : unlocked ? KIND_ICON[checkpoint.kind] : IconLock;
  // Gold stays gold after completion, so the icon on it has to stay navy.
  const gold = checkpoint.kind === "onboarding";

  const status = st.done ? "Completed" : unlocked ? "Available" : "Locked";

  return (
    <div
      data-cp={checkpoint.id}
      // No z-index: the week banner is a sticky header and has to win. Nodes
      // paint in DOM order, which already puts each callout over the node
      // above it, and --lead keeps the first one clear of the banner.
      className={cx(
        "absolute flex flex-col items-center",
        isBeat(checkpoint) ? "w-[var(--node-sm)]" : "w-[var(--node)]",
      )}
      style={{ top, left, transform: "translateX(-50%)" }}
    >
      {isCurrent && phase !== "aim" && (
        <div
          data-callout=""
          className="pointer-events-none absolute bottom-[calc(100%_+_10px)] z-20 w-max max-w-[min(11rem,38vw)]"
        >
          <div
            className={cx(
              "sketch relative rounded-2xl px-3.5 py-2 text-center motion-safe:animate-[hl-bob_2.4s_ease-in-out_infinite]",
              gold ? "bg-gold text-navy" : "bg-navy text-white",
            )}
            style={
              {
                "--sk-color": gold ? "var(--color-gold-deep)" : "var(--color-navy)",
                "--sk-radius": "14px",
              } as React.CSSProperties
            }
          >
            <p className="label whitespace-nowrap">{st.done ? "Redo" : "Start here"}</p>
            <p className="mt-0.5 text-[0.74rem] leading-tight font-semibold opacity-85">
              {checkpoint.title}
            </p>
            <span
              aria-hidden="true"
              className={cx(
                "absolute top-full left-1/2 -ml-2 size-0 border-x-8 border-t-[9px] border-x-transparent",
                gold ? "border-t-gold" : "border-t-navy",
              )}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        data-tour={checkpoint.kind === "onboarding" ? "first-checkpoint" : undefined}
        disabled={!unlocked}
        onClick={() => setOpenCheckpoint(checkpoint.id)}
        aria-label={`${checkpoint.title} — ${status}`}
        className={cx("puck", nodeTone(checkpoint.kind, st.done, unlocked))}
      >
        {isCurrent && <span aria-hidden="true" className={cx("halo", gold && "halo-gold")} />}
        <span className="puck-face">
          <Icon
            className={cx(
              isBeat(checkpoint)
                ? "text-[clamp(0.95rem,2.8vw,1.25rem)]"
                : "text-[clamp(1.5rem,4.4vw,2rem)]",
              !unlocked ? "text-sand-deep" : gold ? "text-navy" : "text-white",
            )}
            strokeWidth={st.done ? 3 : 2}
          />
        </span>
      </button>

      <p
        className={cx(
          "hand mt-2 text-center leading-tight",
          isBeat(checkpoint) ? "text-[0.64rem]" : "text-[0.72rem]",
          unlocked ? "text-navy" : "text-navy-soft/70",
        )}
      >
        {checkpoint.title}
      </p>
      {unlocked && st.done && st.minutes > 0 && (
        <p className="hand text-[0.66rem] leading-tight text-navy-soft tabular-nums">
          {fmtH(st.minutes / 60)}
        </p>
      )}
    </div>
  );
}

function WeekBanner({ week, index }: { week: Week; index: number }) {
  const { stateOf } = useStore();
  const done = week.checkpoints.filter((c) => stateOf(c.id).done).length;

  return (
    <div data-week-banner="" className="sticky top-16 z-10 -mx-1 px-1 pt-4 pb-3">
      <div className="relative">
        <div
          aria-hidden="true"
          className="torn absolute inset-0 rounded"
          style={{
            background: week.accent,
            boxShadow: "0 3px 6px rgba(28,26,89,.12), 0 16px 34px -18px rgba(28,26,89,.5)",
          }}
        />
        <div className="relative flex items-center gap-3 px-5 py-3.5 sm:gap-5 sm:px-7 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className="label text-white/85">
              Week {week.id}/10 · {week.phase === "design" ? "Design" : "Build"}
            </p>
            <h2 className="mt-0.5 truncate text-[1.25rem] leading-none font-extrabold tracking-[-0.025em] text-white sm:text-[1.75rem]">
              {week.headline}
            </h2>
            <p className="mt-1.5 hidden max-w-[52ch] text-[0.82rem] leading-snug text-white/85 sm:block">
              {week.summary}
            </p>
          </div>
          <WeekScene
            theme={week.theme}
            className="hidden h-16 w-auto shrink-0 drop-shadow-md sm:block md:h-[74px]"
          />
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="label rounded-full bg-white/25 px-2.5 py-1 text-white tabular-nums">
              {done}/{week.checkpoints.length}
            </span>
            {index === 0 && (
              <IconChevronsUp className="hidden text-lg text-white/70 sm:block" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One week's stretch of trail. Positions are walked rather than multiplied,
 * because entries and milestones take different-sized strides — but the
 * left-right swing still comes from the node's place in the line.
 */
function WeekTrail({ week, currentId }: { week: Week; currentId: string | null }) {
  const placed: { cp: Checkpoint; full: number; beats: number; beat: boolean }[] = [];
  let full = 0;
  let beats = 0;
  for (const [i, cp] of week.checkpoints.entries()) {
    const beat = isBeat(cp);
    if (i > 0) {
      if (beat) beats += 1;
      else full += 1;
    }
    placed.push({ cp, full, beats, beat });
  }

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < placed.length - 1; i += 1) {
    const stride = placed[i + 1].beat ? "var(--step-sm)" : "var(--step)";
    const size = placed[i].beat ? "var(--node-sm)" : "var(--node)";
    for (const f of [0.3, 0.5, 0.7]) {
      dots.push(
        <span
          key={`${i}-${f}`}
          aria-hidden="true"
          className="absolute size-[7px] rounded-full bg-line-strong/45"
          style={{
            top: offsetOf(placed[i].full, placed[i].beats, ` + ${f} * ${stride} + ${size} / 2`),
            left: `${offsetAt(i + f)}%`,
            transform: "translate(-50%, -50%)",
          }}
        />,
      );
    }
  }

  return (
    <div className="relative" style={{ height: offsetOf(full, beats, " + var(--node) + 52px") }}>
      {dots}
      {placed.map(({ cp, full: f, beats: b }, i) => (
        <CheckpointNode
          key={cp.id}
          checkpoint={cp}
          top={offsetOf(f, b)}
          left={`${offsetAt(i)}%`}
          isCurrent={cp.id === currentId}
        />
      ))}
    </div>
  );
}

function PhaseDivider() {
  return (
    <div className="relative my-10 flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <Panel tone="teal" radius={999} className="bg-mint px-5 py-2">
        <p className="label text-teal-deep">Halfway — now you build all five</p>
      </Panel>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function GrandPrize() {
  const { totalDone, totalCheckpoints: total } = useStore();
  return (
    <Panel tone="gold" radius={24} className="relative mt-12 overflow-hidden bg-gold-pale px-6 py-8 sm:px-10">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <EnderPrinter className="h-40 w-auto shrink-0 sm:h-48" />
        <div className="min-w-0">
          <Chip tone="gold">Finish all ten weeks</Chip>
          <h2 className="mt-3 text-[1.7rem] leading-tight font-extrabold tracking-[-0.03em] text-navy sm:text-[2.2rem]">
            Creality Ender V3
          </h2>
          <p className="mt-2 max-w-[54ch] text-[0.95rem] leading-relaxed text-navy-soft">
            Ship every week and the printer is yours, shipped to your door. Miss a week and you keep
            everything you built anyway — the funding is not a loan.
          </p>
          <Meter className="mt-5 max-w-sm" value={totalDone} max={total} tone="gold" label={`${totalDone}/${total} checkpoints`} />
        </div>
      </div>
    </Panel>
  );
}

export function CheckpointPath() {
  const { currentCheckpointId, hydrated, phase, weeks } = useStore();
  const scrolled = useRef(false);

  useEffect(() => {
    if (!hydrated || scrolled.current || !currentCheckpointId) return;
    if (phase === "cinematic" || phase === "aim") return;
    scrolled.current = true;
    const node = document.querySelector<HTMLElement>(`[data-cp="${currentCheckpointId}"]`);
    if (!node) return;
    node.scrollIntoView({ block: "center", behavior: "auto" });

    // The week banner is sticky, so centring the node can park its callout
    // underneath it. Hand back whatever the banner took, plus a little air.
    const callout = node.querySelector<HTMLElement>("[data-callout]");
    const banner = node.closest("section")?.querySelector<HTMLElement>("[data-week-banner]");
    if (!callout || !banner) return;
    const overlap = banner.getBoundingClientRect().bottom + 12 - callout.getBoundingClientRect().top;
    if (overlap > 0) window.scrollBy(0, -overlap);
  }, [hydrated, currentCheckpointId, phase]);

  return (
    <div
      className="mx-auto w-full max-w-[720px] px-4 sm:px-8"
      style={
        {
          "--node": "clamp(72px, 13.5vw, 98px)",
          "--step": "clamp(140px, 20vw, 162px)",
          /* An entry is a beat, not a milestone: smaller puck, shorter stride,
             so a twenty-entry week stays a trail instead of a corridor. */
          "--node-sm": "clamp(42px, 7.5vw, 54px)",
          "--step-sm": "clamp(84px, 11vw, 96px)",
          /* Room between a week banner and its first puck for the callout
             that hangs above the current checkpoint, bob included. */
          "--lead": "clamp(70px, 9vw, 80px)",
        } as React.CSSProperties
      }
    >
      {weeks.map((week, wi) => (
        <section key={week.id} aria-labelledby={`week-${week.id}`}>
          {wi === 5 && <PhaseDivider />}
          <h3 id={`week-${week.id}`} className="sr-only">
            Week {week.id}: {week.fullName}
          </h3>
          <WeekBanner week={week} index={wi} />
          <WeekTrail week={week} currentId={currentCheckpointId} />
        </section>
      ))}
      <GrandPrize />
    </div>
  );
}
