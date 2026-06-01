import { authHeaders } from "@/lib/auth/permissions";
import { getApiBaseUrl } from "./baseUrl";
import type {
  Designation,
  DesignationFormValues,
  DesignationListResponse,
  DesignationStatus,
} from "@/types/models/designation";

const API_BASE_URL = getApiBaseUrl();
const DESIGNATIONS_ENDPOINT = `${API_BASE_URL}/api/v1/designations`;

type ListDesignationsOptions = {
  search?: string;
  status?: DesignationStatus | "all";
  department?: string;
};

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanPayload(values: DesignationFormValues) {
  return {
    title: values.title.trim(),
    code: values.code.trim().toUpperCase(),
    department: values.department.trim(),
    level: values.level,
    status: values.status,
    reports_to: optionalText(values.reports_to),
    description: values.description.trim(),
    assignment_scope: values.assignment_scope.trim(),
    responsibilities: lines(values.responsibilities),
    required_documents: lines(values.required_documents),
    staff_assigned: Number(values.staff_assigned || 0),
    volunteer_slots: Number(values.volunteer_slots || 0),
    sort_order: Number(values.sort_order || 0),
    cms_slug: optionalText(values.cms_slug),
    notes: optionalText(values.notes),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Designation request failed";
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listDesignations(options: ListDesignationsOptions = {}): Promise<DesignationListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  if (options.department) params.set("department", options.department);
  const query = params.toString();
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<DesignationListResponse>(response);
}

export async function createDesignation(values: DesignationFormValues): Promise<Designation> {
  const response = await fetch(DESIGNATIONS_ENDPOINT, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Designation>(response);
}

export async function updateDesignation(id: string, values: DesignationFormValues): Promise<Designation> {
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Designation>(response);
}

export async function deleteDesignation(id: string): Promise<void> {
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response);
}
