import Image from "next/image";
import { BRAND } from "@/lib/content";

/**
 * ── DROP YOUR REAL LOGO HERE ──────────────────────────────────────────────
 * Put the artwork in `public/brand/` and set LOGO_SRC to its path, e.g.
 *   const LOGO_SRC = "/brand/half-life-wordmark.svg";
 * Set LOGO_ASPECT to the file's own width ÷ height. The comp reserves a
 * 981 × 261 box (aspect 3.76), and the slot fills its width either way, so
 * nothing else needs to change.
 *
 * Until then the wordmark is set live in Masterpiece, the comp's own brush
 * face — real type scales, stays selectable, and never ships a blurry raster.
 * ──────────────────────────────────────────────────────────────────────────
 */
const LOGO_SRC: string | null = null;
const LOGO_ASPECT = 981 / 261;

type Props = {
  /** Renders as the page's h1 in the hero, plain text elsewhere. */
  as?: "h1" | "p" | "span";
  className?: string;
  /** Font size for the live-type fallback, as a CSS length. */
  fontSize?: string;
};

export default function Wordmark({
  as = "span",
  className = "",
  fontSize,
}: Props) {
  const Tag = as;

  if (LOGO_SRC) {
    return (
      <Tag className={`relative block w-full ${className}`}>
        <span className="sr-only">{BRAND.name}</span>
        <span
          className="relative block w-full"
          style={{ aspectRatio: String(LOGO_ASPECT) }}
        >
          <Image
            src={LOGO_SRC}
            alt=""
            fill
            priority
            sizes="(min-width: 1180px) 57vw, 88vw"
            className="object-contain object-left"
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
