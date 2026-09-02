"use client";

import { useId, useRef, useState, type CSSProperties } from "react";

type Status = "idle" | "pending" | "done" | "error";

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
  const inputRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    } catch {
      setStatus("error");
      setMessage("You look offline. Reconnect and try again.");
      inputRef.current?.focus();
    }
  }

  const pending = status === "pending";

  if (status === "done") {
    return (
      <div className={className} style={{ ...style, fontSize }}>
        <p
          className="flex items-center gap-[0.6em] bg-hl-cyan px-[0.8em] text-hl-ink font-semibold"
          style={{ minHeight: "2.1667em" }}
          role="status"
        >
          <Check draw className="h-[0.95em] w-[0.98em] shrink-0" />
          <span>{message}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...style, fontSize }}>
      <form onSubmit={onSubmit} noValidate className="flex w-full">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          ref={inputRef}
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={pending}
          placeholder="email@email.com"
          aria-describedby={message ? `${id}-msg` : undefined}
          aria-invalid={status === "error" || undefined}
          onChange={() => {
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          className="min-w-0 flex-1 bg-hl-paper px-[0.667em] text-hl-ink placeholder:text-hl-ink-soft disabled:opacity-70"
          style={{ height: "2.1667em" }}
        />
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

      <p
        id={`${id}-msg`}
        role="status"
        aria-live="polite"
        className={`mt-[0.45em] font-semibold ${
          status === "error" ? "text-hl-cyan" : "text-transparent"
        }`}
        style={{ fontSize: "0.6em", minHeight: "1.4em" }}
      >
        {message || " "}
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
