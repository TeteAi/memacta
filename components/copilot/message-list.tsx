"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import type { CopilotAction } from "@/lib/copilot";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: CopilotAction[];
}

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      data-testid="message-list"
      className="flex flex-col gap-4 overflow-y-auto flex-1 px-4 py-4"
    >
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role}
          content={msg.content}
          actions={msg.actions}
        />
      ))}
      {loading && (
        <div
          data-testid="message-bubble"
          data-role="assistant"
          className="self-start max-w-[85%]"
        >
          <div className="rounded-2xl px-4 py-3 bg-white/10">
            <span className="text-white/50 text-sm animate-pulse">
              Thinking…
            </span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
