"use client";

import { useRef, useState } from "react";
import { Button, Panel, cx } from "@/components/platform/ui";
import { IconFilm } from "@/components/platform/icons";
import { uploadFile, useHandoff } from "@/lib/use-handoff";

/**
 * Getting a video out of someone and into the bucket.
 *
 * Two routes, because the program runs on hardware that is nowhere near the
 * machine the platform is open on. You can pick a file here, or scan a code and
 * film on your phone — which is the one that actually gets used, since the
 * bench and the laptop are rarely the same desk. The phone route needs no
 * sign-in on the phone: the QR carries a single-use token that expires in
 * minutes, so nobody has to type a Hack Club password into a borrowed handset.
 *
 * Either way what comes back is an R2 object key, never a URL. URLs are minted
 * at read time so the bucket or the CDN in front of it can move without
 * rewriting a single stored row.
 */
export function ReelCapture({
  objectKey,
  onCaptured,
  folder = "posts",
  label = "Your reel",
}: {
  objectKey: string | null;
  onCaptured: (objectKey: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handoff = useHandoff((key) => {
    onCaptured(key);
    setShowQr(false);
  });

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onCaptured(await uploadFile(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not upload");
    } finally {
      setBusy(false);
    }
  }

  if (objectKey) {
    return (
      <Panel tone="teal" radius={16} className="flex items-center gap-3 bg-teal-pale px-4 py-3">
        <IconFilm className="shrink-0 text-[1.4rem] text-teal-deep" />
        <p className="min-w-0 flex-1 text-[0.9rem] leading-snug font-semibold text-navy">
          {label} is uploaded and ready to post.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            onCaptured(null);
            handoff.cancel();
          }}
        >
          Replace
        </Button>
      </Panel>
    );
  }

  return (
    <div className="grid gap-3">
      {error && (
        <p className="text-[0.85rem] font-semibold text-coral-deep" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Uploading…" : "Choose a video"}
        </Button>
        <Button
          variant="outline"
          disabled={handoff.status === "minting"}
          onClick={() => {
            setShowQr(true);
            void handoff.mint();
          }}
        >
          {handoff.status === "minting" ? "Making a code…" : "Record on my phone"}
        </Button>
      </div>

      <input
        ref={input}
        type="file"
        accept="video/*"
        className="sr-only"
        // `capture` is a hint, not a constraint: on a phone it opens the camera
        // straight away, and on a laptop the browser ignores it and shows the
        // file picker, which is exactly what is wanted in both places.
        capture="environment"
        onChange={(e) => void pick(e.target.files?.[0])}
      />

      {showQr && handoff.minted && handoff.status === "waiting" && (
        <Panel tone="line" radius={16} className="grid justify-items-center gap-2 bg-paper p-4">
          {/* Server-rendered SVG from our own origin — the token is never sent
              to a third-party QR service. */}
          <div
            aria-label="QR code linking to the upload page"
            className="size-[180px]"
            dangerouslySetInnerHTML={{ __html: handoff.minted.qrSvg }}
          />
          <p className="hand text-center text-[0.85rem] text-navy-soft">
            Scan it, film it, and the video lands here. Works once, expires shortly.
          </p>
          <p className="label text-sky-deep">Waiting for your phone…</p>
        </Panel>
      )}

      {handoff.status === "expired" && (
        <p className={cx("hand text-[0.85rem] text-coral-deep")}>
          That code expired. Make another one.
        </p>
      )}
      {handoff.error && (
        <p className="text-[0.85rem] font-semibold text-coral-deep" role="alert">
          {handoff.error}
        </p>
      )}
    </div>
  );
}
