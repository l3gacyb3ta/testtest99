"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUILD_HOURS, TIERS, WEEK_META, checkpointsFor } from "./curriculum";
import {
  COINS_PER_HOUR,
  DEFAULT_GOAL_ID,
  MIN_HOURS_PER_WEEK,
  printerById,
  weekAsk,
} from "./printers";
import type { Checkpoint, Experience, Project, SessionLog, Week } from "./types";

export type IntroPhase =
  | "cinematic" // the fly-through
  | "aim" // spotlight on the first checkpoint
  | "checkpoint" // the six-step onboarding modal is open
  | "tour" // spotlight each tab in turn
  | "done";

export interface CheckpointState {
  done: boolean;
  /** When it was completed, epoch ms. Undefined on saves written before this. */
  at?: number;
  /** A reel's caption, kept so the project timeline can show what was posted. */
  caption?: string;
  /** Journal checkpoints accumulate minutes toward their target. */
  minutes: number;
  /** Reel / submit checkpoints record how many artefacts were attached. */
  artefacts: number;
  /** Every saved journal session in this checkpoint, newest last. */
  log: SessionLog[];
}

interface SaveShape {
  version: 3;
  phase: IntroPhase;
  experience: Experience | null;
  projects: Project[];
  progress: Record<string, CheckpointState>;
  coins: number;
  streak: number;
  doomscrollerOpen: boolean;
  /** The printer every banked coin is aimed at. See lib/printers. */
  goalId: string;
}

const KEY = "halflife.save.v3";

const EMPTY: CheckpointState = { done: false, minutes: 0, artefacts: 0, log: [] };

function seededSave(): SaveShape {
  return {
    version: 3,
    phase: "cinematic",
    experience: null,
    projects: [],
    progress: {},
    coins: 0,
    streak: 50,
    doomscrollerOpen: true,
    goalId: DEFAULT_GOAL_ID,
  };
}

interface Ctx extends SaveShape {
  hydrated: boolean;
  /** id of the checkpoint whose modal is open, if any */
  openCheckpoint: string | null;
  tourStep: number;
  reducedMotion: boolean;

  setPhase: (p: IntroPhase) => void;
  setTourStep: (n: number) => void;
  setExperience: (e: Experience) => void;
  addProject: (p: Omit<Project, "id">) => void;
  setProjectTier: (id: string, tier: 1 | 2 | 3) => void;
  complete: (id: string, patch?: Partial<CheckpointState>) => void;
  logSession: (
    id: string,
    minutes: number,
    body: string,
    evidence?: Pick<SessionLog, "clips">,
  ) => void;
  stateOf: (id: string) => CheckpointState;
  isUnlocked: (id: string) => boolean;
  /** Why a locked checkpoint is locked, phrased for the trail. Null if open. */
  lockReason: (id: string) => string | null;
  currentCheckpointId: string | null;
  /** The trail, cut to the tier of each week's project. */
  weeks: Week[];
  allCheckpoints: Checkpoint[];
  weekOf: (weekId: number) => Week;
  /** Hours logged across every session checkpoint in a week. */
  weekHours: (weekId: number) => number;
  setOpenCheckpoint: (id: string | null) => void;
  setDoomscroller: (open: boolean) => void;
  setGoal: (id: string) => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveShape>(seededSave);
  const [hydrated, setHydrated] = useState(false);
  const [openCheckpoint, setOpenCheckpoint] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Reading the persisted save is exactly the external-system sync an effect is
  // for: it cannot run during render without breaking SSR hydration, since the
  // server has no localStorage and must render the seeded state.
  useEffect(() => {
    let next: SaveShape | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SaveShape;
        if (parsed && parsed.version === 3) next = { ...seededSave(), ...parsed };
      }
    } catch {
      /* storage unavailable — run from the seed */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage
    if (next) setSave(next);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* quota or private mode — the session still works, it just will not persist */
    }
  }, [save, hydrated]);

  const setPhase = useCallback((phase: IntroPhase) => setSave((s) => ({ ...s, phase })), []);

  const setExperience = useCallback(
    (experience: Experience) => setSave((s) => ({ ...s, experience })),
    [],
  );

  /**
   * One project per week, and the week is what makes it that project: every
   * lookup in the app asks for a week's project by `.find`. A second one for
   * the same week would not replace the first, it would queue up behind it
   * where nothing would ever read it, so a repeat is refused here as well as
   * being unreachable in the trail.
   */
  const addProject = useCallback((p: Omit<Project, "id">) => {
    setSave((s) => {
      if (s.projects.some((existing) => existing.weekId === p.weekId)) return s;
      return {
        ...s,
        projects: [...s.projects, { ...p, id: `p-${s.projects.length + 1}-${p.weekId}` }],
      };
    });
  }, []);

  const setProjectTier = useCallback((id: string, tier: 1 | 2 | 3) => {
    setSave((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, tier } : p)),
    }));
  }, []);

  const complete = useCallback((id: string, patch: Partial<CheckpointState> = {}) => {
    setSave((s) => {
      const prev = { ...EMPTY, ...s.progress[id] };
      return {
        ...s,
        progress: {
          ...s.progress,
          // The first completion is the one that dates it. Redoing a checkpoint
          // should not move it up the project timeline past work that came
          // after it.
          [id]: { ...prev, ...patch, at: prev.at ?? Date.now(), done: true },
        },
      };
    });
  }, []);

  const setDoomscroller = useCallback(
    (doomscrollerOpen: boolean) => setSave((s) => ({ ...s, doomscrollerOpen })),
    [],
  );

  const setGoal = useCallback((goalId: string) => setSave((s) => ({ ...s, goalId })), []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to clear */
    }
    setSave(seededSave());
    setTourStep(0);
    setOpenCheckpoint(null);
  }, []);

  // Saves written before a field existed would otherwise hand back a record
  // with holes in it, so every read is filled out from EMPTY.
  const stateOf = useCallback(
    (id: string): CheckpointState => ({ ...EMPTY, ...save.progress[id] }),
    [save.progress],
  );

  // A build week inherits the tier of the design week it is building. A week
  // nobody has started yet borrows the last tier picked, so the trail shows a
  // believable shape instead of lurching when the project is finally created.
  const tierForWeek = useCallback(
    (weekId: number): 1 | 2 | 3 => {
      const designWeek = weekId > 5 ? weekId - 5 : weekId;
      const own = save.projects.find((p) => p.weekId === designWeek);
      if (own) return own.tier;
      return save.projects[save.projects.length - 1]?.tier ?? recommendedTier(save.experience);
    },
    [save.projects, save.experience],
  );

  // The printer you are saving for sets how many hours a week you need to bank,
  // and that number is the same on every tier — the tier only decides how many
  // funded hours sit underneath it.
  const goal = printerById(save.goalId);

  const weeks = useMemo<Week[]>(
    () =>
      WEEK_META.map((meta) => {
        const tierId = tierForWeek(meta.id);
        const tier = TIERS.find((t) => t.id === tierId) ?? TIERS[0];
        const build = meta.phase === "build";
        // Column 5 is the tier-1 week and is already floored to a flat 10 hours,
        // so every other tier is that plus the extra hours its grant funds.
        const target = build ? BUILD_HOURS : weekAsk(goal.hoursPerWeek, tier.fundingHours);
        // The same ask at the cheapest machine's pace: the least a week can be
        // worth and still leave a printer at the end of the season.
        const submitHours = build ? BUILD_HOURS : weekAsk(MIN_HOURS_PER_WEEK, tier.fundingHours);
        // The trail is as long as the work was: every finished entry is a node,
        // and one more waits at the end for the entry about to be written. The
        // minutes come along because reels are placed where the clock crossed.
        const written: number[] = [];
        for (;;) {
          const done = save.progress[`w${meta.id}-entry-${written.length + 1}`];
          if (!done?.done) break;
          written.push(done.minutes);
        }
        return {
          ...meta,
          tier: tierId,
          fundingHours: build ? BUILD_HOURS : tier.fundingHours,
          // Build-week hours all bank; the grant paid for the design week.
          bankedFrom: build ? 0 : tier.fundingHours,
          targetHours: target,
          submitHours,
          checkpoints: checkpointsFor(
            meta,
            written,
            (cid) => save.progress[cid]?.done ?? false,
            submitHours,
          ),
        };
      }),
    [tierForWeek, goal, save.progress],
  );

  const allCheckpoints = useMemo(() => weeks.flatMap((w) => w.checkpoints), [weeks]);

  /** One saved journal: the entry, the time claimed, and the evidence for it. */
  const logSession = useCallback(
    (
      id: string,
      minutes: number,
      body: string,
      evidence: Pick<SessionLog, "clips"> = { clips: [] },
    ) => {
    setSave((s) => {
      const prev = { ...EMPTY, ...s.progress[id] };
      const entry: SessionLog = {
        id: `${id}-s${prev.log.length + 1}`,
        minutes,
        body,
        at: Date.now(),
        ...evidence,
      };

      // Coins come from banked hours and nothing else. The hours below the
      // week's funded line are what the grant already paid for, so they earn
      // nothing — which is why this counts the week, not just this checkpoint.
      const week = weeks.find((w) => w.checkpoints.some((c) => c.id === id));
      const before = week
        ? week.checkpoints.reduce((n, c) => n + (s.progress[c.id]?.minutes ?? 0), 0)
        : prev.minutes;
      const funded = (week?.bankedFrom ?? 0) * 60;
      const banked =
        Math.max(0, before + minutes - funded) - Math.max(0, before - funded);

      return {
        ...s,
        coins: s.coins + Math.round((banked / 60) * COINS_PER_HOUR),
        progress: {
          ...s.progress,
          [id]: { ...prev, minutes: prev.minutes + minutes, log: [...prev.log, entry] },
        },
      };
    });
    },
    [weeks],
  );

  const weekOf = useCallback(
    (weekId: number): Week => {
      const week = weeks.find((w) => w.id === weekId) ?? weeks[0];
      // The curriculum is a compile-time constant with ten weeks in it, so an
      // empty list is a broken build rather than a state to render around.
      if (!week) throw new Error("The curriculum has no weeks in it");
      return week;
    },
    [weeks],
  );

  const weekHours = useCallback(
    (weekId: number) => {
      const week = weeks.find((w) => w.id === weekId);
      if (!week) return 0;
      const mins = week.checkpoints.reduce(
        (n, c) => n + (save.progress[c.id]?.minutes ?? 0),
        0,
      );
      return mins / 60;
    },
    [weeks, save.progress],
  );

  /**
   * Three rules, and only three break the sequence:
   *  - anything on the clock (the milestone reels, and Submit itself) opens on
   *    the week's hours, so a half-written entry never traps you and the choice
   *    to wrap up is always live.
   * Everything else unlocks in order, as it always has.
   */
  const isUnlocked = useCallback(
    (id: string): boolean => {
      const done = (c: Checkpoint) => save.progress[c.id]?.done ?? false;
      const wi = weeks.findIndex((w) => w.checkpoints.some((c) => c.id === id));
      if (wi === -1) return false;

      const prev = weeks[wi - 1];
      if (prev) {
        const prevSubmit = prev.checkpoints.find((c) => c.kind === "submit");
        if (prevSubmit && !done(prevSubmit)) return false;
      }

      const week = weeks[wi];
      const list = week?.checkpoints ?? [];
      const i = list.findIndex((c) => c.id === id);
      const self = list[i];
      if (!week || !self) return false;

      if (self.atHours !== undefined) {
        const hours = weekHours(week.id);
        // Unwritten entries never block a milestone — the clock does. Neither
        // does a milestone that is not due yet: the reel waiting at 30h cannot
        // hold up a Submit that opened at 24h.
        //
        // "Keep working" rides this rule too, at atHours 0. A reel that has
        // come due is the cadence asking to be paid before the week runs on;
        // letting the fork's other arm open around it would make every
        // progress reel skippable forever.
        const gates = list
          .slice(0, i)
          .filter((c) => c.kind !== "journal" && (c.atHours ?? 0) <= hours);
        return gates.every(done) && hours >= self.atHours;
      }

      return list.slice(0, i).every(done);
    },
    [weeks, save.progress, weekHours],
  );

  /**
   * Why a checkpoint is shut, in the maker's terms. Null when it is open.
   *
   * It walks the same three rules as isUnlocked, in the same order, and lives
   * next to it so the two cannot drift: a trail that says one thing and does
   * another is worse than a trail that says nothing. Each branch names the one
   * thing standing in the way rather than listing everything outstanding —
   * only the first is actionable anyway.
   */
  const lockReason = useCallback(
    (id: string): string | null => {
      // Titles are node names, so they keep their capital. The verb follows
      // the kind: you post a reel, you finish everything else.
      const firstFinish = (c: Checkpoint) =>
        c.kind === "reel" ? `Post ${c.title} first.` : `Finish ${c.title} first.`;

      if (isUnlocked(id)) return null;

      const done = (c: Checkpoint) => save.progress[c.id]?.done ?? false;
      const wi = weeks.findIndex((w) => w.checkpoints.some((c) => c.id === id));
      if (wi === -1) return null;

      const prev = weeks[wi - 1];
      if (prev) {
        const prevSubmit = prev.checkpoints.find((c) => c.kind === "submit");
        if (prevSubmit && !done(prevSubmit)) return `Submit week ${prev.id} first.`;
      }

      const week = weeks[wi];
      const list = week?.checkpoints ?? [];
      const i = list.findIndex((c) => c.id === id);
      const self = list[i];
      if (!week || !self) return null;

      if (self.atHours !== undefined) {
        const hours = weekHours(week.id);
        const owed = list
          .slice(0, i)
          .find((c) => c.kind !== "journal" && (c.atHours ?? 0) <= hours && !done(c));
        if (owed) return firstFinish(owed);
        const toGo = Math.round((self.atHours - hours) * 100) / 100;
        return `Opens at ${self.atHours}h logged this week — ${toGo}h to go.`;
      }

      const blocker = list.slice(0, i).find((c) => !done(c));
      return blocker ? firstFinish(blocker) : null;
    },
    [isUnlocked, weeks, save.progress, weekHours],
  );

  const currentCheckpointId = useMemo(() => {
    const next = allCheckpoints.find(
      (c) => !(save.progress[c.id]?.done ?? false) && isUnlocked(c.id),
    );
    return next?.id ?? null;
  }, [allCheckpoints, save.progress, isUnlocked]);

  const value: Ctx = {
    ...save,
    hydrated,
    openCheckpoint,
    tourStep,
    reducedMotion,
    setPhase,
    setTourStep,
    setExperience,
    addProject,
    setProjectTier,
    complete,
    logSession,
    stateOf,
    isUnlocked,
    lockReason,
    currentCheckpointId,
    setOpenCheckpoint,
    setDoomscroller,
    setGoal,
    reset,
    weeks,
    allCheckpoints,
    weekOf,
    weekHours,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Recommended tier from the onboarding experience answer. */
export function recommendedTier(e: Experience | null): 1 | 2 | 3 {
  if (e === "lots") return 3;
  if (e === "some") return 2;
  return 1;
}
