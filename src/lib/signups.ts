import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Signup capture.
 *
 * Two sinks, chosen by environment so the same route works locally and in
 * production without a code change:
 *
 *   SIGNUP_WEBHOOK_URL   POST { email, source, at } to your list provider,
 *                        form endpoint, Airtable/Sheets relay, or queue.
 *                        Set SIGNUP_WEBHOOK_TOKEN to send a bearer header.
 *   (unset)              append JSON Lines to ./data/signups.jsonl — fine for
 *                        local development and any host with a writable disk,
 *                        NOT durable on serverless. Point the webhook at a
 *                        real provider before launch.
 */

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "signups.jsonl");

const EMAIL = /^[^\s@,;:<>()[\]\\"]+@[^\s@.,;:<>()[\]\\"]+(\.[^\s@.,;:<>()[\]\\"]+)+$/;

export type SignupResult =
  | { ok: true; duplicate: boolean }
  | { ok: false; error: string; status: number };

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  if (!EMAIL.test(email)) return null;
  return email;
}

export async function recordSignup(
  email: string,
  source = "landing",
): Promise<SignupResult> {
  const entry = { email, source, at: new Date().toISOString() };
  const webhook = process.env.SIGNUP_WEBHOOK_URL;

  if (webhook) {
    const token = process.env.SIGNUP_WEBHOOK_TOKEN;
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: "We couldn't reach the signup list. Try again in a moment.",
      };
    }
    return { ok: true, duplicate: false };
  }

  await mkdir(STORE_DIR, { recursive: true });

  let duplicate = false;
  try {
    const existing = await readFile(STORE_FILE, "utf8");
    duplicate = existing
      .split("\n")
      .some((line) => line.includes(`"email":"${email}"`));
  } catch {
    // First signup — no file yet.
  }

  if (!duplicate) {
    await appendFile(STORE_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  }

  return { ok: true, duplicate };
}

/* ── Coarse per-instance rate limit ──────────────────────────────────────
   Enough to stop a bored browser tab hammering the endpoint. For real abuse
   protection put Vercel BotID or the WAF in front of the route. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}
