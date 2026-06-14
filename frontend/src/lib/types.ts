export interface Party {
  printName: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export interface NdaFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "until-terminated";
  mndaTermYears: number;
  confidentialityTermType: "years" | "perpetuity";
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: Party;
  party2: Party;
}

// Generic document form data — keys map to any field from DocumentFieldsResponse
export type DocumentFormData = Record<string, string | number | Party | null>;
