import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Shantell_Sans } from "next/font/google";
import { SketchDefs } from "@/components/art";
import { AppShell } from "@/components/shell/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const hand = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Half Life — ten weeks of hardware",
  description:
    "Design five hardware projects, then build all five. Ten weeks, real funding, and a 3D printer at the end.",
};

export const viewport: Viewport = {
  themeColor: "#fcf7f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${hand.variable}`}>
      <body>
        <SketchDefs />
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
