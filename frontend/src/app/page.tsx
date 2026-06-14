"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import NdaPreview from "@/components/NdaPreview";
import { NdaFormData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

const today = new Date().toISOString().split("T")[0];

const defaultFormData: NdaFormData = {
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
  const [formData, setFormData] = useState<NdaFormData>(defaultFormData);

  function updateFormData(updates: Partial<NdaFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10"
      >
        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#209dd7" }}>
            Prelegal
          </span>
          <h1 className="text-lg font-semibold leading-tight" style={{ color: "#032147" }}>
            Mutual NDA Creator
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
          <ChatPanel formData={formData} onUpdate={updateFormData} />
        </aside>
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <NdaPreview data={formData} />
        </main>
      </div>
    </div>
  );
}
