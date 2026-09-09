import { NextResponse } from "next/server";
import { postMessage, updateMessage, verifySlackRequest, type SlackBlock } from "@/lib/slack";

export const runtime = "nodejs";

type BlockAction = {
  action_id: string;
  value?: string;
};

type InteractionPayload = {
  type: string;
  user: { id: string };
  channel?: { id: string };
  message?: { ts: string; blocks?: SlackBlock[] };
  actions?: BlockAction[];
};

async function handleMarkHelped(payload: InteractionPayload, action: BlockAction) {
  if (!payload.channel?.id || !payload.message?.ts) return;

  let ticket: { helpChannel?: string; helpTs?: string; authorId?: string } = {};
  try {
    ticket = action.value ? JSON.parse(action.value) : {};
  } catch {
    // Malformed value — still resolve the tickets-channel message below.
  }

  // Keep everything except the button row, and note who resolved it. The
  // original ticket text comes along for free as the untouched section block
  // rather than needing to be threaded back in from state we don't keep.
  const keptBlocks = (payload.message.blocks ?? []).filter(
    (block) => block.block_id !== "ticket_actions",
  );
  keptBlocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: `✅ Helped by <@${payload.user.id}>` }],
  });

  await updateMessage(
    payload.channel.id,
    payload.message.ts,
    `Ticket resolved by <@${payload.user.id}>`,
    keptBlocks,
  );

  if (ticket.helpChannel && ticket.helpTs) {
    try {
      await postMessage(
        ticket.helpChannel,
        `You're all set — <@${payload.user.id}> marked this as helped.`,
        { threadTs: ticket.helpTs },
      );
    } catch (err) {
      console.error(`Failed to post help-channel ack: ${err}`);
    }
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const verified = verifySlackRequest(
    rawBody,
    request.headers.get("x-slack-request-timestamp"),
    request.headers.get("x-slack-signature"),
  );
  if (!verified) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Interactivity payloads arrive form-encoded with the JSON under `payload`.
  const form = new URLSearchParams(rawBody);
  const raw = form.get("payload");
  if (!raw) return NextResponse.json({ ok: false }, { status: 400 });

  let payload: InteractionPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (payload.type === "block_actions") {
    const action = payload.actions?.[0];
    if (action?.action_id === "mark_helped") {
      await handleMarkHelped(payload, action);
    }
  }

  return NextResponse.json({ ok: true });
}
