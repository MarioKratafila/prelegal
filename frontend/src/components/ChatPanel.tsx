"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentFormData, Party } from "@/lib/types";
import { api, ChatMessage } from "@/lib/api";

interface Props {
  docType: string | null;
  formData: DocumentFormData;
  onUpdate: (updates: DocumentFormData) => void;
  onDocTypeChange: (docType: string) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your legal document assistant. I can help you create a Mutual NDA, Cloud Service Agreement, Design Partner Agreement, SLA, and more. Which type of legal document do you need today?",
};

export default function ChatPanel({ docType, formData, onUpdate, onDocTypeChange }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await api.chat(next, docType);
      setMessages([...next, { role: "assistant", content: res.message }]);

      if (res.doc_type) onDocTypeChange(res.doc_type);

      const f = res.fields as unknown as Record<string, unknown>;
      const updates: DocumentFormData = {};

      for (const [key, val] of Object.entries(f)) {
        if (val === null || val === undefined) continue;

        if ((key === "party1" || key === "party2") && typeof val === "object") {
          const current = ((formData[key] as unknown) as Record<string, string>) || {};
          const merged: Record<string, string> = { ...current };
          for (const [subKey, subVal] of Object.entries(val as Record<string, unknown>)) {
            if (subVal !== null && subVal !== undefined) {
              merged[subKey] = String(subVal);
            }
          }
          updates[key] = ((merged as unknown) as Party);
        } else {
          updates[key] = val as string | number;
        }
      }

      if (Object.keys(updates).length > 0) onUpdate(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#209dd7" }}>
          AI Assistant
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
          Chat to fill in your document — the preview updates as you go
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
              style={msg.role === "user" ? { backgroundColor: "#753991" } : undefined}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-400 italic">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message..."
            rows={2}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity flex-shrink-0"
            style={{ backgroundColor: "#753991" }}
          >
            Send
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: "#888888" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
