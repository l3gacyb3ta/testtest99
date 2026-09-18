"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoxMark, ReelScene, WeekScene } from "@/components/platform/art";
import {
  IconArrowRight,
  IconCamera,
  IconCart,
  IconCheck,
  IconClock,
  IconEye,
  IconFile,
  IconFilm,
  IconMic,
  IconPlus,
  IconUpload,
  IconWarning,
} from "@/components/platform/icons";
import { countImages, Markdown } from "@/components/platform/Markdown";
import { Button, Chip, Field, OptionRow, Panel, cx, inputClass } from "@/components/platform/ui";
import {
  BOM_ROWS,
  photosRequired,
  SUBMIT_FILES_BUILD,
  SUBMIT_FILES_DESIGN,
  TIERS,
} from "@/lib/curriculum";
import { MIN_HOURS_PER_WEEK, paceTarget, printerById, weekAsk } from "@/lib/printers";
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
  const { setOpenCheckpoint, logSession, complete, projects, weekOf, weekHours } = useStore();

  const week = weekOf(checkpoint.weekId);

  // Every journal node is one entry: write it and it is done. The week's clock
  // is what decides whether wrapping up is on the table yet.

  const [tab, setTab] = useState<"journal" | "timelapse">("journal");
  const [picked, setPicked] = useState<string[]>(CLIPS[0] ? [CLIPS[0].id] : []);
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  // Free text, not a number: a controlled number input that coerces as you
  // type eats the decimal point the moment you reach for "1.5".
  const [hoursText, setHoursText] = useState("");

  const project = projects.find((p) => p.weekId === (week.phase === "build" ? week.id - 5 : week.id))
    ?? projects[0];

  // The claim is what the maker types. The photographs are what makes it a
  // claim rather than a number, which is why the bar rises with it — and they
  // are counted out of the entry itself, so every picture sits in the sentence
  // that explains it instead of in a tray underneath.
  const claimed = Math.max(0, Number(hoursText) || 0);
  const sessionMinutes = Math.round(claimed * 60);
  const needPhotos = photosRequired(claimed);
  const shots = countImages(body);
  const clipMinutes = CLIPS.filter((c) => picked.includes(c.id)).reduce((n, c) => n + c.minutes, 0);

  const longEnough = body.trim().length >= 200;
  const enoughPhotos = shots >= needPhotos;
  const ok = longEnough && enoughPhotos && claimed > 0 && picked.length > 0;

  // One thing at a time, in the order the tabs are laid out — a list of four
  // faults reads as a wall, and only the first one is actionable anyway.
  const missing = !ok
    ? claimed <= 0
      ? "Add the hours you spent on this session."
      : !longEnough
        ? `${200 - body.trim().length} more characters in your entry.`
        : !enoughPhotos
          ? `${needPhotos - shots} more ${needPhotos - shots === 1 ? "image" : "images"} in your entry for ${fmtH(claimed)}.`
          : "Pick the timelapse that belongs to this session."
    : null;

  const hours = weekHours(week.id);
  const toFloor = Math.max(0, week.submitHours - hours);

  /**
   * Finishing hands the maker back to the trail rather than straight into
   * another entry. What comes next is the trail's to say: logging these hours
   * may have brought a reel due, or opened the fork at the end of the week,
   * and a modal that reopens itself would march past both.
   */
  function save() {
    logSession(checkpoint.id, sessionMinutes, body.trim(), { clips: picked });
    complete(checkpoint.id);
    setOpenCheckpoint(null);
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
            {missing ? (
              <IconWarning className="shrink-0 text-lg text-coral" />
            ) : (
              <IconClock className="shrink-0 text-lg text-navy-soft" />
            )}
            <p
              className={cx(
                "hand min-w-0 flex-1 text-[0.76rem] leading-snug",
                missing ? "text-coral-deep" : "text-navy-soft",
              )}
            >
              {missing
                ? missing
                : toFloor > 0
                  ? `${fmtH(toFloor)} more before you can wrap up the week.`
                  : "Submit your project when it's done!"}
            </p>
          </div>

          <Button variant="solid" onClick={save} disabled={!ok}>
            Finish <IconArrowRight className="text-base" />
          </Button>
        </>
      }
    >
      <div className="mb-5 flex justify-center">
        <div
          className="sketch flex gap-1 rounded-full bg-white p-1"
          style={{ "--sk-radius": "999px" } as React.CSSProperties}
        >
          {(["journal", "timelapse"] as const).map((t) => (
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

      {tab === "journal" ? (
        <div>
          <ModalTitle sub="Start with the hours, because everything under it is the evidence for them: 200 characters at least, and an image in the entry for each hour — two at minimum. Markdown works, images included.">
            What did you do this session?
          </ModalTitle>

          <div className="mb-4 max-w-[220px]">
            <Field label="Hours this session" hint="Decimals are fine — 1.5 is an hour and a half.">
              <input
                value={hoursText}
                onChange={(e) => setHoursText(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                aria-label="Hours spent on this session"
                className={cx(inputClass, "tabular-nums")}
              />
            </Field>
          </div>

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

          {/* Write and read sit side by side rather than behind a swap, so a
              long entry can be checked against its own formatting without
              losing the cursor. Below md there is only room for one, and the
              toggle picks which. */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="label text-violet-deep">Your entry</p>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              aria-pressed={preview}
              className={cx(
                "label inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 transition-colors",
                preview
                  ? "border-violet bg-violet-pale text-violet-deep"
                  : "border-line text-navy-soft hover:border-violet hover:text-navy",
              )}
            >
              <IconEye className="text-base" /> {preview ? "Hide preview" : "Preview"}
            </button>
          </div>

          <div className={cx("grid gap-3", preview && "md:grid-cols-2")}>
            <div className={cx("relative", preview && "hidden md:block")}>
              <FoxMark
                className="pointer-events-none absolute top-1/2 left-1/2 w-40 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
                sticker={false}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
                placeholder="Start typing… What did you work on? What worked and what didn't? &#10;&#10; Markdown styling enabled! Drop images in with ![alt text](src url)."
                aria-label="Journal entry"
                className={cx(inputClass, "relative h-full resize-none bg-white/70")}
              />
            </div>

            {preview && (
              <div
                className="sketch thin-scroll max-h-[15rem] min-h-[8rem] overflow-y-auto rounded-xl bg-white px-4 py-3 md:max-h-none"
                style={
                  { "--sk-color": "var(--color-violet)", "--sk-radius": "12px" } as React.CSSProperties
                }
              >
                {body.trim() ? (
                  <Markdown
                    source={body}
                    className="grid gap-2.5 text-[0.9rem] leading-relaxed text-navy"
                  />
                ) : (
                  <p className="hand text-[0.85rem] text-navy-soft">
                    nothing to preview yet. headings, **bold**, lists, `code` and
                    ![images](url) all work.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1">
            <p
              className={cx(
                "hand text-[0.76rem] tabular-nums",
                shots >= needPhotos ? "text-teal-deep" : "text-navy-soft",
              )}
            >
              {shots} / {needPhotos} images
            </p>
            <p
              className={cx(
                "hand text-[0.76rem] tabular-nums",
                longEnough ? "text-teal-deep" : "text-navy-soft",
              )}
            >
              {body.trim().length} / 200 characters
            </p>
          </div>
        </div>
      ) : (
        <div>
          <ModalTitle sub="Pick the recordings that belong to this session. These are the lapses already captured on your machine — the hours you log are the ones you enter on the journal tab.">
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

          <p className="mt-4 text-center text-[0.82rem] text-navy-soft tabular-nums">
            {picked.length === 0
              ? "Nothing picked yet."
              : `${fmt(clipMinutes)} of footage on ${picked.length === 1 ? "1 clip" : `${picked.length} clips`}.`}
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
              complete(checkpoint.id, { artefacts: 1, caption: caption.trim() });
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
  const { setOpenCheckpoint, complete, projects, setProjectTier, weekOf, weekHours, coins, goalId } =
    useStore();
  const week = weekOf(checkpoint.weekId);
  const isBuild = week.phase === "build";
  const files = isBuild ? SUBMIT_FILES_BUILD : SUBMIT_FILES_DESIGN;

  // The week is long enough to hand in — that gate is the trail's, and this
  // node would be locked otherwise. What is left to say is whether it was
  // long enough for the machine actually on the wall. A surplus banked in an
  // earlier week pays for a thin one, so this reads the running total against
  // the pace rather than this week against its target.
  const goal = printerById(goalId);
  const owed = Math.max(0, Math.ceil(paceTarget(goal, week.id) - coins));

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

  /**
   * A tier is a claim about hours as much as about money: its funded block has
   * to be covered, and the banking that buys the printer has to sit on top of
   * it. Tier 2 funds thirteen hours, so thirteen hours pay for the project and
   * nothing at all banks until the fourteenth — which is why the tier cannot be
   * raised at the last moment on hours that were only ever enough for a
   * smaller one.
   *
   * Two asks come out of that, and they are different numbers. The floor is
   * the cheapest machine's pace, and below it the season cannot end in a
   * printer at all, so it is a gate. The target is this maker's own goal, and
   * it moves when they change what they are saving for — a P1S asks far more
   * of a tier 2 week than an Ender does. Missing the target is a warning the
   * sheet already gives; missing the floor is a refusal.
   */
  const hours = weekHours(week.id);
  const tierFloor = (fundingHours: number) => weekAsk(MIN_HOURS_PER_WEEK, fundingHours);
  const tierTarget = (fundingHours: number) => weekAsk(goal.hoursPerWeek, fundingHours);
  const tierShort = (fundingHours: number) => Math.max(0, tierFloor(fundingHours) - hours);
  const selectedTier = TIERS.find((t) => t.id === tier) ?? TIERS[0];
  const tierBlocked = !isBuild && tierShort(selectedTier.fundingHours) > 0;

  const canAdvance =
    step === 1
      ? allChecked
      : isBuild
        ? clip && (works === "yes" || (works === "no" && writeup.trim().length >= 40))
        : step === 2
          ? cart && !tierBlocked
          : clip && !tierBlocked;

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
              {owed > 0 ? "Submit anyway" : `Submit week ${week.id}`}{" "}
              <IconCheck className="text-base" />
            </Button>
          )}
        </>
      }
    >
      {/* On every step, not just the last one: a maker who is short on hours
          should find that out before working through the checklist, not after.
          It warns and does not block — the hours needed for a printer at all
          are the trail's gate, and this is the gap to the one they chose. */}
      {owed > 0 && (
        <div
          className="sketch mb-5 flex items-start gap-3 rounded-2xl bg-coral/10 px-5 py-4"
          style={{ "--sk-color": "var(--color-coral)", "--sk-radius": "16px" } as React.CSSProperties}
        >
          <IconWarning className="mt-0.5 shrink-0 text-xl text-coral-deep" />
          <div className="min-w-0">
            <p className="text-[0.95rem] leading-snug font-extrabold text-coral-deep">
              You won&apos;t be banking enough coins if you submit the project.
            </p>
            <p className="mt-1 text-[0.85rem] leading-snug text-navy-soft">
              Spend some more time on it! You are{" "}
              <span className="font-bold text-navy tabular-nums">{owed}</span>{" "}
              {owed === 1 ? "coin" : "coins"} behind the pace for a{" "}
              <span className="font-bold text-navy">{goal.name}</span> — every hour past{" "}
              <span className="font-bold text-navy tabular-nums">{fmtH(week.bankedFrom)}</span> this
              week banks 5 more. You can still hand it in, and a bigger week later makes it up.
            </p>
          </div>
        </div>
      )}

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
            <p className="mb-3 text-[0.82rem] leading-snug text-navy-soft">
              A tier funds its own block of hours — {fmtH(TIERS[0].fundingHours)} on tier 1,{" "}
              {fmtH(TIERS[1].fundingHours)} on tier 2, {fmtH(TIERS[2].fundingHours)} on tier 3 — and
              only the hours above that block bank toward a{" "}
              <span className="font-bold text-navy">{goal.name}</span>. You have{" "}
              <span className="font-bold text-navy tabular-nums">{fmtH(hours)}</span> this week.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {TIERS.map((t) => {
                const on = tier === t.id;
                const over = bomTotal > t.funding;
                const short = tierShort(t.fundingHours);
                const behind = Math.max(0, tierTarget(t.fundingHours) - hours);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    aria-pressed={on}
                    // A tier you have not worked the hours for is not an
                    // option, so it does not behave like one.
                    disabled={short > 0}
                    className={cx(
                      "sketch rounded-2xl px-4 py-3 text-left transition-colors",
                      short > 0
                        ? "cursor-not-allowed bg-black/[.03]"
                        : on
                          ? "bg-violet-pale"
                          : "bg-white hover:bg-black/[.03]",
                    )}
                    style={
                      {
                        "--sk-color": on ? "var(--color-violet)" : "var(--color-line)",
                        "--sk-radius": "16px",
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cx(
                        "block text-[0.95rem] font-extrabold",
                        short > 0 ? "text-navy-soft" : "text-navy",
                      )}
                    >
                      Tier {t.id}
                    </span>
                    <span
                      className={cx(
                        "hand block text-[0.86rem]",
                        short > 0 ? "text-navy-soft" : "text-teal-deep",
                      )}
                    >
                      ${t.funding} funded · {fmtH(t.fundingHours)}
                    </span>

                    {/* The hours are the gate, so they lead. The cart only
                        says whether the money fits inside the tier once the
                        tier is actually available to you. */}
                    <span
                      className={cx(
                        "mt-1 block text-[0.76rem] leading-snug",
                        short > 0 ? "text-coral-deep" : behind > 0 ? "text-navy-soft" : "text-teal-deep",
                      )}
                    >
                      {short > 0
                        ? `${fmtH(short)} short — tier ${t.id} needs ${fmtH(tierFloor(t.fundingHours))}`
                        : behind > 0
                          ? `${fmtH(tierTarget(t.fundingHours))} for a ${goal.name} — ${fmtH(behind)} to go`
                          : `${fmtH(tierTarget(t.fundingHours))} for a ${goal.name} — you have ${fmtH(hours)}`}
                    </span>
                    {short === 0 && over && (
                      <span className="hand mt-1 block text-[0.74rem] leading-snug text-coral-deep">
                        Cart over by ${(bomTotal - t.funding).toFixed(2)}
                      </span>
                    )}
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
