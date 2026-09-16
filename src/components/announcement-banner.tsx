import { ANNOUNCEMENT } from "@/lib/site/content";

/**
 * The dateline, laid on the painting.
 *
 * It is a plate — flat ink, square corners, no border, no shadow, the one
 * container this system has — sized to its own words rather than to the
 * screen. A strip that spans the screen to carry 350px of sentence is mostly
 * ground, and at the top of a page that reads as chrome: a cookie bar, a
 * shipping notice, something to dismiss. Sized to its words it reads as what
 * it is, a label plate mounted on the scene.
 *
 * Absolutely positioned inside the hero rather than standing above it. In
 * flow it pushed `bg.png` down and took a bite out of the fold that the hero
 * then had to subtract back; on the painting it costs the fold nothing, the
 * hero is a plain `100svh` again, and the picture starts at the top of the
 * screen where it was composed to start.
 *
 * Ink on the painting's top band is 3.74:1, so the plate reads as its own
 * material at every width without a rule drawn around it. Paper on ink is
 * 12.85:1 and cyan on ink 8.96:1.
 *
 * Not sticky, for the reason the flag is not fixed: this page scrolls through
 * four rooms with their own grounds, and a plate riding over the carousel and
 * the FAQ would be an overlay rather than a mark on the hero.
 *
 * One surface, one accent. The email slot is the standing lesson on what
 * happens when a device is borrowed into a box this size: five decorative
 * systems at a scale where none of them resolved. So this is one plate, one
 * sentence, and the date in cyan — the accent carrying the one fact the plate
 * exists for rather than ornamenting it. Cyan is also the CTA's colour, a
 * viewport below, and the two do not compete: the button is a filled block
 * and this is 90px of type at the top edge.
 *
 * Static, like everything else here, and not a link — there is nowhere for it
 * to go, and an invented destination is worse than a sentence that tells you
 * the date.
 */
export default function AnnouncementBanner() {
  return (
    // The positioning box spans the hero so the plate can centre on the same
    // line the painting centres on, and carries the gutter that keeps the
    // plate off the screen edges on a phone. It has no ground: what shows
    // either side of the plate is the painting.
    //
    // `pointer-events-none` is load-bearing, not tidiness. This box is
    // invisible but it is still a hit target, and on a wide screen it crosses
    // the Hack Club flag — which is a link — at exactly the rows the flag
    // occupies. Without it the flag's lower two thirds stop being clickable.
    // The plate takes its events back so the sentence stays selectable.
    <div className="pointer-events-none absolute inset-x-0 top-[3.25rem] z-20 flex justify-center px-3 md:top-3">
      {/* Two vertical positions, because below about 620px of viewport the
          plate and the flag want the same row and the plate is too wide to
          move sideways out of the way.

          The narrow one is derived, not chosen. The flag hangs at `top-1`
          from a box whose width is `clamp(6.5rem, 11vw, 10rem)`, and below
          945px that clamp is pinned at its 6.5rem floor — so the flag's
          height there is a constant 6.5 x 184/526 = 2.27rem, putting its
          bottom edge at 2.52rem. 3.25rem clears it by 11.6px at every width
          this branch covers.

          The switch is at `md` rather than at the 620px where the collision
          actually ends: at 640 the plate clears the flag by 17px, which is a
          near miss rather than a decision, and at 768 it clears by 81. */}
      <div className="pointer-events-auto bg-hl-ink px-5 py-2.5">
        {/* Measured, not guessed: set in Open Sans the sentence is 21.86em
            wide — 13.56 for the prose, 8.06 for the date, plus about 3% on
            the date for the 600 weight. The box's 12 and the plate's 20
            either side take 64px off the screen, so the line holds at one
            from about 350px of viewport up, which is every phone in current
            use.

            The size is fluid rather than fixed because that threshold is the
            fluidity: at a flat 14px the line would wrap on a 360px Android,
            and at a flat 13px it would be a size smaller than it needs to be
            on every other screen. `3.6vw` tracks the width it has to fit
            into, so the plate is one line at 360 and the type is at its 16px
            ceiling by 444, where the plate stops growing at 390 x 42.

            Below 350 it takes two lines, and `text-balance` makes that a
            break before "starts" rather than one word stranded under a full
            line. */}
        <p
          className="text-balance text-center leading-snug text-hl-paper"
          style={{ fontSize: "clamp(0.8125rem, 3.6vw, 1rem)" }}
        >
          {ANNOUNCEMENT.lead}{" "}
          <span className="font-semibold text-hl-cyan">
            {ANNOUNCEMENT.date}
          </span>
          {ANNOUNCEMENT.tail}
        </p>
      </div>
    </div>
  );
}
