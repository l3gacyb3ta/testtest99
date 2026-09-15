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
import { COINS_PER_HOUR, DEFAULT_GOAL_ID, printerById } from "./printers";
import type { Checkpoint, Experience, Project, SessionLog, Week } from "./types";

export type IntroPhase =
  | "cinematic" // the fly-through
  | "aim" // spotlight on the first checkpoint
  | "checkpoint" // the six-step onboarding modal is open
  | "tour" // spotlight each tab in turn
  | "done";

export interface CheckpointState {
  done: boolean;
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
  logSession: (id: string, minutes: number, body: string) => void;
  stateOf: (id: string) => CheckpointState;
  isUnlocked: (id: string) => boolean;
  currentCheckpointId: string | null;
  /** The trail, cut to the tier of each week's project. */
  weeks: Week[];
  allCheckpoints: Checkpoint[];
  weekOf: (weekId: number) => Week;
  /** Hours logged across every session checkpoint in a week. */
  weekHours: (weekId: number) => number;
  totalCheckpoints: number;
  setOpenCheckpoint: (id: string | null) => void;
  setDoomscroller: (open: boolean) => void;
  setGoal: (id: string) => void;
  reset: () => void;
  totalDone: number;
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

  const addProject = useCallback((p: Omit<Project, "id">) => {
    setSave((s) => ({
      ...s,
      projects: [...s.projects, { ...p, id: `p-${s.projects.length + 1}-${p.weekId}` }],
    }));
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
        progress: { ...s.progress, [id]: { ...prev, ...patch, done: true } },
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
        const target = build
          ? BUILD_HOURS
          : goal.hoursPerWeek + (tier.fundingHours - TIERS[0].fundingHours);
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
          checkpoints: checkpointsFor(meta, tier, written, (cid) => save.progress[cid]?.done ?? false),
        };
      }),
    [tierForWeek, goal, save.progress],
  );

  const allCheckpoints = useMemo(() => weeks.flatMap((w) => w.checkpoints), [weeks]);

  /** One saved journal: an entry, plus whatever time its timelapses carry. */
  const logSession = useCallback((id: string, minutes: number, body: string) => {
    setSave((s) => {
      const prev = { ...EMPTY, ...s.progress[id] };
      const entry: SessionLog = { id: `${id}-s${prev.log.length + 1}`, minutes, body };

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
  }, [weeks]);

  const weekOf = useCallback(
    (weekId: number): Week => weeks.find((w) => w.id === weekId) ?? weeks[0],
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
      const list = week.checkpoints;
      const i = list.findIndex((c) => c.id === id);
      const self = list[i];

      if (self.atHours !== undefined) {
        const hours = weekHours(week.id);
        // Unwritten entries never block a milestone — the clock does. Neither
        // does a milestone that is not due yet: the reel waiting at 30h cannot
        // hold up a Submit that opened at 24h.
        const gates = list
          .slice(0, i)
          .filter((c) => c.kind !== "journal" && (c.atHours ?? 0) <= hours);
        return gates.every(done) && hours >= self.atHours;
      }

      return list.slice(0, i).every(done);
    },
    [weeks, save.progress, weekHours],
  );

  const currentCheckpointId = useMemo(() => {
    const next = allCheckpoints.find(
      (c) => !(save.progress[c.id]?.done ?? false) && isUnlocked(c.id),
    );
    return next?.id ?? null;
  }, [allCheckpoints, save.progress, isUnlocked]);

  const totalDone = useMemo(
    () => allCheckpoints.filter((c) => save.progress[c.id]?.done).length,
    [allCheckpoints, save.progress],
  );

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
    currentCheckpointId,
    setOpenCheckpoint,
    setDoomscroller,
    setGoal,
    reset,
    weeks,
    allCheckpoints,
    weekOf,
    weekHours,
    totalDone,
    totalCheckpoints: allCheckpoints.length,
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
