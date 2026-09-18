"use client";

import Link from "next/link";
import { FoxAvatar, WeekScene } from "@/components/art";
import { IconChevronLeft, IconClock, IconFilm, IconPencil } from "@/components/icons";
import { Markdown } from "@/components/Markdown";
import { Chip, Panel } from "@/components/ui";
import { ME } from "@/lib/data";
import { fmtDate, fmtHours, projectEvents, projectStats, type ProjectEvent } from "@/lib/projects";
import { useStore } from "@/lib/store";

function BackLink() {
  return (
    <Link
      href="/projects"
      className="label inline-flex items-center gap-1.5 text-navy-soft transition-colors hover:text-navy"
    >
      <IconChevronLeft className="text-base" /> All projects
    </Link>
  );
}

/**
 * One thing the maker put on the record. Sessions and reels share a row —
 * the same avatar, the same actor line, the same date pinned right — because
 * they are the same kind of fact about the project, and only the badge and the
 * body differ. Lining them up is what lets the column read as a chronology
 * rather than two feeds interleaved.
 */
function EventRow({ event, theme }: { event: ProjectEvent; theme: string }) {
  const reel = event.kind === "reel";

  return (
    <Panel tone="line" radius={18} as="li" className="bg-paper px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <FoxAvatar variant={ME.avatar} className="size-9 shrink-0 rounded-lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[0.92rem] leading-tight font-extrabold text-navy">{ME.name}</span>
            <span className="text-[0.88rem] leading-tight text-navy-soft">
              {reel ? "posted" : "added to the journal"}
            </span>
            {reel ? (
              <Chip tone="sky">
                <IconFilm className="text-[0.85rem]" /> {event.title}
              </Chip>
            ) : (
              <>
                <Chip tone="violet">{theme}</Chip>
                <span className="hand text-[0.8rem] text-teal-deep tabular-nums">
                  {fmtHours(event.minutes / 60)} logged
                </span>
              </>
            )}
            <span className="hand ml-auto shrink-0 text-[0.76rem] text-line-strong">
              {fmtDate(event.at)}
            </span>
          </div>

          {reel ? (
            <p className="mt-2 text-[0.9rem] leading-relaxed text-navy">
              {event.caption || (
                <span className="hand text-navy-soft">{event.brief || "No caption."}</span>
              )}
            </p>
          ) : (
            <>
              <Markdown
                source={event.body}
                className="mt-2 grid gap-2.5 text-[0.9rem] leading-relaxed text-navy"
              />
              {event.clips.length > 0 && (
                <p className="hand mt-2.5 inline-flex items-center gap-1.5 text-[0.78rem] text-navy-soft tabular-nums">
                  <IconFilm className="text-sm" />
                  {event.clips.length === 1 ? "1 timelapse" : `${event.clips.length} timelapses`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const { projects, weeks, stateOf, weekOf, hydrated } = useStore();
  const project = projects.find((p) => p.id === id);

  // The save is read from localStorage after mount, so on the server and on
  // the first paint there are no projects at all. Saying "not found" then
  // would be a lie that corrects itself a frame later.
  if (!project) {
    return (
      <div className="mx-auto w-full max-w-[880px] px-4 pt-6 sm:px-8">
        <BackLink />
        <Panel tone="line" radius={20} className="mt-6 bg-paper px-6 py-14 text-center">
          <p className="text-[1.05rem] font-extrabold text-navy">
            {hydrated ? "No such project" : "Loading…"}
          </p>
          {hydrated && (
            <p className="hand mx-auto mt-2 max-w-[40ch] text-[0.9rem] text-navy-soft">
              it may have been made on another device. this one only knows what is saved here.
            </p>
          )}
        </Panel>
      </div>
    );
  }

  const week = weekOf(project.weekId);
  const events = projectEvents(project, weeks, stateOf);
  const stats = projectStats(events);

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pt-6 pb-4 sm:px-8">
      <BackLink />

      {/* ---------- the project itself ---------- */}
      <Panel tone="line" radius={22} className="mt-5 overflow-hidden bg-paper">
        <div
          className="grid aspect-[21/9] place-items-center p-6 sm:aspect-[3/1]"
          style={{ background: week.accent }}
        >
          <WeekScene theme={week.theme} className="h-full w-auto max-w-full drop-shadow-lg" />
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <h1 className="text-[1.5rem] leading-tight font-extrabold tracking-[-0.03em] text-navy sm:text-[1.9rem]">
            {project.name}
          </h1>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="hand inline-flex items-center gap-1.5 text-[0.84rem] text-navy-soft tabular-nums">
              <IconPencil className="text-sm" />
              {stats.sessions === 1 ? "1 journal entry" : `${stats.sessions} journal entries`}
            </span>
            <span className="hand inline-flex items-center gap-1.5 text-[0.84rem] text-navy-soft tabular-nums">
              <IconFilm className="text-sm" />
              {stats.reels === 1 ? "1 reel" : `${stats.reels} reels`}
            </span>
            <span className="hand inline-flex items-center gap-1.5 text-[0.84rem] text-teal-deep tabular-nums">
              <IconClock className="text-sm" /> {fmtHours(stats.hours)} logged
            </span>
            {stats.started > 0 && (
              <span className="hand text-[0.84rem] text-line-strong">
                started {fmtDate(stats.started)}
              </span>
            )}
          </p>

          <p className="mt-3.5 max-w-[62ch] text-[0.95rem] leading-relaxed text-navy-soft">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="violet">Tier {project.tier}</Chip>
            <Chip tone="muted">{week.fullName}</Chip>
            <Chip tone="muted">Week {week.id}</Chip>
            {project.starter && <Chip tone="gold">Starter project</Chip>}
          </div>
        </div>
      </Panel>

      {/* ---------- what happened, newest first ---------- */}
      <h2 className="label mt-8 mb-3 text-violet-deep">Journal</h2>

      {events.length === 0 ? (
        <Panel tone="line" radius={18} className="bg-paper px-6 py-12 text-center">
          <p className="hand text-[0.9rem] text-navy-soft">
            nothing logged against this one yet.
          </p>
        </Panel>
      ) : (
        <ol className="grid gap-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} theme={week.theme} />
          ))}
        </ol>
      )}
    </div>
  );
}
