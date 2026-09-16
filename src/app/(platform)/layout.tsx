import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { WobbleDefs } from "@/app/components/ui/Wobble"
import "./globals.css"

/**
 * The comp's heading and body face, from the BRANDING frame. Everything on the
 * platform is set in it: nav items and names at Bold 22, body at Regular 16/22,
 * page titles at ExtraBold.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

/*
 * The comp's second face is COMICO, used for small uppercase labels
 * ("VIEW MORE", "LOG OUT", "YESTERDAY", "The Doomscroller") and the coin and
 * streak counters.
 *
 * It is not on Google Fonts and no licensed file ships in this repo, so
 * `--font-accent` in globals.css falls back to a comic-ish system stack. To
 * use the real thing, drop the file in public/fonts/ and restore these three
 * lines — no other change is needed, because every accent surface already
 * resolves through that one variable:
 *
 *   import localFont from "next/font/local"
 *   const comico = localFont({ src: "../../../public/fonts/Comico.ttf", variable: "--font-comico", display: "swap" })
 *   // ...then add `comico.variable` to the <html> className below.
 */

export const metadata: Metadata = {
  title: "Half-Life",
  description: "A 10-week hardware program from Hack Club.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <WobbleDefs />
        {children}
      </body>
    </html>
  )
}
