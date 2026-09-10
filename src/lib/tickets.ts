import type { SlackBlock } from "./slack";

/**
 * Everything either button (the staff-facing one in the tickets channel, or
 * the self-resolve one in the #halflife-help thread) needs to act — carried
 * in the button's own `value` since there's no ticket database to look it
 * up from.
 */
export type TicketRef = {
  helpChannel: string;
  helpTs: string;
  authorId: string;
  text: string;
};

export const TICKET_ACTIONS_BLOCK_ID = "ticket_actions";
export const SELF_RESOLVE_ACTIONS_BLOCK_ID = "self_resolve_actions";

/** `permalink` forwards the real message (Slack unfurls it into the
 * original's content, sender, and formatting) — falls back to a plain-text
 * quote if the permalink lookup failed or hasn't been done. */
export function ticketSection(ref: TicketRef, permalink?: string | null): SlackBlock {
  const body = permalink ?? `>${ref.text}`;
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Ticket* from <@${ref.authorId}> in <#${ref.helpChannel}>\n${body}`,
    },
  };
}

export function resolvedContext(byUserId: string, note?: string): SlackBlock {
  return {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `✅ Helped by <@${byUserId}>${note ? ` — ${note}` : ""}`,
      },
    ],
  };
}

/** Strips whichever action block is present and appends a resolved note —
 * shared by both buttons since a message only ever carries one of the two. */
export function resolveBlocks(
  blocks: SlackBlock[] | undefined,
  byUserId: string,
  note?: string,
): SlackBlock[] {
  const kept = (blocks ?? []).filter(
    (block) =>
      block.block_id !== TICKET_ACTIONS_BLOCK_ID &&
      block.block_id !== SELF_RESOLVE_ACTIONS_BLOCK_ID,
  );
  kept.push(resolvedContext(byUserId, note));
  return kept;
}
