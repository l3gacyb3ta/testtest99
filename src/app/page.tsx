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
        <Hero />
        <Process />
        <BuildCarousel />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
