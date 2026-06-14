"use client";

import { DocumentResponse } from "@/lib/api";

interface Props {
  documents: DocumentResponse[];
  activeId: number | null;
  onSelect: (doc: DocumentResponse) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DocumentHistory({ documents, activeId, onSelect, onDelete, onNew }: Props) {
  return (
    <div className="no-print flex flex-col h-full bg-white border-r border-gray-200" style={{ width: "220px", flexShrink: 0 }}>
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#888888" }}>
          History
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {documents.length === 0 ? (
          <p className="px-4 py-6 text-xs text-center" style={{ color: "#888888" }}>
            No saved documents yet.
            <br />
            Save a draft to see it here.
          </p>
        ) : (
          <ul>
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => onSelect(doc)}
                  className="w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-gray-50 transition-colors relative group"
                  style={{
                    backgroundColor: activeId === doc.id ? "#f0f9ff" : undefined,
                    borderLeft: activeId === doc.id ? "3px solid #209dd7" : "3px solid transparent",
                  }}
                >
                  <span
                    className="text-xs font-medium leading-snug truncate pr-6"
                    style={{ color: "#032147" }}
                  >
                    {doc.title}
                  </span>
                  <span className="text-xs" style={{ color: "#888888" }}>
                    {timeAgo(doc.updated_at)}
                  </span>

                  <span
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 py-0.5 rounded hover:bg-red-50"
                    style={{ color: "#888888" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    title="Delete"
                  >
                    ✕
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onNew}
          className="w-full text-sm font-medium py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#209dd7", color: "white" }}
        >
          + New document
        </button>
      </div>
    </div>
  );
}
