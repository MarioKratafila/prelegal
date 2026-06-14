"use client";

import { useState, useRef, useEffect } from "react";
import { NdaFormData } from "@/lib/types";
import { api, ChatMessage } from "@/lib/api";

interface Props {
  formData: NdaFormData;
  onUpdate: (updates: Partial<NdaFormData>) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your legal document assistant. I'll help you complete a Mutual Non-Disclosure Agreement. What is the purpose of this NDA — what are the two parties exploring or evaluating together?",
};

export default function ChatPanel({ formData, onUpdate }: Props) {
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
      const res = await api.chat(next);
      setMessages([...next, { role: "assistant", content: res.message }]);

      const f = res.fields;
      const updates: Partial<NdaFormData> = {};
      if (f.purpose != null) updates.purpose = f.purpose;
      if (f.effectiveDate != null) updates.effectiveDate = f.effectiveDate;
      if (f.mndaTermType != null) updates.mndaTermType = f.mndaTermType;
      if (f.mndaTermYears != null) updates.mndaTermYears = f.mndaTermYears;
      if (f.confidentialityTermType != null) updates.confidentialityTermType = f.confidentialityTermType;
      if (f.confidentialityTermYears != null) updates.confidentialityTermYears = f.confidentialityTermYears;
      if (f.governingLaw != null) updates.governingLaw = f.governingLaw;
      if (f.jurisdiction != null) updates.jurisdiction = f.jurisdiction;
      if (f.modifications != null) updates.modifications = f.modifications;
      if (f.party1 != null) {
        const p = { ...formData.party1 };
        if (f.party1.printName != null) p.printName = f.party1.printName;
        if (f.party1.title != null) p.title = f.party1.title;
        if (f.party1.company != null) p.company = f.party1.company;
        if (f.party1.noticeAddress != null) p.noticeAddress = f.party1.noticeAddress;
        updates.party1 = p;
      }
      if (f.party2 != null) {
        const p = { ...formData.party2 };
        if (f.party2.printName != null) p.printName = f.party2.printName;
        if (f.party2.title != null) p.title = f.party2.title;
        if (f.party2.company != null) p.company = f.party2.company;
        if (f.party2.noticeAddress != null) p.noticeAddress = f.party2.noticeAddress;
        updates.party2 = p;
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
          Chat to fill in your NDA — the preview updates as you go
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
