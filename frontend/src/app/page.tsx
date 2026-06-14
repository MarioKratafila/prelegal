"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import NdaPreview from "@/components/NdaPreview";
import GenericDocumentPreview from "@/components/GenericDocumentPreview";
import DocumentHistory from "@/components/DocumentHistory";
import { NdaFormData, DocumentFormData, Party } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { api, DocumentResponse } from "@/lib/api";

const today = new Date().toISOString().split("T")[0];

const NDA_DOC_TYPES = new Set(["Mutual-NDA.md", "Mutual-NDA-coverpage.md"]);

const DOC_NAMES: Record<string, string> = {
  "Mutual-NDA.md": "Mutual NDA",
  "Mutual-NDA-coverpage.md": "Mutual NDA Cover Page",
  "CSA.md": "Cloud Service Agreement",
  "design-partner-agreement.md": "Design Partner Agreement",
  "sla.md": "Service Level Agreement",
  "psa.md": "Professional Services Agreement",
  "DPA.md": "Data Processing Agreement",
  "Software-License-Agreement.md": "Software License Agreement",
  "Partnership-Agreement.md": "Partnership Agreement",
  "Pilot-Agreement.md": "Pilot Agreement",
  "BAA.md": "Business Associate Agreement",
  "AI-Addendum.md": "AI Addendum",
};

const defaultNdaData: NdaFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: today,
  mndaTermType: "expires",
  mndaTermYears: 1,
  confidentialityTermType: "years",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { printName: "", title: "", company: "", noticeAddress: "" },
  party2: { printName: "", title: "", company: "", noticeAddress: "" },
};

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [docType, setDocType] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({});
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch {
      // silently ignore — user may not be logged in yet
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/");
    } else if (user) {
      loadDocuments();
    }
  }, [user, loading, router, loadDocuments]);

  if (loading || !user) return null;

  function updateFormData(updates: DocumentFormData) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleDocTypeChange(newDocType: string) {
    if (newDocType !== docType) {
      setDocType(newDocType);
      setFormData({});
      setActiveDocId(null);
    }
  }

  function handleNew() {
    setDocType(null);
    setFormData({});
    setActiveDocId(null);
    setChatKey((k) => k + 1);
  }

  function handleSelectDocument(doc: DocumentResponse) {
    setDocType(doc.doc_type);
    setFormData(doc.fields as DocumentFormData);
    setActiveDocId(doc.id);
    setChatKey((k) => k + 1);
  }

  async function handleDeleteDocument(id: number) {
    await api.deleteDocument(id);
    if (activeDocId === id) {
      handleNew();
    }
    await loadDocuments();
  }

  async function handleSaveDraft() {
    if (!docType) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const saved = await api.saveDocument(docType, formData as Record<string, unknown>);
      setActiveDocId(saved.id);
      await loadDocuments();
      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage("Error saving");
    } finally {
      setSaving(false);
    }
  }

  const isNda = docType !== null && NDA_DOC_TYPES.has(docType);
  const pageTitle = docType ? (DOC_NAMES[docType] ?? "Document Creator") : "Document Creator";

  const ndaData: NdaFormData = {
    ...defaultNdaData,
    ...(formData as Partial<NdaFormData>),
    party1: { ...defaultNdaData.party1, ...((formData.party1 as Party) || {}) },
    party2: { ...defaultNdaData.party2, ...((formData.party2 as Party) || {}) },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#209dd7" }}>
              Prelegal
            </span>
            <h1 className="text-base font-semibold leading-tight" style={{ color: "#032147" }}>
              {pageTitle}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {docType && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors disabled:opacity-50"
              style={{ borderColor: "#209dd7", color: "#209dd7" }}
            >
              {saveMessage ?? (saving ? "Saving..." : "Save draft")}
            </button>
          )}
          <span className="text-sm hidden sm:block" style={{ color: "#888888" }}>{user.email}</span>
          <button
            onClick={logout}
            className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: "#888888" }}
          >
            Sign out
          </button>
          <button
            onClick={() => window.print()}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#209dd7" }}
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 print-content-container" style={{ height: "calc(100vh - 65px)" }}>
        <DocumentHistory
          documents={documents}
          activeId={activeDocId}
          onSelect={handleSelectDocument}
          onDelete={handleDeleteDocument}
          onNew={handleNew}
        />
        <aside className="border-r border-gray-200 bg-white flex-shrink-0 flex flex-col" style={{ width: "384px" }}>
          <ChatPanel
            key={chatKey}
            docType={docType}
            formData={formData}
            onUpdate={updateFormData}
            onDocTypeChange={handleDocTypeChange}
          />
        </aside>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {isNda ? (
              <NdaPreview data={ndaData} />
            ) : (
              <GenericDocumentPreview data={formData} docType={docType} />
            )}
          </div>
          <div className="px-8 pb-8">
            <div
              className="max-w-3xl mx-auto rounded-lg px-4 py-3 text-xs text-center"
              style={{ backgroundColor: "#fff8e1", color: "#888888", border: "1px solid #ecad0a33" }}
            >
              <strong style={{ color: "#ecad0a" }}>Draft only.</strong>{" "}
              This document is a draft for review purposes only. It is not legal advice and must be reviewed by a qualified attorney before use.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
