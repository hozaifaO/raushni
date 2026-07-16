import { getApiBaseUrl } from "./baseUrl";
import type {
  SimpleRecord,
  SimpleRecordFormValues,
  SimpleRecordListResponse,
  SimpleRecordStatus,
} from "@/types/models/simpleRecord";
import { simpleRecordListResponseSchema, simpleRecordSchema } from "@/lib/validation/simpleRecord";
import { parseEmpty, parseJson } from "@/lib/validation/parseJson";

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

export async function listSimpleRecords(
  modulePath: string,
  options: ListOptions = {},
): Promise<SimpleRecordListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  const query = params.toString();
  const response = await fetch(`${endpoint(modulePath)}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(simpleRecordListResponseSchema, response, {
    fallbackMessage: "Unable to load records.",
  });
}

export async function createSimpleRecord(
  modulePath: string,
  values: SimpleRecordFormValues,
): Promise<SimpleRecord> {
  const response = await fetch(endpoint(modulePath), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(simpleRecordSchema, response, {
    fallbackMessage: "Unable to create record.",
  });
}

export async function updateSimpleRecord(
  modulePath: string,
  id: string,
  values: SimpleRecordFormValues,
): Promise<SimpleRecord> {
  const response = await fetch(`${endpoint(modulePath)}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(simpleRecordSchema, response, {
    fallbackMessage: "Unable to update record.",
  });
}

export async function deleteSimpleRecord(modulePath: string, id: string): Promise<void> {
  const response = await fetch(`${endpoint(modulePath)}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  await parseEmpty(response, { fallbackMessage: "Unable to delete record." });
}
