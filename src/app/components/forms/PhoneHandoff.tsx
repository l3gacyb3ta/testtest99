"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Callout } from "@/app/components/ui"

interface ApiError {
  error?: { message?: string }
}

interface Minted {
  id: string
  /** Rendered SVG, produced server-side. The token never leaves this origin. */
  qrSvg: string
  url: string
  expiresAt: string
}

/**
 * The desktop half of the handoff.
 *
 * Asks the server for a code, shows it as a QR, and polls until a phone has
 * uploaded something — then hands the object key up to the composer, which
 * posts it exactly as if the file had been chosen here.
 *
 * Polling rather than a socket: this waits minutes at most, ends on its own,
 * and a websocket would be a deployment concern for a feature that is idle
 * 99% of the time.
 */
export function PhoneHandoff({
  onReady,
}: Readonly<{ onReady: (objectKey: string) => void }>) {
  const [minted, setMinted] = useState<Minted | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"waiting" | "expired" | "ready" | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => stopPolling, [stopPolling])

  async function mint() {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      const res = await fetch("/api/handoff", { method: "POST" })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as ApiError
        setError(payload.error?.message ?? `Could not make a code (${res.status})`)
        return
      }
      const payload = (await res.json()) as { data: Minted }
      setMinted(payload.data)
      setStatus("waiting")
      startPolling(payload.data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not make a code")
    } finally {
      setBusy(false)
    }
  }

  function startPolling(id: string) {
    stopPolling()
    timer.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/handoff/${id}`)
        if (!res.ok) return
        const payload = (await res.json()) as {
          data: { state: string; objectKey?: string }
        }
        if (payload.data.state === "ready" && payload.data.objectKey) {
          stopPolling()
          setStatus("ready")
          onReady(payload.data.objectKey)
          // Tell the server we have it, so nothing keeps this row live.
          void fetch(`/api/handoff/${id}`, { method: "POST" })
        } else if (payload.data.state === "expired") {
          stopPolling()
          setStatus("expired")
        }
      } catch {
        // A dropped poll is not worth surfacing; the next tick retries.
      }
    }, 2500)
  }

  return (
    <div className="hl-stack hl-stack--tight">
      {error ? <Callout tone="danger">{error}</Callout> : null}

      {!minted ? (
        <>
          <p className="hl-hint" style={{ margin: 0 }}>
            Record on your phone instead — scan a code, film it, and the video lands here. No
            signing in on the phone.
          </p>
          <div>
            <Button onClick={mint} disabled={busy}>
              {busy ? "Making a code…" : "Record on my phone"}
            </Button>
          </div>
        </>
      ) : null}

      {minted && status === "waiting" ? (
        <div className="hl-stack hl-stack--tight">
          {/* Server-rendered SVG from our own origin — the token is never sent
              to a third-party QR service. */}
          <div
            aria-label="QR code linking to the upload page"
            dangerouslySetInnerHTML={{ __html: minted.qrSvg }}
            style={{ width: 200, height: 200 }}
          />
          <p className="hl-hint" style={{ margin: 0 }}>
            Scan it with your phone camera. The code works once and expires shortly.
          </p>
          <details>
            <summary className="hl-hint">Can&rsquo;t scan it?</summary>
            <p className="hl-mono" style={{ wordBreak: "break-all" }}>
              {minted.url}
            </p>
          </details>
          <p className="hl-hint">Waiting for your phone…</p>
        </div>
      ) : null}

      {status === "ready" ? (
        <Callout>Got the video from your phone. Add a caption below and post it.</Callout>
      ) : null}

      {status === "expired" ? (
        <div className="hl-stack hl-stack--tight">
          <Callout tone="warning">That code expired before anything arrived.</Callout>
          <div>
            <Button onClick={mint} disabled={busy}>
              Make a new code
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
