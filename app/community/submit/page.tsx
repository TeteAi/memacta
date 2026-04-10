import SubmitForm from "@/components/community/submit-form";
import Link from "next/link";

export const metadata = { title: "memacta \u2013 Submit to Community" };

export default function SubmitPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Link
        href="/community"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        &larr; Back to Community
      </Link>
      <h1 className="text-3xl font-bold mb-6">Submit Your Creation</h1>
      <SubmitForm />
    </main>
  );
}
