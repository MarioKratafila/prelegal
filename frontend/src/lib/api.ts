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

interface PartyFieldsPartial {
  printName: string | null;
  title: string | null;
  company: string | null;
  noticeAddress: string | null;
}

export interface NdaFieldsResponse {
  purpose: string | null;
  effectiveDate: string | null;
  mndaTermType: "expires" | "until-terminated" | null;
  mndaTermYears: number | null;
  confidentialityTermType: "years" | "perpetuity" | null;
  confidentialityTermYears: number | null;
  governingLaw: string | null;
  jurisdiction: string | null;
  modifications: string | null;
  party1: PartyFieldsPartial | null;
  party2: PartyFieldsPartial | null;
}

export interface ChatResponse {
  message: string;
  fields: NdaFieldsResponse;
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

  chat: (messages: ChatMessage[]) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};
