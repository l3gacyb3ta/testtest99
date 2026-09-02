import Image from "next/image";
import ImageSlot from "@/components/image-slot";
import SignupForm from "@/components/signup-form";
import Wordmark from "@/components/wordmark";
import { BRAND, MAKE_PHOTO } from "@/lib/content";
import { at, box, u } from "@/lib/stage";

/**
 * The group shot, on the comp's grid.
 *
 * Where the comp tossed five separate prints across this corner (275:183),
 * one photograph of every project stands in their place. It keeps the pile's
 * angle and its centre of mass, so the caption still reads across it and the
 * corner carries the same weight — it is simply one print instead of five.
 * The box clears the signup form above and the "how does it work?" plate
 * below, and rides the hero plate's lower-left corner exactly as the tallest
 * of the scattered prints did.
 */
const MAKE_FRAME = { x: 175, y: 755, w: 380, h: 214, angle: -17.21 } as const;

const MAKE_LABEL = "here's what you'll make!";
const HOW_LABEL = "how does it work?";

export default function Hero() {
  return (
    <section
      id="signup"
      className="relative z-10 isolate bg-hl-ink"
    >
      <HeroArt />

      {/* ── Comp reproduction, 1180px and up ───────────────────────────── */}
      <div
        className="stage hidden min-[1180px]:block"
        style={{ height: u(1092) }}
      >
        {/* hero plate */}
        <div
          className="absolute bg-hl-blue-deep"
          style={box(276, 98, 1256, 677)}
        />

        <div
          className="absolute flex items-center"
          style={box(418, 188, 981, 261)}
        >
          <Wordmark as="h1" fontSize={u(226.768)} className="w-full" />
        </div>

        <p
          className="absolute text-hl-paper"
          style={{ ...at(450, 443), width: u(851), fontSize: u(31.788), lineHeight: 1.1 }}
        >
          {BRAND.tagline}
        </p>
        <p
          className="absolute font-bold text-hl-paper"
          style={{ ...at(1259, 477), fontSize: u(22), lineHeight: 1.1 }}
        >
          {BRAND.taglineAside}
        </p>

        <SignupForm
          className="absolute"
          style={{ ...at(475, 562), width: u(866) }}
          fontSize={u(30)}
        />

        {/* Hand-angled caption. It rakes within 1.4deg of the print below and
            crosses its upper third, so it is lifted above rather than buried:
            handwriting on a photograph, carrying the same ink shadow the
            carousel gives its project labels. The comp could let the caption
            sit behind a scattered pile because the pile had gaps; one solid
            print has none. z-index rather than DOM order, so the label is
            still read before the picture it names. */}
        <div
          className="absolute z-10 flex items-center justify-center"
          // x nudged 26.5 right of the comp's 59.5: Masterpiece sets this line
          // 664 wide against Bricolage's 571, and centred on the comp's origin
          // its first letter fell 14 units off the left edge of the stage.
          // Moving the frame keeps the caption's size, and its rake across the
          // print, where the comp put them.
          style={box(86, 669, 516.721, 199.139)}
        >
          <span
            className="whitespace-nowrap font-hand text-white"
            style={{
              fontSize: u(50),
              transform: "rotate(-15.78deg)",
              textShadow: "0 2px 10px rgb(49 34 44 / 0.85)",
            }}
          >
            {MAKE_LABEL}
          </span>
        </div>

        <div
          className="absolute"
          style={{
            ...box(MAKE_FRAME.x, MAKE_FRAME.y, MAKE_FRAME.w, MAKE_FRAME.h),
            transform: `rotate(${MAKE_FRAME.angle}deg)`,
          }}
        >
          <ImageSlot
            label={MAKE_PHOTO.label}
            ratio={MAKE_PHOTO.ratio}
            className="h-full w-full"
            scale={1.15}
          />
        </div>

        {/* "how does it work?" — breaks the fold and overhangs the band below */}
        <div
          className="absolute grid place-items-center bg-hl-paper"
          style={box(474, 970, 918, 201)}
        >
          <p
            className="whitespace-nowrap font-hand text-hl-ink"
            style={{
              // Masterpiece sets this line 4% wider than the 918 plate at the
              // comp's 100. 84 puts it at 87% of the plate, so the paper keeps
              // a margin instead of the ink running off its own edge.
              fontSize: u(84),
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {HOW_LABEL}
          </p>
        </div>
        <svg
          className="absolute"
          style={box(785, 1165, 111.5, 106)}
          viewBox="0 0 111.5 106"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path d="M111.5 0H33.5L0 106H71.5L111.5 0Z" fill="#EDEDED" />
        </svg>
      </div>

      {/* ── Stacked layout, below 1180px ───────────────────────────────── */}
      <div className="min-[1180px]:hidden">
        <div className="flex min-h-[100svh] flex-col justify-center px-4 pt-16 pb-0 sm:px-8">
          <div className="bg-hl-blue-deep px-5 pt-7 pb-8 sm:px-9 sm:pt-10 sm:pb-11">
            <Wordmark
              as="h1"
              fontSize="clamp(3.2rem, 15vw, 7.5rem)"
              className="w-full"
            />
            <p
              className="mt-4 max-w-[34ch] text-hl-paper"
              style={{ fontSize: "clamp(1.05rem, 4.1vw, 1.5rem)", lineHeight: 1.25 }}
            >
              {BRAND.tagline} {BRAND.taglineAside}
            </p>
            <SignupForm
              className="mt-6"
              fontSize="clamp(1rem, 4.2vw, 1.375rem)"
            />
          </div>

          <p
            className="mt-9 font-hand text-white"
            style={{ fontSize: "clamp(1.5rem, 6.5vw, 2.4rem)" }}
          >
            {MAKE_LABEL}
          </p>
          {/* Same one print, at the width the column gives it. The tilt is
              gentler than the stage's: a full-width print is a heavier object
              than a snapshot, and reads wrong at the pile's angle. */}
          <div
            className="mt-4 aspect-[380/214] w-full ring-2 ring-white/70"
            style={{ transform: "rotate(-1.9deg)" }}
          >
            <ImageSlot
              label={MAKE_PHOTO.label}
              ratio={MAKE_PHOTO.ratio}
              className="h-full w-full"
            />
          </div>

          <div className="relative -mb-9 mt-14 self-start bg-hl-paper px-5 py-3 sm:px-8 sm:py-4">
            <p
              className="font-hand text-hl-ink"
              style={{
                // Stepped down from 1.75rem/8vw/3.25rem: this line is nowrap
                // inside a self-sizing plate, and Masterpiece sets it wide
                // enough to push past a 320px viewport at the old floor.
                fontSize: "clamp(1.5rem, 7vw, 3rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              {HOW_LABEL}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The comp lines the hero with the same illustrated plant-room painting
 * repeated and mirrored across the width at 66% over ink. Two mirrored tiles
 * reproduce that read while staying inside one optimised image request per
 * tile.
 */
function HeroArt() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="flex h-full w-full">
        <div className="relative h-full flex-1">
          <Image
            src="/art/hero-scene.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1180px) 50vw, 100vw"
            className="object-cover object-top opacity-[0.66]"
          />
        </div>
        <div className="relative hidden h-full flex-1 min-[1180px]:block">
          <Image
            src="/art/hero-scene.png"
            alt=""
            fill
            sizes="50vw"
            className="object-cover object-top opacity-[0.66] [transform:scaleX(-1)]"
          />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-hl-ink" />
    </div>
  );
}
