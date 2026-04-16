import { Suspense } from "react";
import MixedMediaClient from "@/components/mixed-media/mixed-media-client";
import MixedMediaSkeleton from "@/components/mixed-media/skeleton";

export const metadata = {
  title: "memacta - Mixed Media Studio",
  description:
    "Blend 2-3 aesthetic styles into a single striking shot. Anime Realism, Cyberpunk Noir, Oil Painting and more — fused into one unique image or video.",
};

export default function MixedMediaPage() {
  return (
    <Suspense fallback={<MixedMediaSkeleton />}>
      <MixedMediaClient />
    </Suspense>
  );
}
