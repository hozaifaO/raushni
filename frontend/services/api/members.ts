import type { Member, MemberFormValues, MemberListResponse, MemberStatus } from "@/types/models/member";
import { authHeaders } from "@/lib/auth/permissions";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MEMBERS_ENDPOINT = `${API_BASE_URL}/api/v1/members`;

type ListMembersOptions = {
  search?: string;
  status?: MemberStatus | "all";
};

function cleanPayload(values: MemberFormValues) {
  return {
    full_name: values.full_name.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim(),
    role: values.role.trim(),
    status: values.status,
    joined_on: values.joined_on,
    address: values.address.trim() || null,
    emergency_contact: values.emergency_contact.trim() || null,
    notes: values.notes.trim() || null,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Member request failed";
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listMembers(options: ListMembersOptions = {}): Promise<MemberListResponse> {
  const params = new URLSearchParams();
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.status && options.status !== "all") {
    params.set("status_filter", options.status);
  }

  const query = params.toString();
  const response = await fetch(`${MEMBERS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<MemberListResponse>(response);
}

export async function createMember(values: MemberFormValues): Promise<Member> {
  const response = await fetch(MEMBERS_ENDPOINT, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Member>(response);
}

export async function updateMember(id: string, values: MemberFormValues): Promise<Member> {
  const response = await fetch(`${MEMBERS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Member>(response);
}

export async function deleteMember(id: string): Promise<void> {
  const response = await fetch(`${MEMBERS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response);
}
