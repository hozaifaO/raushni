import { authHeaders } from "@/lib/auth/permissions";
import type {
  Campaign,
  CampaignDonationFormValues,
  CampaignFormValues,
  CampaignListResponse,
  CampaignStatus,
} from "@/types/models/crowdfunding";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const CROWDFUNDING_ENDPOINT = `${API_BASE_URL}/api/v1/crowdfunding`;

type ListCampaignOptions = {
  search?: string;
  status?: CampaignStatus | "all";
  publicOnly?: boolean;
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

function campaignPayload(values: CampaignFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    category: values.category,
    status: values.status,
    target_amount: Number(values.target_amount),
    amount_raised: Number(values.amount_raised || 0),
    currency: values.currency.trim().toUpperCase() || "INR",
    start_date: values.start_date,
    end_date: values.end_date,
    location: values.location.trim(),
    beneficiary_count: Number(values.beneficiary_count || 0),
    cover_image_url: optionalText(values.cover_image_url),
    public_url: optionalText(values.public_url),
    cms_slug: optionalText(values.cms_slug),
    owner: values.owner.trim() || "Fundraising Team",
    highlights: lines(values.highlights),
    impact_metrics: lines(values.impact_metrics),
    notes: optionalText(values.notes),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Crowdfunding request failed";
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listCampaigns(options: ListCampaignOptions = {}): Promise<CampaignListResponse> {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.status && options.status !== "all") params.set("status_filter", options.status);
  if (options.publicOnly) params.set("public_only", "true");
  const query = params.toString();
  const response = await fetch(`${CROWDFUNDING_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<CampaignListResponse>(response);
}

export async function createCampaign(values: CampaignFormValues): Promise<Campaign> {
  const response = await fetch(CROWDFUNDING_ENDPOINT, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(campaignPayload(values)),
  });
  return parseResponse<Campaign>(response);
}

export async function updateCampaign(id: string, values: CampaignFormValues): Promise<Campaign> {
  const response = await fetch(`${CROWDFUNDING_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(campaignPayload(values)),
  });
  return parseResponse<Campaign>(response);
}

export async function setCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
  const response = await fetch(`${CROWDFUNDING_ENDPOINT}/${id}/status/${status}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseResponse<Campaign>(response);
}

export async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`${CROWDFUNDING_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse<void>(response);
}

export async function recordCampaignDonation(id: string, values: CampaignDonationFormValues): Promise<Campaign> {
  const response = await fetch(`${CROWDFUNDING_ENDPOINT}/${id}/donations`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      donor_name: values.donor_name.trim(),
      amount: Number(values.amount),
      payment_method: values.payment_method.trim(),
      receipt_no: optionalText(values.receipt_no),
      note: optionalText(values.note),
    }),
  });
  return parseResponse<Campaign>(response);
}
