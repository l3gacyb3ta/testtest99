"use client"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"

/**
 * The Doomscroller panel that sits on every screen in the comp, with its
 * dismiss X in the corner.
 *
 * Loads its reels client-side, after the page: the rail is chrome on every
 * route, and blocking a dashboard render on a feed query would make the whole
 * app pay for a panel most visits never look at.
 *
 * Dismissal is per-viewer and per-browser, so localStorage is the right home
 * for it — nothing server-side needs to know, and it must not follow anyone to
 * another device.
 */
const DISMISS_KEY = "halflife.doomscroller.dismissed"

/**
 * localStorage as an external store.
 *
 * `useSyncExternalStore` rather than reading into state from an effect: the
 * dismissed flag lives outside React, and the server snapshot lets this render
 * as "hidden" during SSR so the panel never flashes in and out on hydration.
 */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function isDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    // Private windows and blocked site data both throw. Showing the panel is
    // the right failure: it is the feature, not an interruption.
    return false
  }
}

function dismiss(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1")
  } catch {
    // Not persisting is survivable; hiding it for this view is not.
  }
  for (const listener of listeners) listener()
}

/** Hidden on the server, so there is nothing to mismatch on hydration. */
function isDismissedOnServer(): boolean {
  return true
}

interface RailReel {
  id: string
  caption: string
  thumbnailUrl: string | null
  videoUrl: string | null
  author: { name: string | null }
  likeCount: number
}

export function DoomscrollerRail() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer)
  const [reels, setReels] = useState<RailReel[] | null>(null)

  useEffect(() => {
    if (dismissed) return
    let cancelled = false
    void fetch("/api/feed?limit=6")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload: { data: { items: RailReel[]; pinned: RailReel[] } }) => {
        if (cancelled) return
        setReels([...payload.data.pinned, ...payload.data.items])
      })
      .catch(() => {
        if (!cancelled) setReels([])
      })
    return () => {
      cancelled = true
    }
  }, [dismissed])

  if (dismissed) return null

  return (
    <aside className="hl-rail" aria-label="The Doomscroller">
      <div className="hl-rail-head">
        <p className="hl-rail-title">The Doomscroller</p>
        <button
          type="button"
          aria-label="Hide the Doomscroller"
          className="hl-label hl-label--muted"
          style={{ background: "none", border: 0, cursor: "pointer", fontSize: "1.1rem" }}
          onClick={dismiss}
        >
          ✕
        </button>
      </div>

      <div className="hl-rail-body">
        {reels === null ? (
          <p className="hl-hint" style={{ padding: "1rem" }}>
            Loading reels…
          </p>
        ) : reels.length === 0 ? (
          <p className="hl-hint" style={{ padding: "1rem" }}>
            No reels yet. <Link href="/feed">Post the first one.</Link>
          </p>
        ) : (
          <div className="hl-feed">
            {reels.map((reel) => (
              <article key={reel.id} className="hl-reel">
                <Link href="/feed" aria-label={`Open the feed: ${reel.caption || "reel"}`}>
                  {reel.videoUrl ? (
                    <video
                      className="hl-reel-video"
                      src={reel.videoUrl}
                      poster={reel.thumbnailUrl ?? undefined}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <span className="hl-reel-missing">Reel</span>
                  )}
                </Link>
                <div className="hl-reel-body" style={{ padding: "0.6rem 0.75rem" }}>
                  <span className="hl-muted" style={{ fontSize: "0.85rem" }}>
                    {reel.author.name ?? "Someone"} · {reel.likeCount} likes
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
