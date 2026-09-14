const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "pdf_pipeline_access_token";

export type ApiUser = {
  id: number;
  email: string;
  username: string | null;
};

export type ApiDocument = {
  id: number;
  documentUrl: string;
  userId: number;
};

export type ApiTranslation = {
  id: number;
  documentId: number;
  srNo: string;
  documentNo: string;
  dateOfExecution: string;
  nature: string;
  volNo: string;
  considerationValue: string;
  marketValue: string;
  prNumber: string;
  propertyType: string;
  propertyExtent: string;
  documentRemarks: string;
  plotNo: string;
  surveyNo: string;
  boundaryDetail: string;
  scheduleRemarks: string;
  executants?: { id: number; name: string; translationId: number }[];
  claimants?: { id: number; name: string; translationId: number }[];
};

export type ApiDocumentWithTranslations = ApiDocument & {
  translations?: ApiTranslation[];
  downloadUrl?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const getAccessToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);

export const setAccessToken = (token: string) =>
  window.localStorage.setItem(TOKEN_KEY, token);

export const clearAccessToken = () => window.localStorage.removeItem(TOKEN_KEY);

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Request failed");
  }

  return result.data as T;
}

export const login = (email: string, password: string) =>
  apiFetch<{ user: ApiUser; accessToken: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, username: string, password: string) =>
  apiFetch<{ user: ApiUser; accessToken: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });

export const getDocuments = (filters: Record<string, string> = {}) => {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => Boolean(value)),
  );
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<ApiDocumentWithTranslations[]>(`/api/documents${suffix}`);
};

export const getDocument = (id: number) =>
  apiFetch<ApiDocumentWithTranslations>(`/api/documents/${id}`);

export const deleteDocument = (id: number) =>
  apiFetch<ApiDocument>(`/api/documents/${id}`, { method: "DELETE" });

export const processDocument = (id: number) =>
  apiFetch<{ document: ApiDocument; translations: ApiTranslation[] }>(
    `/api/documents/${id}/process`,
    { method: "POST" },
  );

export const uploadDocument = async (file: File) => {
  const signed = await apiFetch<{ uploadUrl: string; key: string }>(
    "/api/documents/signed-url",
    {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    },
  );

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadResponse.ok) throw new Error("Unable to upload file to storage");

  return apiFetch<ApiDocument>("/api/documents/upload", {
    method: "POST",
    body: JSON.stringify({ key: signed.key }),
  });
};
