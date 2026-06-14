const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PartyFieldsPartial {
  printName: string | null;
  title: string | null;
  company: string | null;
  noticeAddress: string | null;
}

export interface DocumentFieldsResponse {
  // Common
  effectiveDate: string | null;
  governingLaw: string | null;
  jurisdiction: string | null;
  party1: PartyFieldsPartial | null;
  party2: PartyFieldsPartial | null;
  // NDA
  purpose: string | null;
  mndaTermType: "expires" | "until-terminated" | null;
  mndaTermYears: number | null;
  confidentialityTermType: "years" | "perpetuity" | null;
  confidentialityTermYears: number | null;
  modifications: string | null;
  // CSA / commercial
  cloudServiceName: string | null;
  subscriptionPeriodMonths: number | null;
  fees: string | null;
  paymentProcess: string | null;
  termMonths: number | null;
  // SLA
  uptimePercentage: string | null;
  responseTimeCriticalHours: string | null;
  responseTimeHighHours: string | null;
  responseTimeMediumHours: string | null;
  serviceCreditPercentage: string | null;
  // PSA
  servicesDescription: string | null;
  deliverables: string | null;
  // DPA / BAA
  dataTypes: string | null;
  processingPurpose: string | null;
  phiTypes: string | null;
  // Software
  softwareName: string | null;
  licenseType: string | null;
  // Partnership
  partnershipPurpose: string | null;
  revenueSharePercent: string | null;
  // Pilot
  pilotScope: string | null;
  pilotDurationDays: number | null;
  successCriteria: string | null;
  // Design Partner
  programDescription: string | null;
  // AI Addendum
  aiServiceDescription: string | null;
  inputOutputOwnership: string | null;
}

// Backward-compat alias
export type NdaFieldsResponse = DocumentFieldsResponse;

export interface ChatResponse {
  message: string;
  doc_type: string | null;
  fields: DocumentFieldsResponse;
}

export interface DocumentResponse {
  id: number;
  doc_type: string;
  title: string;
  fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const api = {
  signup: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<UserResponse>("/api/auth/me"),

  chat: (messages: ChatMessage[], docType: string | null = null) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages, doc_type: docType }),
    }),

  listDocuments: () => request<DocumentResponse[]>("/api/documents"),

  saveDocument: (doc_type: string, fields: Record<string, unknown>) =>
    request<DocumentResponse>("/api/documents", {
      method: "POST",
      body: JSON.stringify({ doc_type, fields }),
    }),

  deleteDocument: (id: number) =>
    request<void>(`/api/documents/${id}`, { method: "DELETE" }),
};
