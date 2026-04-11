"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const updated: Message[] = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data?.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto rounded-xl p-4 bg-[#0e0e1a]">
        {messages.length === 0 && (
          <p className="text-white/50 text-sm text-center mt-20">Ask anything about video creation, prompts, or creative techniques...</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
              m.role === "user"
                ? "self-end bg-brand-gradient text-white"
                : "self-start bg-white/10 text-white/80"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#1e1e32] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none"
        />
        <button type="submit" disabled={loading || !input.trim()} className="px-5 py-3 rounded-xl bg-brand-gradient text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all">{loading ? "..." : "Send"}</button>
      </form>
    </div>
  );
}
