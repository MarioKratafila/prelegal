"use client";

import { useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaPreview from "@/components/NdaPreview";
import { NdaFormData } from "@/lib/types";
import { generateNdaMarkdown } from "@/lib/generateNda";

const today = new Date().toISOString().split("T")[0];

const defaultFormData: NdaFormData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
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
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);

  function handleDownload() {
    const markdown = generateNdaMarkdown(formData);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Mutual-NDA.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Prelegal</span>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">Mutual NDA Creator</h1>
        </div>
        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Download NDA
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
        <aside className="w-96 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <NdaForm data={formData} onChange={setFormData} />
        </aside>
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <NdaPreview data={formData} />
        </main>
      </div>
    </div>
  );
}
