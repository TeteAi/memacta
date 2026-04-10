import GenerateForm from "@/components/create/generate-form";

export const metadata = { title: "memacta – Create Video" };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Video</h1>
      <GenerateForm mediaType="video" />
    </main>
  );
}
