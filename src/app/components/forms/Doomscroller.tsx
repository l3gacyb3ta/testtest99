"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge, Button, Callout } from "@/app/components/ui"

interface ApiError {
  error?: { message?: string }
}

export interface ReelAuthor {
  id: string
  name: string | null
  image: string | null
  streak: number
}

export interface Reel {
  id: string
  kind: string
  caption: string
  videoUrl: string | null
  thumbnailUrl: string | null
  publishedAt: string | null
  pinned: boolean
  author: ReelAuthor
  project: { id: string; theme: string; title: string } | null
  viewCount: number
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

interface Comment {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string | null; image: string | null }
  mine: boolean
}

const KIND_LABEL: Record<string, string> = {
  IDEA: "Idea",
  PROGRESS: "Progress",
  SUBMISSION: "Submission",
  FREEFORM: "",
  ANNOUNCEMENT: "From HQ",
}

/** "3 days ago" without pulling in a date library for one string. */
function ago(iso: string | null): string {
  if (!iso) return ""
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ]
  let value = seconds
  let unit = "second"
  for (const [size, name] of units) {
    if (value < size) {
      unit = name
      break
    }
    value = value / size
    unit = name
  }
  const rounded = Math.floor(value)
  if (unit === "second" && rounded < 10) return "just now"
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`
}

/**
 * The Doomscroller.
 *
 * Two behaviours carry it, and both hang off one IntersectionObserver:
 *
 * - The reel in view plays; every other one pauses. Without the pause half,
 *   scrolling leaves a trail of videos all playing at once underneath you.
 * - A view is recorded once, the first time a reel is properly on screen.
 *   Recorded from the client because the server cannot know what was actually
 *   watched, and deduplicated per viewer on the server because the client
 *   cannot be trusted with a number that decides prizes.
 *
 * Videos are muted, which is what lets them autoplay at all — every browser
 * blocks autoplay with sound.
 */
export function Doomscroller({
  initial,
  initialCursor,
}: Readonly<{ initial: Reel[]; initialCursor: string | null }>) {
  const [reels, setReels] = useState<Reel[]>(initial)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)

  const videoRefs = useRef(new Map<string, HTMLVideoElement>())
  const viewed = useRef(new Set<string>())

  const registerVideo = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el)
    else videoRefs.current.delete(id)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLVideoElement
          const id = el.dataset.reelId
          if (!id) continue

          if (entry.isIntersecting) {
            // play() rejects when the tab is backgrounded or the browser is
            // being strict; there is nothing to do about it and an unhandled
            // rejection in the console helps nobody.
            void el.play().catch(() => {})

            if (!viewed.current.has(id)) {
              viewed.current.add(id)
              void fetch(`/api/posts/${id}/view`, { method: "POST" })
                .then((res) => (res.ok ? res.json() : null))
                .then((payload: { data?: { viewCount?: number } } | null) => {
                  const next = payload?.data?.viewCount
                  if (typeof next === "number") {
                    setReels((current) =>
                      current.map((r) => (r.id === id ? { ...r, viewCount: next } : r)),
                    )
                  }
                })
                .catch(() => {})
            }
          } else {
            el.pause()
          }
        }
      },
      // Half on screen is the point at which it is the thing being looked at.
      { threshold: 0.5 },
    )

    for (const el of videoRefs.current.values()) observer.observe(el)
    return () => observer.disconnect()
  }, [reels])

  async function loadMore() {
    if (!cursor || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}`)
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as ApiError
        setError(payload.error?.message ?? `Could not load more (${res.status})`)
        return
      }
      const payload = (await res.json()) as { data: { items: Reel[]; nextCursor: string | null } }
      setReels((current) => [...current, ...payload.data.items])
      setCursor(payload.data.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more")
    } finally {
      setLoading(false)
    }
  }

  async function toggleLike(reel: Reel) {
    const liked = !reel.likedByMe
    // Optimistic: a like that waits for a round trip feels broken.
    setReels((current) =>
      current.map((r) =>
        r.id === reel.id
          ? { ...r, likedByMe: liked, likeCount: r.likeCount + (liked ? 1 : -1) }
          : r,
      ),
    )
    try {
      const res = await fetch(`/api/posts/${reel.id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      })
      if (!res.ok) throw new Error("failed")
      const payload = (await res.json()) as { data: { likeCount: number; likedByMe: boolean } }
      setReels((current) =>
        current.map((r) =>
          r.id === reel.id
            ? { ...r, likeCount: payload.data.likeCount, likedByMe: payload.data.likedByMe }
            : r,
        ),
      )
    } catch {
      // Put it back rather than leaving a like that never landed.
      setReels((current) =>
        current.map((r) =>
          r.id === reel.id
            ? { ...r, likedByMe: reel.likedByMe, likeCount: reel.likeCount }
            : r,
        ),
      )
      setError("That like did not save.")
    }
  }

  if (reels.length === 0) {
    return <Callout>Nothing here yet. Post the first reel.</Callout>
  }

  return (
    <div className="hl-stack hl-stack--tight">
      {error ? <Callout tone="danger">{error}</Callout> : null}

      <div className="hl-feed">
        {reels.map((reel) => (
          <article key={reel.id} className="hl-reel">
            {reel.videoUrl ? (
              <video
                ref={(el) => registerVideo(reel.id, el)}
                data-reel-id={reel.id}
                className="hl-reel-video"
                src={reel.videoUrl}
                poster={reel.thumbnailUrl ?? undefined}
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              // publicUrlFor returns null when S3_PUBLIC_URL is unset. Say so,
              // rather than rendering a broken player.
              <div className="hl-reel-missing">
                This video can&rsquo;t be played — uploads are not fully configured.
              </div>
            )}

            <div className="hl-reel-body">
              <div className="hl-reel-meta">
                {reel.author.image ? (
                  // Not next/image: the host is only known at runtime from
                  // S3_PUBLIC_URL, and an unlisted host renders blank.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="hl-avatar" src={reel.author.image} alt="" />
                ) : (
                  <span className="hl-avatar" aria-hidden="true" />
                )}
                <strong>{reel.author.name ?? "Someone"}</strong>
                {reel.author.streak > 0 ? (
                  <span className="hl-muted" title="Day streak">
                    {reel.author.streak}-day streak
                  </span>
                ) : null}
                {reel.pinned ? <Badge tone="success">{KIND_LABEL.ANNOUNCEMENT}</Badge> : null}
                {!reel.pinned && KIND_LABEL[reel.kind] ? (
                  <Badge>{KIND_LABEL[reel.kind]}</Badge>
                ) : null}
                {reel.project ? <span className="hl-muted">on {reel.project.title}</span> : null}
                <span className="hl-muted" style={{ marginLeft: "auto" }}>
                  {ago(reel.publishedAt)}
                </span>
              </div>

              {reel.caption ? <p style={{ margin: 0 }}>{reel.caption}</p> : null}

              <div className="hl-reel-actions">
                <Button
                  variant={reel.likedByMe ? "primary" : "default"}
                  onClick={() => toggleLike(reel)}
                >
                  {reel.likedByMe ? "Liked" : "Like"} · {reel.likeCount}
                </Button>
                <Button
                  onClick={() => setOpenComments(openComments === reel.id ? null : reel.id)}
                >
                  Comments · {reel.commentCount}
                </Button>
                <span className="hl-muted">{reel.viewCount} views</span>
              </div>

              {openComments === reel.id ? (
                <CommentThread
                  postId={reel.id}
                  onCountChange={(delta) =>
                    setReels((current) =>
                      current.map((r) =>
                        r.id === reel.id
                          ? { ...r, commentCount: Math.max(0, r.commentCount + delta) }
                          : r,
                      ),
                    )
                  }
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {cursor ? (
        <div>
          <Button onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/** Comments for one reel. Loaded on demand — most reels are scrolled past. */
function CommentThread({
  postId,
  onCountChange,
}: Readonly<{ postId: string; onCountChange: (delta: number) => void }>) {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch(`/api/posts/${postId}/comments`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload: { data: { items: Comment[] } }) => {
        if (!cancelled) setComments(payload.data.items)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.")
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as ApiError
        setError(payload.error?.message ?? `Could not post (${res.status})`)
        return
      }
      const payload = (await res.json()) as { data: { comment: Comment } }
      setComments((current) => [...(current ?? []), payload.data.comment])
      onCountChange(1)
      setBody("")
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
    if (!res.ok) {
      setError("Could not delete that.")
      return
    }
    setComments((current) => (current ?? []).filter((c) => c.id !== id))
    onCountChange(-1)
  }

  return (
    <div className="hl-stack hl-stack--tight">
      {error ? <Callout tone="danger">{error}</Callout> : null}
      {comments === null ? (
        <p className="hl-hint">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="hl-hint">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="hl-comment">
            <strong>{comment.author.name ?? "Someone"}</strong>{" "}
            <span className="hl-muted">{ago(comment.createdAt)}</span>
            <p style={{ margin: "0.25rem 0 0" }}>{comment.body}</p>
            {comment.mine ? (
              <Button onClick={() => remove(comment.id)}>Delete</Button>
            ) : null}
          </div>
        ))
      )}
      <form onSubmit={submit} className="hl-row">
        <input
          className="hl-input"
          value={body}
          maxLength={1000}
          placeholder="Say something"
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={busy || !body.trim()}>
          {busy ? "Posting…" : "Post"}
        </Button>
      </form>
    </div>
  )
}
