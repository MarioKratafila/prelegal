import { DocumentFormData, Party } from "@/lib/types";

// Maps doc_type filename to a display name
const DOC_NAMES: Record<string, string> = {
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

// Human-readable labels for field keys
const FIELD_LABELS: Record<string, string> = {
  effectiveDate: "Effective Date",
  governingLaw: "Governing Law",
  jurisdiction: "Jurisdiction",
  cloudServiceName: "Cloud Service Name",
  subscriptionPeriodMonths: "Subscription Period (months)",
  fees: "Fees",
  paymentProcess: "Payment Process",
  termMonths: "Term (months)",
  uptimePercentage: "Uptime Target",
  responseTimeCriticalHours: "Response Time — Critical (hrs)",
  responseTimeHighHours: "Response Time — High (hrs)",
  responseTimeMediumHours: "Response Time — Medium (hrs)",
  serviceCreditPercentage: "Service Credit",
  servicesDescription: "Services Description",
  deliverables: "Deliverables",
  dataTypes: "Data Types",
  processingPurpose: "Processing Purpose",
  phiTypes: "PHI Types",
  softwareName: "Software Name",
  licenseType: "License Type",
  partnershipPurpose: "Partnership Purpose",
  revenueSharePercent: "Revenue Share",
  pilotScope: "Pilot Scope",
  pilotDurationDays: "Pilot Duration (days)",
  successCriteria: "Success Criteria",
  programDescription: "Program Description",
  aiServiceDescription: "AI Service Description",
  inputOutputOwnership: "Input/Output Ownership",
};

const PARTY_FIELD_LABELS: Record<string, string> = {
  printName: "Print Name",
  title: "Title",
  company: "Company",
  noticeAddress: "Notice Address",
};

function FieldRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 w-48 shrink-0">{label}</span>
      <span className="text-sm text-indigo-700 font-medium">{String(value)}</span>
    </div>
  );
}

function PartySection({ label, party }: { label: string; party: Party }) {
  const hasAnyValue = Object.values(party).some((v) => v && String(v).trim());
  if (!hasAnyValue) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">{label}</h3>
      <div className="bg-gray-50 rounded-lg px-4 py-2">
        {Object.entries(party).map(([key, val]) =>
          val && String(val).trim() ? (
            <div key={key} className="flex gap-4 py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-500 w-36 shrink-0">
                {PARTY_FIELD_LABELS[key] ?? key}
              </span>
              <span className="text-sm text-indigo-700 font-medium">{val}</span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

interface Props {
  data: DocumentFormData;
  docType: string | null;
}

export default function GenericDocumentPreview({ data, docType }: Props) {
  const docName = docType ? (DOC_NAMES[docType] ?? docType) : "Legal Document";

  const topFields = Object.entries(data).filter(
    ([key, val]) =>
      key !== "party1" &&
      key !== "party2" &&
      val !== null &&
      val !== undefined &&
      String(val).trim() !== ""
  ) as [string, string | number][];

  const party1 = data.party1 as Party | null;
  const party2 = data.party2 as Party | null;
  const hasFields = topFields.length > 0 || party1 || party2;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-10 text-sm leading-relaxed text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8" style={{ color: "#032147" }}>
        {docName}
      </h1>

      {!hasFields && (
        <p className="text-center text-gray-400 italic mt-16">
          Chat with the AI assistant to fill in the document fields. They will appear here as you go.
        </p>
      )}

      {topFields.length > 0 && (
        <section className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-wide pb-1 mb-3 border-b border-gray-200"
            style={{ color: "#888888" }}
          >
            Document Details
          </h2>
          <div>
            {topFields.map(([key, val]) => (
              <FieldRow key={key} label={FIELD_LABELS[key] ?? key} value={val} />
            ))}
          </div>
        </section>
      )}

      {(party1 || party2) && (
        <section className="mb-6">
          <h2
            className="text-xs font-bold uppercase tracking-wide pb-1 mb-3 border-b border-gray-200"
            style={{ color: "#888888" }}
          >
            Parties
          </h2>
          {party1 && <PartySection label="Party 1" party={party1} />}
          {party2 && <PartySection label="Party 2" party={party2} />}
        </section>
      )}
    </div>
  );
}
