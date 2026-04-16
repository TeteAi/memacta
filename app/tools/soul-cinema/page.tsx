import { Suspense } from "react";
import SoulCinema from "@/components/soul-cinema/soul-cinema";

export const metadata = {
  title: "Soul Cinema — memacta",
  description:
    "Turn a story beat into a character-driven reel. Pick a Soul ID character, describe your story, and let Soul Cinema auto-generate a multi-scene narrative video.",
};

export default function SoulCinemaPage() {
  return (
    <Suspense>
      <SoulCinema />
    </Suspense>
  );
}
