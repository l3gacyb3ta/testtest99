import Image from "next/image";
import { BRAND } from "@/lib/content";

const LOGO_SRC: string | null = "/art/logo.svg";

/**
 * The box the artwork is laid into — not the file's own aspect.
 *
 * `logo.svg` is a 1280 × 1280 square whose visible ink is only 1125 × 787, at
 * (70, 256). It is imagetracer.js output, so the canvas it was traced from
 * carries 256 of transparent air above the wordmark and 237 below. Reserving
 * the file's own 1:1 would have the hero hold an 864-square box for a wordmark
 * 787 tall.
 *
 * So the box takes the ink's own 1125/787 and the image covers it: a 1:1
 * source in a 1.43:1 box scales to the box's width and shows its middle 70%
 * vertically — y 192 to 1088, against ink that runs 256 to 1043. Nothing is
 * cut, with 64 to spare above and 45 below. Horizontally there is no crop at
 * all, so the wordmark keeps the 70 and 85 of air the file gives it, roughly
 * 6% in from each edge of the box.
 */
const LOGO_ASPECT = 1125 / 787;

type Props = {
  /** Renders as the page's h1 in the hero, plain text elsewhere. */
  as?: "h1" | "p" | "span";
  className?: string;
  /** Font size for the live-type fallback, as a CSS length. */
  fontSize?: string;
  /**
   * Renders `LOGO_SRC` instead of live type. The hero opts in; the footer does
   * not, because it recolours its wordmark to cyan with `text-hl-cyan!` and a
   * traced SVG carries its fills baked in — cream at 88% opacity across 664 of
   * its 853 paths — so no `color` can reach them. Live Masterpiece stays the
   * only wordmark that can take a colour.
   */
  art?: boolean;
  /**
   * How wide the artwork runs, as a CSS length. Height follows from the file's
   * own aspect, so a caller never has to know it.
   *
   * Width is the dimension a caller actually reasons in — the mark reads as
   * "this much of the screen across". What a caller cannot see from here is
   * how much height that buys: the ink is 1125 x 787, so every unit of width
   * brings 0.7 of height with it, and the callers say where that lands.
   */
  artWidth?: string;
};

export default function Wordmark({
  as = "span",
  className = "",
  fontSize,
  art = false,
  artWidth,
}: Props) {
  const Tag = as;

  if (art && LOGO_SRC) {
    return (
      <Tag className={`relative block ${className}`}>
        <span className="sr-only">{BRAND.name}</span>
        {/* `mx-auto` so the box still centres when a caller hands the tag a
            full-width class: the artwork is narrower than the tag now, and a
            block child does not answer to the plate's `text-center`. */}
        <span
          className="relative mx-auto block"
          style={{ width: artWidth, aspectRatio: String(LOGO_ASPECT) }}
        >
          {/* Cover, not contain: contain would letterbox the square canvas
              inside the ink-shaped box and shrink the wordmark to fit the
              transparent air around it. `sizes` is declared for the `fill`
              contract only — next/image serves a `.svg` src unoptimized
              automatically, so no srcset is generated from it. */}
          <Image
            src={LOGO_SRC}
            alt=""
            fill
            priority
            sizes="(min-width: 1180px) 57vw, 88vw"
            className="object-cover"
          />
        </span>
      </Tag>
    );
  }

  return (
    <Tag
      className={`font-hand leading-[0.86] text-white ${className}`}
      style={{ fontSize, letterSpacing: "-0.045em" }}
    >
      {BRAND.name.toLowerCase()}
    </Tag>
  );
}
