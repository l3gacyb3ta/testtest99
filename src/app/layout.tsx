import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/**
 * The comp's own display face (Figma 275:8), self-hosted from `public/fonts`.
 * It ships a single 400 brush weight whose strokes overhang their advances —
 * 'I' carries 0.52em of ink on a 0.32em advance — so it is already heavy and
 * must never be synthetically emboldened. See `.font-hand` in globals.css.
 *
 * Licence: free, per `public/fonts/Read me.txt`, with the author asking for a
 * donation to charity for commercial use.
 */
const masterpiece = localFont({
  src: "../../public/fonts/Masterpiece.ttf",
  variable: "--font-masterpiece",
  weight: "400",
  style: "normal",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Half Life: become a hardware expert in 10 weeks",
  description:
    "Ten weeks. Five projects designed, five projects built. Hack Club funds your parts and ships you a 3D printer or a laptop at the end. Ages 13–18, no experience needed.",
  openGraph: {
    title: "Half Life: become a hardware expert in 10 weeks",
    description:
      "Design five hardware projects, then build all five. Hack Club funds the parts and ships the prizes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#31222c",
  colorScheme: "dark",
};

const DIRECTION_CONTRACT = `<!--
IMPECCABLE DIRECTION CONTRACT

THESIS: Half Life is a ten-week production line for hardware, so the page is
drawn as the line itself — a thick schematic band that physically links each
stage to the next. It refuses the stacked equal-cards "how it works" row that
every program page ships.

OWN-WORLD: Palette is the Figma "color scheme" frame verbatim — ink #31222c
ground, paper #ededed panels, cyan #8ed3dc traces, deep blue #397cbe hero
block, periwinkle #a39bd6 and lavender #c9c7ec bands. Masterpiece brush on the
hero and footer, Bricolage Grotesque display between, Archivo body. Square corners, no shadows: flat plates and thick
tapering vector bands, like control-panel silkscreen.

STORY: A 13-18 year old sees the offer and the prize in one viewport, drops an
email, then follows the band down through design -> funding -> build -> printer,
picking up the asides on the way, and leaves believing this is real and free.

FIRST VIEWPORT: Full-bleed illustrated plant-room art under an ink wash; a deep
blue plate holds the wordmark, the ten-week promise, and one paper email field
with a cyan submit. Bottom-left, a hand-angled "here's what you'll make!" over
a scatter of project photos. The "how does it work?" plate breaks the fold.

FORM: Reproduction of the user's approved comp (Figma 275:8) — brief-pinned, so
no concept roll was dealt. seed: brief-pinned/figma-275-8.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bricolage.variable} ${masterpiece.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-hl-ink text-hl-paper">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
