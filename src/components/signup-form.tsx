"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Status = "idle" | "pending" | "done" | "error";

/**
 * The confirmation is a part passing down the line, not a terminus: it wipes
 * in over the field, holds long enough to read its ~10 words, then clears off
 * to the right and hands the empty field back. Signing up a second address is
 * the common case here — one student, a friend, a sibling — so the form must
 * never be spent.
 */
const CONFIRM_HOLD_MS = 3000;
const CONFIRM_EXIT_MS = 220;

/**
 * Email capture. Sizing is entirely `em`-relative, so the caller sets one
 * font-size and the field, the button and the paddings all follow — the comp
 * stage passes a `cqw` value, the stacked mobile layout passes a `clamp()`.
 *
 * The comp's submit glyph is the exported check vector (Figma 275:208), path
 * data verbatim.
 */
export default function SignupForm({
  className = "",
  fontSize,
  style,
}: {
  className?: string;
  fontSize?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const holdRef = useRef<number | null>(null);
  const exitRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    if (exitRef.current !== null) window.clearTimeout(exitRef.current);
    holdRef.current = null;
    exitRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /** Wipes the plate off to the right and re-arms the field behind it. */
  const dismiss = useCallback(() => {
    clearTimers();
    setLeaving(true);
    exitRef.current = window.setTimeout(() => {
      setLeaving(false);
      setStatus("idle");
      setMessage("");
    }, CONFIRM_EXIT_MS);
  }, [clearTimers]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A second submit supersedes a confirmation still on screen: the user
    // acted, so the new state replaces the old one outright rather than
    // playing an exit nobody is waiting for.
    clearTimers();
    setLeaving(false);
    const email = inputRef.current?.value.trim() ?? "";

    if (!email) {
      setStatus("error");
      setMessage("Enter your email so we can send you the details.");
      inputRef.current?.focus();
      return;
    }

    setStatus("pending");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload: { ok?: boolean; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(
          payload.error ??
            "That didn't go through. Give it another try in a moment.",
        );
        inputRef.current?.focus();
        return;
      }

      setStatus("done");
      setMessage("You're on the list — watch your inbox for week one.");
      if (inputRef.current) inputRef.current.value = "";
      holdRef.current = window.setTimeout(dismiss, CONFIRM_HOLD_MS);
    } catch {
      setStatus("error");
      setMessage("You look offline. Reconnect and try again.");
      inputRef.current?.focus();
    }
  }

  const pending = status === "pending";
  const confirming = status === "done";

  return (
    <div className={className} style={{ ...style, fontSize }}>
      {/* The row is the positioning context for the confirmation plate, so
          the plate is exactly the field's footprint and nothing below it ever
          moves. overflow-hidden keeps the wipe's cut edge crisp. */}
      <div className="relative overflow-hidden">
        <form onSubmit={onSubmit} noValidate className="flex w-full">
          <label htmlFor={id} className="sr-only">
            Email address
          </label>
          {/* The field is a slot cut into the hero plate, not a control
              sitting on it: ink ground, one soft cyan edge, and an input that
              carries no surface of its own — no background, no border, no ring
              of its own, because the slot is the control. The cyan caret is
              the only accent, and it is only there while someone is typing.

              It briefly also carried the image slot's registration ticks, its
              measured grid and an uppercase legend. At 33px tall none of that
              resolved: the grid ran three cells deep and the ticks were 8px
              specks, so it read as detail for its own sake rather than as an
              instrument. One surface, one boundary, one accent does the job
              the five of them were failing to. */}
          <div
            className={`hl-field relative min-w-0 flex-1 bg-hl-ink ${
              pending ? "opacity-70" : ""
            }`}
            style={{ height: "2.1667em" }}
          >
            <input
              ref={inputRef}
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              disabled={pending}
              placeholder="Email address"
              aria-describedby={status === "error" ? `${id}-msg` : undefined}
              aria-invalid={status === "error" || undefined}
              onFocus={() => {
                // Reaching the field is the clearest signal the confirmation has
                // been read; clear the plate ahead of its own timer.
                if (confirming && !leaving) dismiss();
              }}
              onChange={() => {
                if (confirming && !leaving) dismiss();
                if (status === "error") {
                  setStatus("idle");
                  setMessage("");
                }
              }}
              className="h-full w-full bg-transparent px-[0.667em] text-hl-paper caret-hl-cyan outline-none placeholder:text-hl-paper-soft"
            />

            {/* Edge at 55% rather than the slot component's 45%: on ink that
                is 3.71:1 where 45% is 2.96, and this boundary belongs to a
                control rather than to a picture. */}
            <span
              aria-hidden
              className="hl-field-edge pointer-events-none absolute inset-0 border-2 border-hl-cyan/55"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="grid shrink-0 place-items-center bg-hl-cyan text-hl-ink transition-colors hover:bg-white focus-visible:bg-white disabled:cursor-progress disabled:bg-hl-blue"
            style={{ height: "2.1667em", width: "2.8em" }}
          >
            <span className="sr-only">
              {pending ? "Signing you up" : "Sign up"}
            </span>
            {pending ? (
              <Spinner className="h-[0.9em] w-[0.9em] animate-spin" />
            ) : (
              <Check className="h-[0.95em] w-[0.98em]" />
            )}
          </button>
        </form>

        {/* Set at 0.75em so the full sentence holds one line on the comp stage
            and, where it wraps on a narrow phone, two lines still sit inside
            the field's own height. */}
        {confirming ? (
          <p
            aria-hidden
            className={`pointer-events-none absolute inset-0 flex items-center gap-[0.6em] bg-hl-cyan px-[0.8em] font-semibold leading-tight text-hl-ink ${
              leaving ? "hl-confirm-out" : "hl-confirm-in"
            }`}
            style={{ fontSize: "0.75em" }}
          >
            <Check draw className="h-[0.95em] w-[0.98em] shrink-0" />
            <span>{message}</span>
          </p>
        ) : null}
      </div>

      {/* Errors are shown here and reserve their line whether or not one is
          up, so the plate above never moves. The confirmation is not repeated
          here: it is already on the plate, and a second copy at 0.6em would
          wrap on a phone and push the page around under it. */}
      <p
        id={`${id}-msg`}
        className={`mt-[0.45em] font-semibold ${
          status === "error" ? "text-hl-cyan" : "text-transparent"
        }`}
        style={{ fontSize: "0.6em", minHeight: "1.4em" }}
      >
        {status === "error" ? message : " "}
      </p>

      {/* One persistent live region does all the announcing. The confirmation
          plate mounts with its text already in it, and a live region created
          that way is unreliably announced; this one is always in the tree, so
          every status change is a change to it. It carries no layout, which is
          what lets the visible confirmation live on the plate alone. */}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </div>
  );
}

function Check({
  className,
  draw = false,
}: {
  className?: string;
  /** Strokes the tick in, for the one moment the state really changes. */
  draw?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 39.4045 38.2329"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M1.28624 25.8278L16.2862 34.8278L37.2862 1.32784"
        stroke="currentColor"
        strokeWidth={5}
        className={draw ? "hl-stroke" : undefined}
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle
        cx={12}
        cy={12}
        r={9}
        stroke="currentColor"
        strokeWidth={3}
        strokeOpacity={0.3}
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="square"
      />
    </svg>
  );
}
