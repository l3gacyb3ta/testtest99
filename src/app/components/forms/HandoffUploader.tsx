"use client"
import { useRef, useState } from "react"
import { Button, Callout, Field } from "@/app/components/ui"

interface ApiError {
  error?: { message?: string }
}

/**
 * The phone half of the handoff.
 *
 * `capture="environment"` is what makes this worth building: on a phone it
 * opens the rear camera straight into the native recorder, and hands back the
 * platform's own format — an .mp4 on iOS, which is the one format everything
 * plays. A MediaRecorder implementation here would be more code, worse on iOS,
 * and would produce .webm that a chunk of the audience cannot watch.
 *
 * On a desktop browser the same input degrades to an ordinary file picker,
 * which is a perfectly good fallback.
 */
export function HandoffUploader({ token }: Readonly<{ token: string }>) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError("Record or choose a video first.")
      return
    }

    setState("uploading")
    try {
      const form = new FormData()
      form.append("token", token)
      form.append("file", file)

      const res = await fetch("/api/handoff/upload", { method: "POST", body: form })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as ApiError
        setError(payload.error?.message ?? `Upload failed (${res.status})`)
        setState("idle")
        return
      }
      setState("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setState("idle")
    }
  }

  if (state === "done") {
    return (
      <div className="hl-stack hl-stack--tight">
        <Callout>Sent. Go back to your computer to finish the post — you can close this.</Callout>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="hl-stack hl-stack--tight">
      {error ? <Callout tone="danger">{error}</Callout> : null}

      <Field label="Video" hint="Tap to record, or pick one you already have.">
        <input
          ref={fileRef}
          className="hl-input"
          type="file"
          accept="video/*"
          capture="environment"
          disabled={state === "uploading"}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </Field>

      {fileName ? <p className="hl-hint">{fileName}</p> : null}

      <div>
        <Button type="submit" variant="primary" disabled={state === "uploading"}>
          {state === "uploading" ? "Sending…" : "Send to my computer"}
        </Button>
      </div>

      <p className="hl-hint">
        This link works once, and only for the next few minutes.
      </p>
    </form>
  )
}
