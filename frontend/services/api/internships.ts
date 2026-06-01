import { authHeaders } from "@/lib/auth/permissions";
import { getApiBaseUrl } from "./baseUrl";
import type {
  InternshipAnnouncement,
  InternshipAnnouncementFormValues,
  InternshipApplication,
  InternshipApplicationFormValues,
  InternshipApplicationStatus,
  InternshipCertificate,
  InternshipListResponse,
} from "@/types/models/internship";

const API_BASE_URL = getApiBaseUrl();
const INTERNSHIPS_ENDPOINT = `${API_BASE_URL}/api/v1/internships`;

type ListInternshipsOptions = {
  search?: string;
  status?: InternshipApplicationStatus | "all";
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function listFromTextarea(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function cleanApplicationPayload(values: InternshipApplicationFormValues) {
  return {
    announcement_id: values.announcement_id,
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    city: values.city.trim(),
    college: values.college.trim(),
    course: values.course.trim(),
    track: values.track.trim(),
    github_url: optionalText(values.github_url),
    portfolio_url: optionalText(values.portfolio_url),
    motivation: values.motivation.trim(),
    status: values.status,
    completion_notes: optionalText(values.completion_notes),
  };
}

function cleanAnnouncementPayload(values: InternshipAnnouncementFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    description: values.description.trim(),
    start_date: values.start_date,
    end_date: values.end_date,
    registration_deadline: values.registration_deadline,
    event_date: values.event_date,
    event_time: values.event_time.trim(),
    location: values.location.trim(),
    mode: values.mode,
    status: values.status,
    poster_url: values.poster_url.trim() || "/assets/brand/internship-2026.jpg",
    apply_url: values.apply_url.trim() || "/internships",
    github_url: values.github_url.trim() || "https://github.com/owais4u/raushni",
    contact_phone: values.contact_phone.trim() || "+91 7827860062",
    benefits: listFromTextarea(values.benefits),
    tracks: listFromTextarea(values.tracks),
    eligibility: listFromTextarea(values.eligibility),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : "Internship request failed";
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listInternships(options: ListInternshipsOptions = {}): Promise<InternshipListResponse> {
  const params = new URLSearchParams();
  if (options.search) {
    params.set("search", options.search);
  }
  if (options.status && options.status !== "all") {
    params.set("status_filter", options.status);
  }

  const query = params.toString();
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<InternshipListResponse>(response);
}

export async function listPublicInternships(): Promise<InternshipAnnouncement[]> {
  const cmsResponse = await fetch("/cms/api/internship-announcements?filters[status][$eq]=published&populate=*", {
    cache: "no-store",
  }).catch(() => null);
  if (cmsResponse?.ok) {
    const payload = await cmsResponse.json().catch(() => null);
    const items = payload?.data;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => {
        const attributes = item.attributes ?? {};
        const poster = attributes.poster?.data?.attributes?.url ?? attributes.poster?.url ?? attributes.posterUrl;
        const posterUrl = poster?.startsWith("http") || poster?.startsWith("/assets")
          ? poster
          : `${process.env.NEXT_PUBLIC_CMS_URL ?? ""}${poster ?? ""}`;
        return {
          id: String(item.id),
          title: attributes.title,
          slug: attributes.slug,
          summary: attributes.summary,
          description: attributes.description,
          start_date: attributes.startDate,
          end_date: attributes.endDate,
          registration_deadline: attributes.registrationDeadline,
          event_date: attributes.eventDate,
          event_time: attributes.eventTime,
          location: attributes.location,
          mode: attributes.mode,
          status: attributes.status,
          poster_url: posterUrl || "/assets/brand/internship-2026.jpg",
          apply_url: attributes.applyUrl ?? "/internship-registration",
          github_url: attributes.githubUrl ?? "https://github.com/owais4u/raushni",
          contact_phone: attributes.contactPhone ?? "+91 7827860062",
          benefits: Array.isArray(attributes.benefits) ? attributes.benefits : [],
          tracks: Array.isArray(attributes.tracks) ? attributes.tracks : [],
          eligibility: Array.isArray(attributes.eligibility) ? attributes.eligibility : [],
          created_at: attributes.createdAt,
          updated_at: attributes.updatedAt,
        } satisfies InternshipAnnouncement;
      });
    }
  }
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/public`, { cache: "no-store" });
  return parseResponse<InternshipAnnouncement[]>(response);
}

export async function createInternshipAnnouncement(
  values: InternshipAnnouncementFormValues,
): Promise<InternshipAnnouncement> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/announcements`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanAnnouncementPayload(values)),
  });
  return parseResponse<InternshipAnnouncement>(response);
}

export async function updateInternshipApplication(
  id: string,
  values: Partial<InternshipApplicationFormValues>,
): Promise<InternshipApplication> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/applications/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  return parseResponse<InternshipApplication>(response);
}

export async function registerInternshipApplication(
  values: InternshipApplicationFormValues,
): Promise<InternshipApplication> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/applications/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...cleanApplicationPayload(values), status: "registered" }),
  });
  return parseResponse<InternshipApplication>(response);
}

export async function createInternshipApplication(
  values: InternshipApplicationFormValues,
): Promise<InternshipApplication> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/applications`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(cleanApplicationPayload(values)),
  });
  return parseResponse<InternshipApplication>(response);
}

export async function issueInternshipCertificate(
  applicationId: string,
  completionNotes = "",
): Promise<InternshipCertificate> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/applications/${applicationId}/certificate`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ completion_notes: completionNotes.trim() || null }),
  });
  return parseResponse<InternshipCertificate>(response);
}

export async function verifyInternshipCertificate(verificationCode: string): Promise<InternshipCertificate> {
  const response = await fetch(`${INTERNSHIPS_ENDPOINT}/certificates/${encodeURIComponent(verificationCode)}`, {
    cache: "no-store",
  });
  return parseResponse<InternshipCertificate>(response);
}
