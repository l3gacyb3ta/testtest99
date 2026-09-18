import type { Metadata } from "next";
import { FoxAvatar, JournalMedia } from "@/components/art";
import { IconClock, IconFlame } from "@/components/icons";
import { PageSign } from "@/components/PageSign";
import { Panel } from "@/components/ui";
import { JOURNAL_FEED } from "@/lib/data";
import type { JournalEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explore — Half Life",
  description: "Journal entries from everyone building hardware this week.",
};

const GROUPS = ["Today", "Yesterday", "Earlier this week"] as const;

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return h > 0 ? `${h}h ${rest.toString().padStart(2, "0")}m` : `${rest}m`;
}

function Entry({ entry }: { entry: JournalEntry }) {
  return (
    <Panel tone="line" radius={20} as="article" className="bg-paper px-5 py-5 sm:px-7 sm:py-6">
      <header className="flex flex-wrap items-start gap-3.5">
        <FoxAvatar variant={entry.avatar} className="size-11 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[1.02rem] leading-tight font-extrabold text-navy">
            {entry.author}{" "}
            <span className="font-semibold text-navy-soft">on</span>{" "}
            <a
              href="#"
              className="underline decoration-2 underline-offset-4 transition-colors hover:text-teal-deep"
            >
              {entry.project}
            </a>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="hand inline-flex items-center gap-1 text-[0.82rem] text-coral-deep tabular-nums">
              <IconFlame className="text-sm text-coral" /> {entry.flames}
            </span>
            <span className="hand inline-flex items-center gap-1 text-[0.82rem] text-navy-soft tabular-nums">
              <IconClock className="text-sm" /> {fmtMinutes(entry.minutes)}
            </span>
          </p>
        </div>
        <span className="label shrink-0 pt-1 text-line-strong">{entry.when}</span>
      </header>

      <p className="mt-4 max-w-[68ch] text-[0.95rem] leading-relaxed text-navy">{entry.body}</p>

      {entry.media && (
        <figure className="mt-4">
          <div className="overflow-hidden rounded-xl">
            <JournalMedia kind={entry.media.kind} className="block aspect-[16/9] w-full" />
          </div>
          <figcaption className="hand mt-2 text-[0.78rem] text-navy-soft">{entry.media.caption}</figcaption>
        </figure>
      )}
    </Panel>
  );
}

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-[780px] px-4 pt-2 sm:px-8">
      <PageSign
        label="EXPLORE"
        color="var(--color-sky)"
        sub="See what other teenagers around the world are building for Half Life!"
      />

      <div className="grid gap-6">
        {GROUPS.map((group) => {
          const items = JOURNAL_FEED.filter((e) => e.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="grid gap-5">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-line" />
                <h2 className="label text-line-strong">{group}</h2>
                <span className="h-px flex-1 bg-line" />
              </div>
              {items.map((e) => (
                <Entry key={e.id} entry={e} />
              ))}
            </section>
          );
        })}
      </div>

      <p className="hand py-10 text-center text-[0.86rem] text-navy-soft">
        that is as far back as the feed goes.
      </p>
    </div>
  );
}
