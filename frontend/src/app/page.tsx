"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import NdaPreview from "@/components/NdaPreview";
import GenericDocumentPreview from "@/components/GenericDocumentPreview";
import { NdaFormData, DocumentFormData, Party } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const today = new Date().toISOString().split("T")[0];

const NDA_DOC_TYPES = new Set(["Mutual-NDA.md", "Mutual-NDA-coverpage.md"]);

const DOC_NAMES: Record<string, string> = {
  "Mutual-NDA.md": "Mutual NDA Creator",
  "Mutual-NDA-coverpage.md": "Mutual NDA Cover Page Creator",
  "CSA.md": "Cloud Service Agreement Creator",
  "design-partner-agreement.md": "Design Partner Agreement Creator",
  "sla.md": "Service Level Agreement Creator",
  "psa.md": "Professional Services Agreement Creator",
  "DPA.md": "Data Processing Agreement Creator",
  "Software-License-Agreement.md": "Software License Agreement Creator",
  "Partnership-Agreement.md": "Partnership Agreement Creator",
  "Pilot-Agreement.md": "Pilot Agreement Creator",
  "BAA.md": "Business Associate Agreement Creator",
  "AI-Addendum.md": "AI Addendum Creator",
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

  function updateFormData(updates: DocumentFormData) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleDocTypeChange(newDocType: string) {
    if (newDocType !== docType) {
      setDocType(newDocType);
      setFormData({});
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const isNda = docType !== null && NDA_DOC_TYPES.has(docType);
  const pageTitle = docType ? (DOC_NAMES[docType] ?? "Document Creator") : "Document Creator";

  // For NDA preview, merge generic formData over the typed defaults
  const ndaData: NdaFormData = {
    ...defaultNdaData,
    ...(formData as Partial<NdaFormData>),
    party1: { ...defaultNdaData.party1, ...((formData.party1 as Party) || {}) },
    party2: { ...defaultNdaData.party2, ...((formData.party2 as Party) || {}) },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#209dd7" }}>
            Prelegal
          </span>
          <h1 className="text-lg font-semibold leading-tight" style={{ color: "#032147" }}>
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "#888888" }}>{user.email}</span>
          <button
            onClick={logout}
            className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ color: "#888888" }}
          >
            Sign out
          </button>
          <button
            onClick={() => window.print()}
            className="text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            style={{ backgroundColor: "#209dd7" }}
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
        <aside className="w-96 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col">
          <ChatPanel
            docType={docType}
            formData={formData}
            onUpdate={updateFormData}
            onDocTypeChange={handleDocTypeChange}
          />
        </aside>
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {isNda ? (
            <NdaPreview data={ndaData} />
          ) : (
            <GenericDocumentPreview data={formData} docType={docType} />
          )}
        </main>
      </div>
    </div>
  );
}
