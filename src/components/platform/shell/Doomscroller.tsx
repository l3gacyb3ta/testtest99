"use client";

import { IconX } from "@/components/platform/icons";
import { ReelCard } from "@/components/platform/reels/ReelCard";
import { Panel, cx } from "@/components/platform/ui";
import { useFeed } from "@/components/platform/reels/useFeed";

export function DoomscrollerFeed({ onClose, className }: { onClose?: () => void; className?: string }) {
  const feed = useFeed();

  return (
    <Panel
      tone="line"
      radius={18}
      className={cx("flex min-h-0 flex-col bg-cream/60 p-3.5", className)}
      as="aside"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2 px-0.5">
        <h2 className="label text-line-strong">The Doomscroller</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide the Doomscroller"
            className="grid size-7 place-items-center rounded-full text-line-strong transition-colors hover:bg-black/5 hover:text-navy"
          >
            <IconX className="text-base" />
          </button>
        )}
      </div>
      <div className="thin-scroll snap-y-feed -mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-1">
        {feed.items.map((r) => (
          <ReelCard
            key={r.id}
            reel={r}
            onPatch={feed.patch}
            className="snap-item h-full min-h-[380px] shrink-0"
          />
        ))}
        {feed.error && (
          <p className="hand shrink-0 py-6 text-center text-[0.8rem] text-coral-deep">
            {feed.error}
          </p>
        )}
        {!feed.error && feed.items.length === 0 && !feed.loading && (
          <p className="hand shrink-0 py-6 text-center text-[0.8rem] text-navy-soft">
            nothing here yet. post the first one.
          </p>
        )}
        {feed.items.length > 0 && !feed.done && (
          <button
            type="button"
            onClick={feed.more}
            disabled={feed.loading}
            className="label shrink-0 rounded-full border-2 border-line py-2 text-navy-soft transition-colors hover:border-navy hover:text-navy"
          >
            {feed.loading ? "Loading…" : "More"}
          </button>
        )}
        {feed.done && feed.items.length > 0 && (
          <p className="hand shrink-0 py-6 text-center text-[0.8rem] text-navy-soft">
            that is everything. go build something.
          </p>
        )}
      </div>
    </Panel>
  );
}
