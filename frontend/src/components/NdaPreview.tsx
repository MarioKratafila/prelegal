import { NdaFormData } from "@/lib/types";

interface Props {
  data: NdaFormData;
}

function Field({ value, placeholder }: { value: string; placeholder: string }) {
  if (value.trim())
    return <span className="text-indigo-700 font-medium">{value}</span>;
  return <span className="text-gray-400 italic">{placeholder}</span>;
}

export default function NdaPreview({ data }: Props) {
  const mndaTerm =
    data.mndaTermType === "expires"
      ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityTerm =
    data.confidentialityTermType === "years"
      ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  return (
    <div id="nda-preview" className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-10 text-sm leading-relaxed text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-2">Mutual Non-Disclosure Agreement</h1>
      <p className="text-xs text-gray-500 text-center mb-8">
        Common Paper Standard Terms Version 1.0
      </p>

      <section className="mb-5">
        <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">Purpose</h2>
        <p><Field value={data.purpose} placeholder="How Confidential Information may be used" /></p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">Effective Date</h2>
        <p><Field value={data.effectiveDate} placeholder="Not set" /></p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">MNDA Term</h2>
        <p>{mndaTerm}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">Term of Confidentiality</h2>
        <p>{confidentialityTerm}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">Governing Law &amp; Jurisdiction</h2>
        <p>Governing Law: <Field value={data.governingLaw} placeholder="State" /></p>
        <p>Jurisdiction: <Field value={data.jurisdiction} placeholder="City/county and state" /></p>
      </section>

      {data.modifications.trim() && (
        <section className="mb-5">
          <h2 className="text-sm font-bold border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-gray-500">MNDA Modifications</h2>
          <p className="whitespace-pre-wrap">{data.modifications}</p>
        </section>
      )}

      <section className="mb-8">
        <p className="text-xs text-gray-500 mb-3">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left w-36 bg-gray-50"></th>
              <th className="border border-gray-300 px-3 py-2 text-center bg-gray-50">Party 1</th>
              <th className="border border-gray-300 px-3 py-2 text-center bg-gray-50">Party 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-4 font-medium text-gray-600">Signature</td>
              <td className="border border-gray-300 px-3 py-4"></td>
              <td className="border border-gray-300 px-3 py-4"></td>
            </tr>
            {(
              [
                ["Print Name", data.party1.printName, data.party2.printName],
                ["Title", data.party1.title, data.party2.title],
                ["Company", data.party1.company, data.party2.company],
                ["Notice Address", data.party1.noticeAddress, data.party2.noticeAddress],
              ] as [string, string, string][]
            ).map(([label, v1, v2]) => (
              <tr key={label}>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-600">{label}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <Field value={v1} placeholder="—" />
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <Field value={v2} placeholder="—" />
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-gray-300 px-3 py-4 font-medium text-gray-600">Date</td>
              <td className="border border-gray-300 px-3 py-4"></td>
              <td className="border border-gray-300 px-3 py-4"></td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr className="border-gray-300 my-6" />

      <h2 className="text-base font-bold mb-4">Standard Terms</h2>

      <div className="space-y-3 text-xs leading-relaxed">
        <p>
          <strong>1. Introduction.</strong> This MNDA allows each party (&ldquo;Disclosing Party&rdquo;) to disclose
          information in connection with the <em><Field value={data.purpose} placeholder="[Purpose]" /></em>.
          Confidential Information includes technical or business information, product designs, pricing,
          security documentation, and know-how.
        </p>
        <p>
          <strong>2. Use and Protection.</strong> The Receiving Party shall use Confidential Information
          solely for the <em><Field value={data.purpose} placeholder="[Purpose]" /></em> and protect it
          with at least a reasonable standard of care.
        </p>
        <p>
          <strong>3. Exceptions.</strong> Obligations do not apply to information that is publicly available,
          was rightfully known prior to receipt, was obtained from a third party, or was independently developed.
        </p>
        <p>
          <strong>4. Disclosures Required by Law.</strong> Confidential Information may be disclosed to the
          extent required by law, with reasonable advance notice to the Disclosing Party.
        </p>
        <p>
          <strong>5. Term and Termination.</strong> This MNDA commences on{" "}
          <Field value={data.effectiveDate} placeholder="[Effective Date]" />. {mndaTerm} Confidentiality
          obligations survive for: {confidentialityTerm}
        </p>
        <p>
          <strong>6. Return or Destruction.</strong> Upon termination, the Receiving Party will cease using
          and destroy or return all Confidential Information.
        </p>
        <p>
          <strong>7. Proprietary Rights.</strong> The Disclosing Party retains all intellectual property
          rights. Disclosure grants no license.
        </p>
        <p>
          <strong>8. Disclaimer.</strong> ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTIES
          OF ANY KIND.
        </p>
        <p>
          <strong>9. Governing Law and Jurisdiction.</strong> This MNDA is governed by the laws of the State
          of <Field value={data.governingLaw} placeholder="[Governing Law]" />. Proceedings must be instituted
          in courts located in <Field value={data.jurisdiction} placeholder="[Jurisdiction]" />.
        </p>
        <p>
          <strong>10. Equitable Relief.</strong> A breach may cause irreparable harm. The Disclosing Party
          is entitled to seek equitable relief, including injunction.
        </p>
        <p>
          <strong>11. General.</strong> Neither party may assign this MNDA without prior written consent,
          except in connection with a merger or acquisition. This MNDA constitutes the entire agreement
          with respect to its subject matter.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        Common Paper Mutual Non-Disclosure Agreement{" "}
        <a href="https://commonpaper.com/standards/mutual-nda/1.0/" className="underline" target="_blank" rel="noreferrer">Version 1.0</a>
        {" "}free to use under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noreferrer">CC BY 4.0</a>.
      </p>
    </div>
  );
}
