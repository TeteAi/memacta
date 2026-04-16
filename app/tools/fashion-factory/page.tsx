import { Suspense } from "react";
import FashionFactory from "@/components/fashion/fashion-factory";

export const metadata = {
  title: "Fashion Factory — memacta",
  description:
    "Upload one person + up to 6 outfit references and generate a full styled lookbook with flux-kontext.",
};

export default function FashionFactoryPage() {
  return (
    <Suspense>
      <FashionFactory />
    </Suspense>
  );
}
