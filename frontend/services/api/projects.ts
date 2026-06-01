import { authHeaders } from "@/lib/auth/permissions";
import { getApiBaseUrl } from "./baseUrl";
import type { Project, ProjectFormValues, ProjectListResponse, ProjectStatus } from "@/types/models/project";

const API_BASE_URL = getApiBaseUrl();
const PROJECTS_ENDPOINT = `${API_BASE_URL}/api/v1/projects`;

type ListProjectsOptions = {
  search?: string;
  status?: ProjectStatus | "all";
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

function cleanPayload(values: ProjectFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    location: values.location.trim(),
    focus_area: values.focus_area.trim() || "Education and WATSAN",
    status: values.status,
    priority: values.priority,
    start_date: values.start_date,
    end_date: values.end_date,
    budget: Number(values.budget),
    currency: values.currency.trim().toUpperCase() || "INR",
    beneficiaries: Number(values.beneficiaries || 0),
    schools_targeted: Number(values.schools_targeted || 0),
    progress: Number(values.progress || 0),
    manager: values.manager.trim() || "Project Manager",
    donor: optionalText(values.donor),
    proposal_url: optionalText(values.proposal_url),
    cms_slug: optionalText(values.cms_slug),
    objectives: lines(values.objectives),
    milestones: lines(values.milestones),
    risks: lines(values.risks),
    notes: optionalText(values.notes),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Project request failed";
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listProjects(options: ListProjectsOptions = {}): Promise<ProjectListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  const query = params.toString();
  const response = await fetch(`${PROJECTS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<ProjectListResponse>(response);
}

export async function createProject(values: ProjectFormValues): Promise<Project> {
  const response = await fetch(PROJECTS_ENDPOINT, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Project>(response);
}

export async function updateProject(id: string, values: ProjectFormValues): Promise<Project> {
  const response = await fetch(`${PROJECTS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Project>(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${PROJECTS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response);
}
