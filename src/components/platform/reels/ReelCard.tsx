"use client";

import { useState } from "react";
import { FoxMark, ReelScene } from "@/components/platform/art";
import { IconComment, IconEye, IconHeart, IconPlay } from "@/components/platform/icons";
import { cx } from "@/components/platform/ui";
import type { Reel } from "@/lib/types";

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;
}

/**
 * One reel. The rail stacks these in a snap column, the Doomscroller page lays them
 * out as a wall — the sizing comes in through `className` so the artwork,
 * the counts and the gradient read identically in both.
 */
export function ReelCard({ reel, className }: { reel: Reel; className?: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className={cx("relative w-full overflow-hidden rounded-xl", className)}>
      <ReelScene scene={reel.scene} className="absolute inset-0 size-full" />

      {reel.fromHQ && (
        <span className="label absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-2xl bg-coral px-2.5 py-1 text-white">
          <FoxMark className="size-3.5" sticker={false} face="#ffffff" />
          From HQ
        </span>
      )}
      {!reel.fromHQ && (
        <span className="label absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-2xl bg-black/45 px-2.5 py-1 leading-[1.2] text-white backdrop-blur-sm">
          {reel.week}
        </span>
      )}

      <button
        type="button"
        aria-label={`Play reel by ${reel.author}`}
        className="absolute inset-0 z-10 grid place-items-center text-white/85 transition-transform duration-200 hover:scale-105"
      >
        <span className="grid size-14 place-items-center rounded-full bg-black/35 backdrop-blur-sm">
          <IconPlay className="ml-1 text-2xl" />
        </span>
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3.5 pt-10 pb-3.5">
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.86rem] leading-tight font-extrabold text-white">{reel.author}</p>
            <p className="mt-1 line-clamp-3 text-[0.78rem] leading-snug text-white/85">{reel.caption}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2.5 pb-0.5">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className="flex flex-col items-center gap-0.5 text-white transition-transform duration-150 hover:scale-110"
            >
              <IconHeart
                className={cx("text-[1.35rem]", liked && "text-coral")}
                fill={liked ? "currentColor" : "none"}
              />
              <span className="hand text-[0.72rem] font-semibold tabular-nums [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">{compact(reel.likes + (liked ? 1 : 0))}</span>
            </button>
            <span className="flex flex-col items-center gap-0.5 text-white">
              <IconComment className="text-[1.3rem]" />
              <span className="hand text-[0.72rem] font-semibold tabular-nums [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">{compact(reel.comments)}</span>
            </span>
            <span className="flex flex-col items-center gap-0.5 text-white">
              <IconEye className="text-[1.3rem]" />
              <span className="hand text-[0.72rem] font-semibold tabular-nums [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">{compact(reel.views)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
