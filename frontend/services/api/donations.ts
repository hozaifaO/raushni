import { authHeaders } from "@/lib/auth/permissions";
import { getApiBaseUrl } from "./baseUrl";
import type {
  Donation,
  DonationCheckoutSession,
  DonationFormValues,
  DonationListResponse,
  DonationPaymentStatus,
  DonationReceipt,
} from "@/types/models/donation";

const API_BASE_URL = getApiBaseUrl();
const DONATIONS_ENDPOINT = `${API_BASE_URL}/api/v1/donations`;

type ListDonationsOptions = {
  search?: string;
  status?: DonationPaymentStatus | "all";
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanPayload(values: DonationFormValues) {
  return {
    donor_name: values.donor_name.trim(),
    donor_email: optionalText(values.donor_email),
    donor_phone: values.donor_phone.trim(),
    donor_address: optionalText(values.donor_address),
    donor_pan: optionalText(values.donor_pan),
    donor_type: values.donor_type.trim() || "individual",
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

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Donation request failed";
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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
    headers: authHeaders(),
  });
  return parseResponse<DonationListResponse>(response);
}

export async function createDonation(values: DonationFormValues): Promise<Donation> {
  const response = await fetch(DONATIONS_ENDPOINT, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Donation>(response);
}

export async function registerPublicDonation(values: DonationFormValues): Promise<Donation> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...cleanPayload(values), payment_status: "pending" }),
  });
  return parseResponse<Donation>(response);
}

export async function createDonationCheckout(id: string): Promise<DonationCheckoutSession> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return parseResponse<DonationCheckoutSession>(response);
}

export async function updateDonation(id: string, values: DonationFormValues): Promise<Donation> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanPayload(values)),
  });
  return parseResponse<Donation>(response);
}

export async function issueDonationReceipt(id: string): Promise<DonationReceipt> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}/receipt`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseResponse<DonationReceipt>(response);
}

export async function deleteDonation(id: string): Promise<void> {
  const response = await fetch(`${DONATIONS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response);
}
