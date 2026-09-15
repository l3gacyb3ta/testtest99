"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoxMark, ReelScene, WeekScene } from "@/components/art";
import {
  IconArrowRight,
  IconCamera,
  IconCart,
  IconCheck,
  IconClock,
  IconFile,
  IconFilm,
  IconMic,
  IconPlus,
  IconUpload,
  IconWarning,
} from "@/components/icons";
import { Button, Chip, Field, Meter, OptionRow, Panel, cx, inputClass } from "@/components/ui";
import { BOM_ROWS, SUBMIT_FILES_BUILD, SUBMIT_FILES_DESIGN, TIERS } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import type { Checkpoint } from "@/lib/types";
import { Modal, ModalTitle } from "./Modal";

const CLIPS = [
  { id: "c1", name: "kicad-session-01.mov", minutes: 48, thumb: "pcb" },
  { id: "c2", name: "bench-cam-2140.mp4", minutes: 72, thumb: "bread" },
  { id: "c3", name: "routing-final.mov", minutes: 35, thumb: "cad" },
];

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round((mins % 60) * 100) / 100;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

function DropZone({
  icon: Icon,
  title,
  hint,
  filled,
  onToggle,
}: {
  icon: typeof IconUpload;
  title: string;
  hint: string;
  filled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={filled}
      className={cx(
        "sketch flex w-full flex-col items-center justify-center gap-2 rounded-2xl px-6 py-8 text-center transition-colors",
        filled ? "bg-mint" : "bg-white hover:bg-violet-pale/50",
      )}
      style={
        {
          "--sk-color": filled ? "var(--color-teal)" : "var(--color-violet)",
          "--sk-radius": "18px",
        } as React.CSSProperties
      }
    >
      {filled ? (
        <IconCheck className="text-[1.75rem] text-teal-deep" />
      ) : (
        <Icon className="text-[1.75rem] text-violet" />
      )}
      <span className="text-[0.95rem] font-extrabold text-navy">{filled ? "Attached" : title}</span>
      <span className="max-w-[40ch] text-[0.82rem] leading-snug text-navy-soft">{hint}</span>
    </button>
  );
}

/* ================================================================== *
 * Journal + timelapse
 * ================================================================== */
/**
 * Two decimals at most, never a trailing zero: 7.5h, 9h, 9.55h. Rounded rather
 * than truncated because binary floats land on 44.799999999999955, and cutting
 * that gives 44.79 for a remainder that is really 44.8.
 */
const to2 = (n: number) => Math.round(n * 100) / 100;

/** Hours, written the way a person says them. */
function fmtH(h: number) {
  return `${to2(h)}h`;
}

export function JournalModal({ checkpoint }: { checkpoint: Checkpoint }) {
  const { setOpenCheckpoint, stateOf, logSession, complete, projects, weekOf, weekHours, isUnlocked } =
    useStore();

  const week = weekOf(checkpoint.weekId);

  // Every journal node is one entry: write it and it is done. The week's clock
  // is what decides whether wrapping up is on the table yet.

  const [tab, setTab] = useState<"journal" | "timelapse" | "sessions">("journal");
  const [picked, setPicked] = useState<string[]>([CLIPS[0].id]);
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState<number | null>(null);

  const project = projects.find((p) => p.weekId === (week.phase === "build" ? week.id - 5 : week.id))
    ?? projects[0];
  const sessionMinutes = CLIPS.filter((c) => picked.includes(c.id)).reduce((n, c) => n + c.minutes, 0);
  const ok = body.trim().length >= 200 && picked.length > 0;

  const hours = weekHours(week.id);
  const toFloor = Math.max(0, week.fundingHours - hours);
  // Wrapping up means Submit now — the closing reel is its last step. But a
  // reel that has already fallen due stands in front of it, so point there
  // instead of leaving the button mysteriously absent.
  const submitNode = week.checkpoints.find((c) => c.kind === "submit");
  const owedReel = week.checkpoints.find(
    (c) =>
      c.kind === "reel" &&
      c.atHours !== undefined &&
      hours >= c.atHours &&
      !stateOf(c.id).done,
  );
  const wrapUp = owedReel ?? submitNode;
  const canWrapUp =
    toFloor === 0 && wrapUp !== undefined && isUnlocked(wrapUp.id) && !stateOf(wrapUp.id).done;

  // Every session in the week, in order, whichever node it was written into.
  const weekLog = week.checkpoints
    .filter((c) => c.kind === "journal")
    .flatMap((c) => stateOf(c.id).log);

  // After saving, the trail has already grown the next entry node.
  const nextEntry = week.checkpoints.find(
    (c) => c.kind === "journal" && c.id !== checkpoint.id && !stateOf(c.id).done,
  );

  function save() {
    logSession(checkpoint.id, sessionMinutes, body.trim());
    setSaved(sessionMinutes);
    complete(checkpoint.id);
    setBody("");
    setPicked([]);
  }

  return (
    <Modal
      open
      onClose={() => setOpenCheckpoint(null)}
      accent="var(--color-violet)"
      size="lg"
      scrollKey={tab}
      eyebrow={`Week ${week.id} · ${checkpoint.title}`}
      footer={
        <>
          <div className="mr-auto flex min-w-[min(100%,16rem)] flex-1 items-center gap-3">
            <IconClock className="shrink-0 text-lg text-navy-soft" />
            <p className="hand min-w-0 flex-1 text-[0.76rem] leading-snug text-navy-soft">
              {toFloor > 0
                ? `${fmtH(toFloor)} more before you can wrap up the week.`
                : "Submit your project when it's done!"}
            </p>
          </div>

          {saved !== null ? (
            <>
              {nextEntry && (
                <Button variant="outline" onClick={() => setOpenCheckpoint(nextEntry.id)}>
                  Keep working <IconPlus className="text-base" />
                </Button>
              )}
              {canWrapUp && wrapUp ? (
                <Button variant="teal" onClick={() => setOpenCheckpoint(wrapUp.id)}>
                  {owedReel ? "Post your reel" : "Submit project"}{" "}
                  <IconArrowRight className="text-base" />
                </Button>
              ) : (
                <Button variant="teal" onClick={() => setOpenCheckpoint(null)}>
                  Done <IconCheck className="text-base" />
                </Button>
              )}
            </>
          ) : (
            <Button variant="solid" onClick={save} disabled={!ok}>
              Finish session <IconArrowRight className="text-base" />
            </Button>
          )}
        </>
      }
    >
      <div className="mb-5 flex justify-center">
        <div
          className="sketch flex gap-1 rounded-full bg-white p-1"
          style={{ "--sk-radius": "999px" } as React.CSSProperties}
        >
          {(["journal", "timelapse", "sessions"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={cx(
                "label rounded-full px-4 py-1.5 transition-colors",
                tab === t ? "bg-navy text-white" : "text-navy-soft hover:text-navy",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {saved !== null && (
        <div
          className="sketch mb-5 flex items-center gap-3 rounded-2xl bg-mint px-5 py-3.5"
          style={{ "--sk-color": "var(--color-teal)", "--sk-radius": "16px" } as React.CSSProperties}
        >
          <IconCheck className="shrink-0 text-xl text-teal-deep" />
          <p className="text-[0.92rem] leading-snug font-bold text-teal-deep">
            {fmt(saved)} logged.{" "}
            {toFloor > 0
              ? `${fmtH(toFloor)} more and you can wrap the week up whenever you like.`
              : "You are past your tier's hours — submit your project or keep working!."}
          </p>
        </div>
      )}

      {/* The week's own clock. This is what makes the hours feel like yours:
          the floor that opens the closing reel, and the point past which
          everything banks. */}
      {(
        <div
          className="sketch mb-5 rounded-2xl bg-white px-4 py-3.5"
          style={{ "--sk-color": "var(--color-violet)", "--sk-radius": "16px" } as React.CSSProperties}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="label text-violet-deep">This week · tier {week.tier}</p>
            <p className="hand text-[0.78rem] text-navy-soft tabular-nums">
              {fmtH(hours)} of {fmtH(week.targetHours)}
            </p>
          </div>
          <Meter
            className="mt-2"
            value={Math.min(hours, week.targetHours)}
            max={week.targetHours}
            tone={hours >= week.targetHours ? "gold" : "teal"}
          />
          <p className="mt-2 text-[0.82rem] leading-snug text-navy-soft">
            {toFloor > 0 ? (
              <>
                You can submit at{" "}
                <span className="font-bold text-navy">{fmtH(week.fundingHours)}</span> —{" "}
                {fmtH(toFloor)} to go, and every hour past it banks 5 coins.
              </>
            ) : (
              <>
                 Submit your project whenever you're done. Every hour past{" "}
                <span className="font-bold text-navy">{fmtH(week.bankedFrom)}</span> is already
                banking 5 coins — {fmtH(week.targetHours)} a week is the pace your goal wants.
              </>
            )}
          </p>
        </div>
      )}

      {tab === "journal" ? (
        <div>
          <ModalTitle sub="Select your timelapse on the other tab, then write what happened. Minimum journal length is 200 characters.">
            What did you do this session?
          </ModalTitle>

          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <span className="label text-navy-soft">Project:</span>
            <span className="label inline-flex items-center gap-1.5 rounded-full bg-orange px-3 py-1.5 text-navy">
              {project?.name ?? `${week.theme} project`}
            </span>
            <button
              type="button"
              className="label inline-flex items-center gap-1.5 rounded-full border-2 border-line px-3 py-1.5 text-navy-soft transition-colors hover:border-violet hover:text-navy"
            >
              New project <IconPlus className="text-base" />
            </button>
            <Link
              href="/docs/journalling"
              className="hand ml-auto text-[0.78rem] text-navy-soft underline decoration-dashed underline-offset-4 hover:text-navy"
            >
              Unsure? Read our docs
            </Link>
          </div>

          <div className="relative">
            <FoxMark
              className="pointer-events-none absolute top-1/2 left-1/2 w-40 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
              sticker={false}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              placeholder="Start typing… What did you try, what broke, and what are you doing next time?"
              aria-label="Journal entry"
              className={cx(inputClass, "relative resize-none bg-white/70")}
            />
          </div>
          <p
            className={cx(
              "hand mt-2 text-right text-[0.76rem] tabular-nums",
              body.trim().length >= 200 ? "text-teal-deep" : "text-navy-soft",
            )}
          >
            {body.trim().length} / 200 characters
          </p>
        </div>
      ) : tab === "sessions" ? (
        <div>
          <ModalTitle sub="Every session logged this week, oldest first.">
            {weekLog.length === 1 ? "1 session this week" : `${weekLog.length} sessions this week`}
          </ModalTitle>

          {weekLog.length === 0 ? (
            <p className="hand py-12 text-center text-[0.9rem] text-navy-soft">
              nothing logged yet. the first one goes in on the journal tab.
            </p>
          ) : (
            <ol className="grid gap-2.5">
              {weekLog.map((entry, i) => (
                <li
                  key={entry.id}
                  className="sketch rounded-2xl bg-white px-4 py-3"
                  style={
                    { "--sk-color": "var(--color-line)", "--sk-radius": "16px" } as React.CSSProperties
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="label text-violet-deep">Session {i + 1}</p>
                    <p className="hand text-[0.76rem] text-navy-soft tabular-nums">
                      {fmt(entry.minutes)}
                    </p>
                  </div>
                  <p className="mt-1.5 line-clamp-3 text-[0.85rem] leading-snug text-navy">
                    {entry.body}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <div>
          <ModalTitle sub="Pick the recordings that belong to this session. The total time on the clips is the time that gets logged.">
            Select your timelapses
          </ModalTitle>

          <div className="grid gap-2.5">
            {CLIPS.map((c) => {
              const on = picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))}
                  aria-pressed={on}
                  className={cx(
                    "sketch flex items-center gap-3.5 rounded-2xl p-2.5 text-left transition-colors",
                    on ? "bg-violet-pale" : "bg-white hover:bg-violet-pale/50",
                  )}
                  style={
                    {
                      "--sk-color": on ? "var(--color-violet)" : "var(--color-line)",
                      "--sk-radius": "16px",
                    } as React.CSSProperties
                  }
                >
                  <span className="relative block w-20 shrink-0 overflow-hidden rounded-lg">
                    <ReelScene scene={c.thumb} className="block aspect-[4/3] w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="hand block truncate text-[0.9rem] font-semibold text-navy">{c.name}</span>
                    <span className="block text-[0.8rem] text-navy-soft tabular-nums">{fmt(c.minutes)} of footage</span>
                  </span>
                  <span
                    className={cx(
                      "grid size-6 shrink-0 place-items-center rounded-full border-2",
                      on ? "border-violet bg-violet text-white" : "border-line-strong text-transparent",
                    )}
                  >
                    <IconCheck className="text-[0.8rem]" strokeWidth={3.4} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <DropZone
              icon={IconUpload}
              title="Drop another recording"
              hint="MP4, MOV or a screen recording straight off your machine. We speed it up for you."
              filled={false}
              onToggle={() => setPicked(CLIPS.map((c) => c.id))}
            />
          </div>

          <p className="mt-4 text-center text-[0.95rem] font-bold text-navy tabular-nums">
            This session: {fmt(sessionMinutes)}
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ================================================================== *
 * Reel
 * ================================================================== */
export function ReelModal({ checkpoint }: { checkpoint: Checkpoint }) {
  const { setOpenCheckpoint, complete, stateOf, weekOf } = useStore();
  const week = weekOf(checkpoint.weekId);
  const done = stateOf(checkpoint.id).done;
  const [clip, setClip] = useState(false);
  const [caption, setCaption] = useState("");

  return (
    <Modal
      open
      onClose={() => setOpenCheckpoint(null)}
      accent="var(--color-violet)"
      size="lg"
      eyebrow={`Week ${week.id} · ${checkpoint.title}`}
      footer={
        <>
          <p className="hand mr-auto hidden text-[0.78rem] text-navy-soft sm:block">
            Reels post straight to the Doomscroller.
          </p>
          <Button variant="outline" onClick={() => setOpenCheckpoint(null)}>
            Save draft
          </Button>
          <Button
            variant="solid"
            disabled={!clip || caption.trim().length < 8}
            onClick={() => {
              complete(checkpoint.id, { artefacts: 1 });
              setOpenCheckpoint(null);
            }}
          >
            {done ? "Replace reel" : "Post reel"} <IconFilm className="text-base" />
          </Button>
        </>
      }
    >
      <ModalTitle sub={checkpoint.blurb}>Make your {checkpoint.title.toLowerCase()}</ModalTitle>

      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="grid gap-4">
          <div
            className="sketch rounded-2xl bg-sky-pale px-5 py-4"
            style={{ "--sk-color": "var(--color-sky)", "--sk-radius": "16px" } as React.CSSProperties}
          >
            <p className="label flex items-center gap-2 text-sky-deep">
              <IconMic className="text-base" /> What to film
            </p>
            <p className="mt-1.5 text-[0.92rem] leading-snug text-navy">{checkpoint.reelBrief}</p>
          </div>

          <DropZone
            icon={IconCamera}
            title="Record or drop a clip"
            hint="Vertical, 30 to 60 seconds, filmed on whatever you have. No editing required."
            filled={clip}
            onToggle={() => setClip((v) => !v)}
          />

          <Field label="Caption" hint="One line. Say what changed." id="reel-caption">
            <input
              id="reel-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="routed the whole board without a single ratline left"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mx-auto w-[180px] md:w-full">
          <p className="label mb-2 text-navy-soft">Preview</p>
          <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "9 / 16" }}>
            {clip ? (
              <>
                <ReelScene scene={week.theme === "CAD" ? "cad" : "pcb"} className="absolute inset-0 size-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 pt-8">
                  <p className="text-[0.7rem] leading-snug font-semibold text-white">
                    {caption || "your caption here"}
                  </p>
                </div>
              </>
            ) : (
              <div
                className="sketch grid size-full place-items-center rounded-xl bg-white px-3 text-center"
                style={{ "--sk-radius": "12px" } as React.CSSProperties}
              >
                <p className="hand text-[0.78rem] leading-snug text-navy-soft">
                  nothing here yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================== *
 * Project creation (weeks 2–5)
 * ================================================================== */
export function ProjectModal({ checkpoint }: { checkpoint: Checkpoint }) {
  const { setOpenCheckpoint, complete, addProject, experience, weekOf } = useStore();
  const week = weekOf(checkpoint.weekId);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tier, setTier] = useState<1 | 2 | 3>(
    experience === "lots" ? 3 : experience === "some" ? 2 : 1,
  );
  const [showExamples, setShowExamples] = useState(false);

  const ok = name.trim().length > 1 && desc.trim().length > 4;

  return (
    <Modal
      open
      onClose={() => setOpenCheckpoint(null)}
      accent={week.accent}
      size="lg"
      eyebrow={`Week ${week.id} · ${week.fullName}`}
      footer={
        <>
          <p className="hand mr-auto hidden text-[0.78rem] text-navy-soft sm:block">
            Tier can be changed any time before you submit this week.
          </p>
          <Button variant="outline" onClick={() => setOpenCheckpoint(null)}>
            Cancel
          </Button>
          <Button
            variant="solid"
            disabled={!ok}
            onClick={() => {
              addProject({ name: name.trim(), description: desc.trim(), weekId: week.id, tier, starter: false });
              complete(checkpoint.id, { artefacts: 1 });
              setOpenCheckpoint(null);
            }}
          >
            Create project <IconArrowRight className="text-base" />
          </Button>
        </>
      }
    >
      <ModalTitle sub={week.summary}>{week.headline}</ModalTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_230px] lg:items-start">
        <div className="grid gap-4">
          <Field label="Project name" hint="Give it a cool name." id="np-name">
            <input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`My ${week.theme.toLowerCase()} project`}
              className={inputClass}
            />
          </Field>
          <Field label="Project description" hint="What it does, and what makes it yours." id="np-desc">
            <textarea
              id="np-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder={week.examples[0]}
              className={cx(inputClass, "resize-none")}
            />
          </Field>

          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="hand self-start text-[0.82rem] text-violet-deep underline decoration-dashed underline-offset-4 hover:text-navy"
          >
            {showExamples ? "Hide examples" : "Stuck? See what other people are making"}
          </button>
          {showExamples && (
            <ul className="grid gap-2">
              {week.examples.map((e) => (
                <li key={e}>
                  <button
                    type="button"
                    onClick={() => setDesc(e)}
                    className="sketch w-full rounded-xl bg-white px-4 py-2.5 text-left text-[0.9rem] leading-snug text-navy transition-colors hover:bg-violet-pale/60"
                    style={{ "--sk-radius": "12px" } as React.CSSProperties}
                  >
                    {e}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2">
            <p className="label mb-2 text-violet-deep">Funding tier</p>
            <div className="grid gap-2.5">
              {TIERS.map((t) => (
                <OptionRow key={t.id} selected={tier === t.id} onClick={() => setTier(t.id)} hint={t.detail}>
                  <span className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-[0.98rem] font-extrabold text-navy">
                      Tier {t.id}
                    </span>
                    <span className="hand text-[0.86rem] text-teal-deep">${t.funding}+ funding</span>
                    <span className="hand text-[0.8rem] text-navy-soft">· {t.hours}+ </span>
                  </span>
                </OptionRow>
              ))}
            </div>
          </div>
        </div>

        <div className="order-first lg:order-none">
          <div className="overflow-hidden rounded-2xl p-4" style={{ background: week.accent }}>
            <WeekScene theme={week.theme} className="w-full" />
          </div>
          <p className="mt-3 text-[0.86rem] leading-snug text-navy-soft">{week.primer.split(". ")[0]}.</p>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================== *
 * Submit gate
 * ================================================================== */
export function SubmitModal({ checkpoint }: { checkpoint: Checkpoint }) {
  const { setOpenCheckpoint, complete, projects, setProjectTier, weekOf } = useStore();
  const week = weekOf(checkpoint.weekId);
  const isBuild = week.phase === "build";
  const files = isBuild ? SUBMIT_FILES_BUILD : SUBMIT_FILES_DESIGN;

  const project = projects.find((p) => p.weekId === (isBuild ? week.id - 5 : week.id)) ?? projects[0];

  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState<string[]>([]);
  const [cart, setCart] = useState(false);
  const [tier, setTier] = useState<1 | 2 | 3>(project?.tier ?? 1);
  const [clip, setClip] = useState(false);
  const [works, setWorks] = useState<"yes" | "no" | null>(null);
  const [writeup, setWriteup] = useState("");

  const total = isBuild ? 2 : 3;
  const bomTotal = useMemo(() => BOM_ROWS.reduce((n, r) => n + r.qty * r.unit, 0), []);
  const allChecked = checked.length === files.length;

  const canAdvance =
    step === 1
      ? allChecked
      : isBuild
        ? clip && (works === "yes" || (works === "no" && writeup.trim().length >= 40))
        : step === 2
          ? cart
          : clip;

  function submit() {
    if (project) setProjectTier(project.id, tier);
    complete(checkpoint.id, { artefacts: files.length });
    setOpenCheckpoint(null);
  }

  return (
    <Modal
      open
      onClose={() => setOpenCheckpoint(null)}
      accent="var(--color-magenta)"
      size="lg"
      scrollKey={step}
      eyebrow={`Submit week ${week.id} · ${step}/${total}`}
      footer={
        <>
          <Button variant="outline" onClick={() => (step === 1 ? setOpenCheckpoint(null) : setStep((s) => s - 1))}>
            {step === 1 ? "Not yet" : "Back"}
          </Button>
          {step < total ? (
            <Button variant="solid" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
              Next <IconArrowRight className="text-base" />
            </Button>
          ) : (
            <Button variant="coral" disabled={!canAdvance} onClick={submit}>
              Submit week {week.id} <IconCheck className="text-base" />
            </Button>
          )}
        </>
      }
    >
      {step === 1 && (
        <div>
          <ModalTitle
            sub={
              isBuild
                ? "Reviewers watch the demo first and read everything else second. Get the video right."
                : "Source files, not exports. A PDF of a schematic is not a schematic."
            }
          >
            Check all files are included
          </ModalTitle>
          <ul className="grid gap-2.5">
            {files.map((f) => {
              const on = checked.includes(f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setChecked((c) => (on ? c.filter((x) => x !== f.id) : [...c, f.id]))}
                    aria-pressed={on}
                    className={cx(
                      "sketch flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
                      on ? "bg-mint" : "bg-white hover:bg-black/[.03]",
                    )}
                    style={
                      {
                        "--sk-color": on ? "var(--color-teal)" : "var(--color-line)",
                        "--sk-radius": "16px",
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cx(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2",
                        on ? "border-teal bg-teal text-white" : "border-line-strong text-transparent",
                      )}
                    >
                      <IconCheck className="text-[0.7rem]" strokeWidth={3.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[0.95rem] font-bold text-navy">
                        <IconFile className="shrink-0 text-base text-navy-soft" />
                        {f.label}
                      </span>
                      <span className="mt-0.5 block text-[0.82rem] leading-snug text-navy-soft">{f.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!allChecked && (
            <p className="hand mt-4 flex items-center gap-2 text-[0.82rem] text-coral-deep">
              <IconWarning className="text-base" /> Tick every line before you can continue.
            </p>
          )}
        </div>
      )}

      {!isBuild && step === 2 && (
        <div>
          <ModalTitle sub="Every line needs a real vendor and a real price. We ask for the cart screenshot so the total is checkable.">
            Finalise your BOM and tier
          </ModalTitle>

          <Panel tone="line" radius={18} className="overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[0.86rem]">
                <thead>
                  <tr className="border-b border-dashed border-line">
                    {["Ref", "Part", "Qty", "Unit", "Vendor"].map((h) => (
                      <th key={h} className="label px-4 py-2.5 text-navy-soft">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOM_ROWS.map((r) => (
                    <tr key={r.part} className="border-b border-dashed border-line/60 last:border-0">
                      <td className="hand px-4 py-2.5 whitespace-nowrap text-navy-soft">{r.ref}</td>
                      <td className="px-4 py-2.5 font-semibold text-navy">{r.part}</td>
                      <td className="px-4 py-2.5 tabular-nums">{r.qty}</td>
                      <td className="px-4 py-2.5 tabular-nums">${r.unit.toFixed(2)}</td>
                      <td className="hand px-4 py-2.5 whitespace-nowrap text-navy-soft">{r.vendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 bg-cream px-4 py-3">
              <span className="label text-navy-soft">Cart total</span>
              <span className="text-[1.05rem] font-extrabold text-navy tabular-nums">${bomTotal.toFixed(2)}</span>
            </div>
          </Panel>

          <div className="mt-4">
            <DropZone
              icon={IconCart}
              title="Screenshot of your cart"
              hint="The checkout page with the total visible. Any vendor."
              filled={cart}
              onToggle={() => setCart((v) => !v)}
            />
          </div>

          <div className="mt-6">
            <p className="label mb-2 text-magenta">Finalise your tier</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {TIERS.map((t) => {
                const on = tier === t.id;
                const over = bomTotal > t.funding;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    aria-pressed={on}
                    className={cx(
                      "sketch rounded-2xl px-4 py-3 text-left transition-colors",
                      on ? "bg-violet-pale" : "bg-white hover:bg-black/[.03]",
                    )}
                    style={
                      {
                        "--sk-color": on ? "var(--color-violet)" : "var(--color-line)",
                        "--sk-radius": "16px",
                      } as React.CSSProperties
                    }
                  >
                    <span className="block text-[0.95rem] font-extrabold text-navy">Tier {t.id}</span>
                    <span className="hand block text-[0.86rem] text-teal-deep">${t.funding} funded</span>
                    <span className="mt-1 block text-[0.76rem] leading-snug text-navy-soft">
                      {over
                        ? `Over by $${(bomTotal - t.funding).toFixed(2)}`
                        : `$${(t.funding - bomTotal).toFixed(2)} of headroom`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {((isBuild && step === 2) || (!isBuild && step === 3)) && (
        <div>
          <ModalTitle
            sub={
              isBuild
                ? "Thirty to sixty seconds of the project working, with your voice explaining what it does."
                : "One last reel walking through the finished design. Thirty seconds is plenty."
            }
          >
            {isBuild ? "Show it working" : "Final submission reel"}
          </ModalTitle>

          <DropZone
            icon={IconCamera}
            title={isBuild ? "Drop your demo video" : "Drop your closing reel"}
            hint={
              isBuild
                ? "Point the camera at the thing, turn it on, and talk over it."
                : "Pan across the schematic, the layout, and the render."
            }
            filled={clip}
            onToggle={() => setClip((v) => !v)}
          />

          {isBuild && (
            <div className="mt-6">
              <p className="label mb-2 text-magenta">Does it work?</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <OptionRow selected={works === "yes"} onClick={() => setWorks("yes")}>
                  <span className="text-[0.95rem] font-bold text-navy">Yes — it does the thing</span>
                </OptionRow>
                <OptionRow selected={works === "no"} onClick={() => setWorks("no")}>
                  <span className="text-[0.95rem] font-bold text-navy">Not yet</span>
                </OptionRow>
              </div>

              {works === "no" && (
                <div className="mt-4">
                  <Field
                    label="What needs to change"
                    hint="Reviewers pass honest failures and fail silent ones. Say what you would do next."
                    id="writeup"
                  >
                    <textarea
                      id="writeup"
                      rows={5}
                      value={writeup}
                      onChange={(e) => setWriteup(e.target.value)}
                      placeholder="The display initialises but stays blank. I think the reset pin is floating — next revision ties it through a 10k to 3V3 and I will bodge it in the meantime."
                      className={cx(inputClass, "resize-none")}
                    />
                  </Field>
                  <p
                    className={cx(
                      "hand mt-1.5 text-right text-[0.76rem] tabular-nums",
                      writeup.trim().length >= 40 ? "text-teal-deep" : "text-navy-soft",
                    )}
                  >
                    {writeup.trim().length} / 40 characters
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Chip tone="teal">
              <IconCheck className="text-[0.9rem]" /> Files attached
            </Chip>
            {!isBuild && (
              <Chip tone="teal">
                <IconCheck className="text-[0.9rem]" /> BOM ${bomTotal.toFixed(2)} · tier {tier}
              </Chip>
            )}
            <Chip tone={clip ? "teal" : "muted"}>
              {clip ? <IconCheck className="text-[0.9rem]" /> : <IconFilm className="text-[0.9rem]" />}{" "}
              {clip ? "Video attached" : "Video missing"}
            </Chip>
          </div>
        </div>
      )}
    </Modal>
  );
}
