"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StarterGrid from "./starter-grid";
import MessageList, { type ChatMessage } from "./message-list";
import ComposeBox from "./compose-box";
import { handleAuthRequired } from "@/lib/auth-redirect";
import type { CopilotSuggestion } from "@/lib/copilot";

function CopilotInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);

  const showStarter = messages.length === 0;

  async function sendMessage(text: string, intent?: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          intent,
        }),
      });

      const data: CopilotSuggestion & { error?: string } = await res.json();

      // Auth gate (future-proof — currently route doesn't 401 for anon)
      if (handleAuthRequired(res, data)) return;

      if (data.reply) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
          actions: data.actions ?? [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        actions: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function onStarterSelect(prompt: string, intent: string) {
    setInput(prompt);
    sendMessage(prompt, intent);
  }

  return (
    <div
      data-testid="copilot"
      className="flex flex-col h-full"
    >
      {/* Starter grid — shown only before any message */}
      {showStarter && (
        <div className="px-4 pt-4 pb-2">
          <StarterGrid onSelect={onStarterSelect} />
        </div>
      )}

      {/* Message list */}
      <MessageList messages={messages} loading={loading} />

      {/* Compose box */}
      <ComposeBox
        value={input}
        onChange={setInput}
        onSend={() => sendMessage(input)}
        loading={loading}
      />
    </div>
  );
}

export default function Copilot() {
  return (
    <Suspense>
      <CopilotInner />
    </Suspense>
  );
}
