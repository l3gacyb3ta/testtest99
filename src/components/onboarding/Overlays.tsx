"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  JournalModal,
  ProjectModal,
  ReelModal,
  SubmitModal,
} from "@/components/modals/CheckpointModals";
import { FirstCheckpoint } from "@/components/modals/FirstCheckpoint";
import { useStore } from "@/lib/store";
import { Cinematic } from "./Cinematic";
import { Spotlight } from "./Spotlight";

const TOUR = [
  {
    selector: '[data-tour="doomscroller"], [data-tour="reels-button"]',
    title: "The Doomscroller",
    body: "Every reel anyone posts lands here, newest first. It is the fastest way to see what the rest of the program is building this week.",
  },
  {
    selector: '[data-tour="nav-explore"]',
    title: "Explore",
    body: "The long-form side: everyone's journal entries, with the photos and the parts that did not work.",
  },
  {
    selector: '[data-tour="nav-shop"]',
    title: "Shop",
    body: "Coins from your logged hours buy grants, tools and parts here. Hardware grants land straight on your card.",
  },
  {
    selector: '[data-tour="nav-docs"]',
    title: "Docs",
    body: "How tiers work, what counts as a session, and the checklist reviewers actually use when they read your submission.",
  },
  {
    selector: '[data-tour="nav-leaderboard"]',
    title: "Leaderboard",
    body: "Hours logged and weeks shipped across the program. Entirely cosmetic, entirely motivating.",
  },
];

function CheckpointModal({ id }: { id: string }) {
  const { allCheckpoints } = useStore();
  const cp = allCheckpoints.find((c) => c.id === id);
  if (!cp) return null;
  switch (cp.kind) {
    case "onboarding":
      return <FirstCheckpoint checkpointId={cp.id} />;
    case "journal":
      return <JournalModal checkpoint={cp} />;
    case "reel":
      return <ReelModal checkpoint={cp} />;
    case "project":
      return <ProjectModal checkpoint={cp} />;
    case "submit":
    case "demo":
      return <SubmitModal checkpoint={cp} />;
    default:
      return null;
  }
}

export function Overlays() {
  const {
    hydrated,
    phase,
    setPhase,
    openCheckpoint,
    setOpenCheckpoint,
    tourStep,
    setTourStep,
    currentCheckpointId,
  } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const needsHome = phase === "aim" || phase === "cinematic";

  useEffect(() => {
    if (hydrated && needsHome && pathname !== "/") router.push("/");
  }, [hydrated, needsHome, pathname, router]);

  // Closing the setup modal without finishing drops you back to the prompt
  // rather than into a half-onboarded state with no way back.
  useEffect(() => {
    if (phase === "checkpoint" && !openCheckpoint) setPhase("aim");
  }, [phase, openCheckpoint, setPhase]);

  if (!hydrated) return null;

  if (phase === "cinematic") return <Cinematic />;

  return (
    <>
      {openCheckpoint && <CheckpointModal id={openCheckpoint} />}

      {phase === "aim" && !openCheckpoint && pathname === "/" && (
        <Spotlight
          selector='[data-tour="first-checkpoint"]'
          title="Start here"
          body="The yellow checkpoint is your setup: six quick questions and your first project exists at the end of them."
          cta="Open it"
          pad={14}
          radius={999}
          onNext={() => {
            setPhase("checkpoint");
            setOpenCheckpoint(currentCheckpointId);
          }}
          onSkip={() => setPhase("done")}
        />
      )}

      {phase === "tour" && !openCheckpoint && (
        <Spotlight
          selector={TOUR[tourStep]?.selector ?? ""}
          title={TOUR[tourStep]?.title ?? ""}
          body={TOUR[tourStep]?.body ?? ""}
          step={tourStep + 1}
          total={TOUR.length}
          clickAnywhere
          cta={tourStep === TOUR.length - 1 ? "Start week 1" : "Next"}
          onNext={() => {
            if (tourStep >= TOUR.length - 1) {
              setPhase("done");
              setTourStep(0);
            } else {
              setTourStep(tourStep + 1);
            }
          }}
          onSkip={() => {
            setPhase("done");
            setTourStep(0);
          }}
        />
      )}
    </>
  );
}
