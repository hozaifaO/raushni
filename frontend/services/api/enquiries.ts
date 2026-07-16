/**
 * Prefer `listSimpleRecords("enquiries", …)` from `./simpleRecords` for staff CRUD.
 * Public contact uses `registerPublicEnquiry`.
 */
import { getApiBaseUrl } from "./baseUrl";
import {
  createSimpleRecord,
  deleteSimpleRecord,
  listSimpleRecords,
  updateSimpleRecord,
} from "./simpleRecords";
import type { SimpleRecord, SimpleRecordFormValues, SimpleRecordStatus } from "@/types/models/simpleRecord";
import { simpleRecordSchema } from "@/lib/validation/simpleRecord";
import { parseJson } from "@/lib/validation/parseJson";

type ListOptions = {
  search?: string;
  status?: SimpleRecordStatus | "all";
};

export type PublicEnquiryPayload = {
  contact_name: string;
  contact_email: string;
  phone?: string | null;
  category?: string;
  summary: string;
};

const MODULE = "enquiries";
const ENQUIRIES_ENDPOINT = `${getApiBaseUrl()}/api/v1/enquiries`;

export function listEnquiries(options: ListOptions = {}) {
  return listSimpleRecords(MODULE, options);
}

export function createEnquiry(values: SimpleRecordFormValues) {
  return createSimpleRecord(MODULE, values);
}

export function updateEnquiry(id: string, values: SimpleRecordFormValues) {
  return updateSimpleRecord(MODULE, id, values);
}

export function deleteEnquiry(id: string) {
  return deleteSimpleRecord(MODULE, id);
}

export async function registerPublicEnquiry(payload: PublicEnquiryPayload): Promise<SimpleRecord> {
  const response = await fetch(`${ENQUIRIES_ENDPOINT}/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact_name: payload.contact_name,
      contact_email: payload.contact_email,
      phone: payload.phone?.trim() || null,
      category: payload.category?.trim() || "general",
      summary: payload.summary,
    }),
  });
  return parseJson(simpleRecordSchema, response, {
    fallbackMessage: "Unable to send enquiry.",
  });
}
