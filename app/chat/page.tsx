import Chat from "@/components/chat/chat";

export const metadata = { title: "memacta – Chat" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">AI Chat</h1>
        <p className="text-white/70 mt-2">Ask our AI assistant for creative ideas, prompts, and tips</p>
      </div>
      <div className="rounded-2xl bg-[#181828] border border-white/15 p-1">
        <Chat />
      </div>
    </main>
  );
}
