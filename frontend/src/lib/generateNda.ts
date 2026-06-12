import { NdaFormData } from "./types";

export function generateNdaMarkdown(data: NdaFormData): string {
  const mndaTerm =
    data.mndaTermType === "expires"
      ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
      : `Continues until terminated in accordance with the terms of the MNDA.`;

  const confidentialityTerm =
    data.confidentialityTermType === "years"
      ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : `In perpetuity.`;

  const modificationsSection = data.modifications.trim()
    ? data.modifications.trim()
    : "_None_";

  return `# Mutual Non-Disclosure Agreement

## Cover Page

This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 identical to those posted at [commonpaper.com/standards/mutual-nda/1.0](https://commonpaper.com/standards/mutual-nda/1.0).

### Purpose
${data.purpose}

### Effective Date
${data.effectiveDate}

### MNDA Term
${mndaTerm}

### Term of Confidentiality
${confidentialityTerm}

### Governing Law & Jurisdiction
Governing Law: ${data.governingLaw}

Jurisdiction: ${data.jurisdiction}

### MNDA Modifications
${modificationsSection}

By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.

| | PARTY 1 | PARTY 2 |
|:---|:---:|:---:|
| Signature | | |
| Print Name | ${data.party1.printName} | ${data.party2.printName} |
| Title | ${data.party1.title} | ${data.party2.title} |
| Company | ${data.party1.company} | ${data.party2.company} |
| Notice Address | ${data.party1.noticeAddress} | ${data.party2.noticeAddress} |
| Date | | |

---

## Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (\"MNDA\") allows each party (\"Disclosing Party\") to disclose or make available information in connection with the ${data.purpose} which the Disclosing Party identifies to the receiving party (\"Receiving Party\") as \"confidential\" or \"proprietary\".

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the ${data.purpose}; (b) not disclose Confidential Information to third parties without prior written approval; and (c) protect Confidential Information with at least a reasonable standard of care.

3. **Exceptions**. Obligations do not apply to information that: (a) is or becomes publicly available; (b) was rightfully known prior to receipt; (c) was rightfully obtained from a third party; or (d) was independently developed.

4. **Disclosures Required by Law**. Confidential Information may be disclosed to the extent required by law, provided reasonable advance notice is given to the Disclosing Party.

5. **Term and Termination**. This MNDA commences on ${data.effectiveDate}. ${mndaTerm} Confidentiality obligations survive for: ${confidentialityTerm}

6. **Return or Destruction**. Upon termination, the Receiving Party will cease using and destroy or return all Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all intellectual property rights. Disclosure grants no license.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED \"AS IS\", WITHOUT WARRANTIES OF ANY KIND.

9. **Governing Law and Jurisdiction**. This MNDA is governed by the laws of the State of ${data.governingLaw}. Proceedings must be instituted in courts located in ${data.jurisdiction}.

10. **Equitable Relief**. A breach may cause irreparable harm. The Disclosing Party is entitled to seek equitable relief, including injunction.

11. **General**. Neither party may assign this MNDA without prior written consent, except in connection with a merger or acquisition. This MNDA constitutes the entire agreement with respect to its subject matter.

---

_Common Paper Mutual Non-Disclosure Agreement [Version 1.0](https://commonpaper.com/standards/mutual-nda/1.0/) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)._
`;
}
