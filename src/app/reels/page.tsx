import type { Metadata } from "next";
import { ReelViewer } from "@/components/reels/ReelViewer";

export const metadata: Metadata = {
  title: "Reels — Half Life",
  description: "Every reel anyone posts, newest first. The fastest way to see what the program is building this week.",
};

export default function ReelsPage() {
  return (
    <>
      {/* The reel is the page here, so the title is for assistive tech only —
          no hanging sign competing with it for the frame. */}
      <h1 className="sr-only">Reels</h1>
      <ReelViewer />
    </>
  );
}
