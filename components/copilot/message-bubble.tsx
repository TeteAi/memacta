"use client";

import ActionChips from "./action-chips";
import type { CopilotAction } from "@/lib/copilot";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  actions?: CopilotAction[];
}

export default function MessageBubble({ role, content, actions }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      data-testid="message-bubble"
      data-role={role}
      className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-brand-gradient text-white"
            : "bg-white/10 text-white"
        }`}
      >
        {content}
      </div>
      {!isUser && actions && actions.length > 0 && (
        <ActionChips actions={actions} />
      )}
    </div>
  );
}
