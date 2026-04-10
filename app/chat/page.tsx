import Chat from "@/components/chat/chat";

export const metadata = { title: "memacta – Chat" };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Chat</h1>
      <Chat />
    </main>
  );
}
