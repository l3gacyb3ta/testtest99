import { NextResponse } from "next/server";
import {
  getBotUserId,
  inviteToChannel,
  postMessage,
  verifySlackRequest,
  type SlackBlock,
} from "@/lib/slack";
import {
  SELF_RESOLVE_ACTIONS_BLOCK_ID,
  TICKET_ACTIONS_BLOCK_ID,
  ticketSection,
  type TicketRef,
} from "@/lib/tickets";

// Signature verification needs Node's crypto, not the edge runtime.
export const runtime = "nodejs";

type SlackEvent = {
  type: string;
  channel?: string;
  user?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  subtype?: string;
  bot_id?: string;
};

/** New top-level message in #halflife-help — post it to the private
 * tickets channel with a "Mark as helped" button, and reply in-thread with a
 * "I'm all set" button the ticket's own author can use to self-resolve.
 * Thread replies and anything from a bot (including our own acks) are
 * conversation on an existing ticket, not a new one. */
async function handleHelpMessage(event: SlackEvent) {
  const ticketsChannel = process.env.SLACK_TICKETS_CHANNEL_ID;
  if (!ticketsChannel) return;
  if (event.subtype || event.bot_id || event.thread_ts) return;
  if (!event.user || !event.ts || !event.channel) return;

  const ref: TicketRef = {
    helpChannel: event.channel,
    helpTs: event.ts,
    authorId: event.user,
    text: event.text ?? "",
  };

  const ticketBlocks: SlackBlock[] = [
    ticketSection(ref),
    {
      type: "actions",
      block_id: TICKET_ACTIONS_BLOCK_ID,
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Mark as helped", emoji: true },
          style: "primary",
          action_id: "mark_helped",
          value: JSON.stringify(ref),
        },
      ],
    },
  ];

  const ticketMessage = await postMessage(
    ticketsChannel,
    `New ticket from <@${ref.authorId}>`,
    { blocks: ticketBlocks },
  );
  if (!ticketMessage.ok || !ticketMessage.ts) return;

  const selfResolveBlocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Flagged for the team — if you're all set, you can mark this resolved yourself.",
      },
    },
    {
      type: "actions",
      block_id: SELF_RESOLVE_ACTIONS_BLOCK_ID,
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "I'm all set", emoji: true },
          action_id: "mark_resolved_by_author",
          value: JSON.stringify({
            ...ref,
            ticketsChannel,
            ticketsTs: ticketMessage.ts,
          }),
        },
      ],
    },
  ];

  await postMessage(
    ref.helpChannel,
    "Flagged for the team — if you're all set, you can mark this resolved yourself.",
    { threadTs: ref.helpTs, blocks: selfResolveBlocks },
  );
}

/** Someone joined the main channel — pull them into the rest of the Half
 * Life channels too. Skips the bot's own membership changes so wiring the
 * bot into the main channel doesn't loop back into inviting itself. */
async function handleMainChannelJoin(event: SlackEvent) {
  const mainChannel = process.env.SLACK_MAIN_CHANNEL_ID;
  if (!mainChannel || event.channel !== mainChannel || !event.user) return;

  const botUserId = await getBotUserId();
  if (event.user === botUserId) return;

  const targets = [
    process.env.SLACK_BULLETIN_CHANNEL_ID,
    process.env.SLACK_HELP_CHANNEL_ID,
  ].filter((id): id is string => Boolean(id));

  if (targets.length === 0) {
    console.error(
      "member_joined_channel fired but neither SLACK_BULLETIN_CHANNEL_ID nor SLACK_HELP_CHANNEL_ID is set",
    );
    return;
  }

  await Promise.all(targets.map((channel) => inviteToChannel(channel, event.user!)));
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

  let body: { type?: string; challenge?: string; event?: SlackEvent };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Slack retries delivery if it doesn't get a 200 within 3s. Reprocessing a
  // retry would double-invite members and double-post tickets, so only the
  // original delivery is handled — Slack has already gotten the point across.
  if (request.headers.get("x-slack-retry-num")) {
    return NextResponse.json({ ok: true });
  }

  if (body.type === "event_callback" && body.event) {
    const event = body.event;
    if (event.type === "member_joined_channel") {
      await handleMainChannelJoin(event);
    } else if (event.type === "message" && event.channel === process.env.SLACK_HELP_CHANNEL_ID) {
      await handleHelpMessage(event);
    }
  }

  return NextResponse.json({ ok: true });
}
