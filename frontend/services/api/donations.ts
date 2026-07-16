import type {
  Donation,
  DonationCheckoutSession,
  DonationFormValues,
  DonationListResponse,
  DonationPaymentMethod,
  DonationPaymentStatus,
  DonationReceipt,
  DonationStatusEvent,
} from "@/types/models/donation";
import {
  donationCheckoutSessionSchema,
  donationListResponseSchema,
  donationReceiptSchema,
  donationSchema,
  donationStatusEventSchema,
} from "@/lib/validation/donation";
import { parseEmpty, parseJson } from "@/lib/validation/parseJson";
import { z } from "zod";
import { getApiBaseUrl } from "./baseUrl";

const API_BASE_URL = getApiBaseUrl();
const DONATIONS_ENDPOINT = `${API_BASE_URL}/api/v1/donations`;

const UTR_REQUIRED_METHODS = new Set<DonationPaymentMethod>(["upi", "qr_code", "gpay", "cheque"]);

type ListDonationsOptions = {
  search?: string;
  status?: DonationPaymentStatus | "all";
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function paymentMethodRequiresUtr(method: DonationPaymentMethod): boolean {
  return UTR_REQUIRED_METHODS.has(method);
}

function cleanPayload(values: DonationFormValues) {
  const isAnonymous = Boolean(values.is_anonymous);
  return {
    donor_name: values.donor_name.trim(),
    donor_email: optionalText(values.donor_email),
    donor_phone: optionalText(values.donor_phone),
    donor_address: optionalText(values.donor_address),
    donor_pan: optionalText(values.donor_pan),
    donor_type: values.donor_type.trim() || "individual",
    is_anonymous: isAnonymous,
    amount: Number(values.amount),
    currency: values.currency.trim().toUpperCase() || "INR",
    purpose: values.purpose,
    payment_method: values.payment_method,
    payment_status: values.payment_status,
    transaction_reference: optionalText(values.transaction_reference),
    donation_date: values.donation_date,
    notes: optionalText(values.notes),
  };
}

export async function listDonations(options: ListDonationsOptions = {}): Promise<DonationListResponse> {
  const params = new URLSearchParams();
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.status && options.status !== "all") {
    params.set("status_filter", options.status);
  }

  const query = params.toString();
  const response = await fetch(`${DONATIONS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(donationListResponseSchema, response, {
    fallbackMessage: "Donation request failed",
  });
}

export async function createDonation(values: DonationFormValues): Promise<Donation> {
  const response = await fetch(DONATIONS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(donationSchema, response, { fallbackMessage: "Donation request failed" });
}

export async function registerPublicDonation(values: DonationFormValues): Promise<Donation> {
  const { payment_status: _paymentStatus, ...publicPayload } = cleanPayload(values);
  const response = await fetch(`${DONATIONS_ENDPOINT}/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(publicPayload),
  });
  return parseJson(donationSchema, response, { fallbackMessage: "Donation request failed" });
}

export async function createDonationCheckout(id: string): Promise<DonationCheckoutSession> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(donationCheckoutSessionSchema, response, {
    fallbackMessage: "Donation request failed",
  });
}

export async function updateDonation(id: string, values: DonationFormValues): Promise<Donation> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseJson(donationSchema, response, { fallbackMessage: "Donation request failed" });
}

export async function markDonationPaid(
  id: string,
  transactionReference?: string | null,
): Promise<Donation> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/mark-paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_reference: transactionReference?.trim() ? transactionReference.trim() : null,
    }),
  });
  return parseJson(donationSchema, response, { fallbackMessage: "Donation request failed" });
}

export async function listDonationEvents(id: string): Promise<DonationStatusEvent[]> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/events`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(z.array(donationStatusEventSchema), response, {
    fallbackMessage: "Donation request failed",
  });
}

export async function issueDonationReceipt(id: string): Promise<DonationReceipt> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return parseJson(donationReceiptSchema, response, {
    fallbackMessage: "Donation request failed",
  });
}

export async function deleteDonation(id: string): Promise<void> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  await parseEmpty(response, { fallbackMessage: "Donation request failed" });
}
