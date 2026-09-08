import BuildCarousel from "@/components/build-carousel";
import Faq from "@/components/faq";
import Hero from "@/components/hero";
import Process from "@/components/process";
import SiteFooter from "@/components/site-footer";

export default function Page() {
  return (
    <>
      <a
        href="#how-it-works"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-hl-cyan focus:px-4 focus:py-2 focus:font-semibold focus:text-hl-ink"
      >
        Skip to how it works
      </a>
      <main className="flex-1">
        {/* The hero and "how does it work?" are one room, and this is the box
            that makes that true rather than merely coordinated.

            Both the steel ground and the raked-arc ground pattern live here,
            on one element spanning both sections, because the pattern cannot
            survive being drawn twice. It is a `patternTransform` of
            `rotate(60)scale(2)` on a 70x8 tile, so its repeat lattice is
            spanned by (70, 121.24) and (-13.86, 8) — and a vertical offset
            that lands back on that lattice needs 70m = 8*sqrt(3)*n, which has
            no integer solution because 70/(8*sqrt(3)) is irrational. Two boxes
            stacked would each start the pattern's phase at their own top edge
            and the arcs would break across the seam at every viewport height,
            with no size that ever lines them up. One box has one phase.

            The sections below keep their own grounds: the carousel and the FAQ
            are different rooms and are supposed to read as such. */}
        <div className="hl-ground-wave bg-hl-blue-deep">
          <Hero />
          <Process />
        </div>
        <BuildCarousel />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
