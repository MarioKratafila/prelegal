"use client";

import { NdaFormData, Party } from "@/lib/types";

interface Props {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string;
  party: Party;
  onChange: (p: Party) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Print Name</label>
          <input
            type="text"
            value={party.printName}
            onChange={(e) => onChange({ ...party, printName: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title</label>
          <input
            type="text"
            value={party.title}
            onChange={(e) => onChange({ ...party, title: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. CEO"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Company</label>
          <input
            type="text"
            value={party.company}
            onChange={(e) => onChange({ ...party, company: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Notice Address</label>
          <input
            type="text"
            value={party.noticeAddress}
            onChange={(e) => onChange({ ...party, noticeAddress: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email or postal address"
          />
        </div>
      </div>
    </div>
  );
}

export default function NdaForm({ data, onChange }: Props) {
  function set<K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
        <textarea
          value={data.purpose}
          onChange={(e) => set("purpose", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
        <input
          type="date"
          value={data.effectiveDate}
          onChange={(e) => set("effectiveDate", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">MNDA Term</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mndaTermType"
              value="expires"
              checked={data.mndaTermType === "expires"}
              onChange={() => set("mndaTermType", "expires")}
              className="text-indigo-600"
            />
            Expires after
            <input
              type="number"
              min={1}
              value={data.mndaTermYears}
              onChange={(e) => set("mndaTermYears", Number(e.target.value))}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            year(s)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mndaTermType"
              value="until-terminated"
              checked={data.mndaTermType === "until-terminated"}
              onChange={() => set("mndaTermType", "until-terminated")}
              className="text-indigo-600"
            />
            Until terminated
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Term of Confidentiality</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="confidentialityTermType"
              value="years"
              checked={data.confidentialityTermType === "years"}
              onChange={() => set("confidentialityTermType", "years")}
              className="text-indigo-600"
            />
            <input
              type="number"
              min={1}
              value={data.confidentialityTermYears}
              onChange={(e) => set("confidentialityTermYears", Number(e.target.value))}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="confidentialityTermType"
              value="perpetuity"
              checked={data.confidentialityTermType === "perpetuity"}
              onChange={() => set("confidentialityTermType", "perpetuity")}
              className="text-indigo-600"
            />
            In perpetuity
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Governing Law (State)</label>
        <input
          type="text"
          value={data.governingLaw}
          onChange={(e) => set("governingLaw", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Delaware"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
        <input
          type="text"
          value={data.jurisdiction}
          onChange={(e) => set("jurisdiction", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. New Castle, DE"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MNDA Modifications{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.modifications}
          onChange={(e) => set("modifications", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="List any modifications to the standard terms"
        />
      </div>

      <hr className="border-gray-200" />

      <PartyFields
        label="Party 1"
        party={data.party1}
        onChange={(p) => set("party1", p)}
      />

      <hr className="border-gray-200" />

      <PartyFields
        label="Party 2"
        party={data.party2}
        onChange={(p) => set("party2", p)}
      />
    </div>
  );
}
