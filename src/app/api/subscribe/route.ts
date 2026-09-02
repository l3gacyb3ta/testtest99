import { NextResponse } from "next/server";
import { normalizeEmail, rateLimited, recordSignup } from "@/lib/signups";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Slow down a second, then try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't read that request." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(
    typeof body === "object" && body !== null
      ? (body as { email?: unknown }).email
      : undefined,
  );

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "That doesn't look like an email address." },
      { status: 400 },
    );
  }

  try {
    const result = await recordSignup(email);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true, duplicate: result.duplicate });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something broke on our end. Try again shortly." },
      { status: 500 },
    );
  }
}
