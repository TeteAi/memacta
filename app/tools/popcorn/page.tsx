import { Suspense } from "react";
import Popcorn from "@/components/popcorn/popcorn";

export const metadata = {
  title: "Popcorn — memacta",
  description:
    "Pick a short-form preset, pop out 3 vertical variations in one click. The scroll-bait factory for TikTok and Reels creators.",
};

export default function PopcornPage() {
  return (
    <Suspense>
      <Popcorn />
    </Suspense>
  );
}
