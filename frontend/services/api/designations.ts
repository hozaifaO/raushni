import { getApiBaseUrl } from "./baseUrl";
import type {
  Designation,
  DesignationFormValues,
  DesignationListResponse,
  DesignationStatus,
} from "@/types/models/designation";
import { designationListResponseSchema, designationSchema } from "@/lib/validation/designation";
import { parseEmpty, parseJson } from "@/lib/validation/parseJson";

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

export async function listDesignations(options: ListDesignationsOptions = {}): Promise<DesignationListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  if (options.department) params.set("department", options.department);
  const query = params.toString();
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(designationListResponseSchema, response, {
    fallbackMessage: "Designation request failed",
  });
}

export async function createDesignation(values: DesignationFormValues): Promise<Designation> {
  const response = await fetch(DESIGNATIONS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(designationSchema, response, {
    fallbackMessage: "Designation request failed",
  });
}

export async function updateDesignation(id: string, values: DesignationFormValues): Promise<Designation> {
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(designationSchema, response, {
    fallbackMessage: "Designation request failed",
  });
}

export async function deleteDesignation(id: string): Promise<void> {
  const response = await fetch(`${DESIGNATIONS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  await parseEmpty(response, { fallbackMessage: "Designation request failed" });
}
