import type { Member, MemberFormValues, MemberListResponse, MemberStatus } from "@/types/models/member";
import { memberListResponseSchema, memberSchema } from "@/lib/validation/member";
import { parseEmpty, parseJson } from "@/lib/validation/parseJson";
import { getApiBaseUrl } from "./baseUrl";

const API_BASE_URL = getApiBaseUrl();
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
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(memberListResponseSchema, response, {
    fallbackMessage: "Member request failed",
  });
}

export async function createMember(values: MemberFormValues): Promise<Member> {
  const response = await fetch(MEMBERS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(memberSchema, response, { fallbackMessage: "Member request failed" });
}

export async function updateMember(id: string, values: MemberFormValues): Promise<Member> {
  const response = await fetch(`${MEMBERS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(memberSchema, response, { fallbackMessage: "Member request failed" });
}

export async function deleteMember(id: string): Promise<void> {
  const response = await fetch(`${MEMBERS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  await parseEmpty(response, { fallbackMessage: "Member request failed" });
}
