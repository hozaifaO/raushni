import { authHeaders } from "@/lib/auth/permissions";
import { getApiBaseUrl } from "./baseUrl";
import type { SimpleRecord, SimpleRecordFormValues, SimpleRecordListResponse, SimpleRecordStatus } from "@/types/models/simpleRecord";

const API_BASE_URL = getApiBaseUrl();

type ListOptions = {
  search?: string;
  status?: SimpleRecordStatus | "all";
};

function endpoint(modulePath: string) {
  return `${API_BASE_URL}/api/v1/${modulePath}`;
}

function cleanPayload(values: SimpleRecordFormValues) {
  return {
    title: values.title.trim(),
    category: values.category.trim() || "general",
    summary: values.summary.trim(),
    status: values.status,
    record_date: values.record_date,
    contact_name: values.contact_name.trim() || null,
    contact_email: values.contact_email.trim() || null,
    amount: values.amount.trim() ? Number(values.amount) : null,
    location: values.location.trim() || null,
    notes: values.notes.trim() || null,
  };
}

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : fallback;
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listSimpleRecords(modulePath: string, options: ListOptions = {}): Promise<SimpleRecordListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  const query = params.toString();
  const response = await fetch(`${endpoint(modulePath)}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<SimpleRecordListResponse>(response, "Unable to load records.");
}

export async function createSimpleRecord(modulePath: string, values: SimpleRecordFormValues): Promise<SimpleRecord> {
  const response = await fetch(endpoint(modulePath), {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<SimpleRecord>(response, "Unable to create record.");
}

export async function updateSimpleRecord(modulePath: string, id: string, values: SimpleRecordFormValues): Promise<SimpleRecord> {
  const response = await fetch(`${endpoint(modulePath)}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<SimpleRecord>(response, "Unable to update record.");
}

export async function deleteSimpleRecord(modulePath: string, id: string): Promise<void> {
  const response = await fetch(`${endpoint(modulePath)}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response, "Unable to delete record.");
}
