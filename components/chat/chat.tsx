"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-2 min-h-[200px] max-h-[480px] overflow-y-auto border border-border rounded-lg p-3 bg-card">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">Start a conversation...</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
              m.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-accent"
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
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
