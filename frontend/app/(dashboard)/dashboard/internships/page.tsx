"use client";

import {
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import {
  createInternshipAnnouncement,
  createInternshipApplication,
  issueInternshipCertificate,
  listInternships,
  updateInternshipApplication,
} from "@/services/api/internships";
import type {
  InternshipAnnouncement,
  InternshipAnnouncementFormValues,
  InternshipApplication,
  InternshipApplicationFormValues,
  InternshipApplicationStatus,
  InternshipCertificate,
  InternshipListResponse,
} from "@/types/models/internship";

const emptyList: InternshipListResponse = {
  announcements: [],
  applications: [],
  certificates: [],
  total_announcements: 0,
  total_applications: 0,
  registered: 0,
  active: 0,
  completed: 0,
  certificates_issued: 0,
};

const emptyApplicationForm: InternshipApplicationFormValues = {
  announcement_id: "",
  full_name: "",
  email: "",
  phone: "",
  city: "",
  college: "",
  course: "",
  track: "Web Development",
  github_url: "",
  portfolio_url: "",
  motivation: "",
  status: "registered",
  completion_notes: "",
};

const emptyAnnouncementForm: InternshipAnnouncementFormValues = {
  title: "Internship 2026: AI Enabled Community Technology Program",
  slug: "internship-2026-ai-community-technology",
  summary:
    "A professional internship for practical exposure, final year project support, AI-enabled delivery experience, and career guidance.",
  description:
    "Raushni Educational & Social Welfare Trust invites students and early-career learners to work on real community technology workflows across web development, content operations, data, AI enablement, documentation, and outreach.",
  start_date: "2026-06-15",
  end_date: "2026-08-15",
  registration_deadline: "2026-06-14",
  event_date: "2026-06-15",
  event_time: "01:00 PM",
  location: "Web/Virtual, India",
  mode: "virtual",
  status: "published",
  poster_url: "/assets/brand/internship-2026.jpg",
  apply_url: "/internship-registration",
  github_url: "https://github.com/owais4u/raushni",
  contact_phone: "+91 7827860062",
  benefits: [
    "Real industry exposure",
    "Final year project work",
    "Hands-on experience and AI enabled delivery",
    "Career guidance",
    "Completion certificate with QR verification",
  ].join("\n"),
  tracks: ["Web Development", "AI Enabled Operations", "Content and Outreach", "Data and Reporting"].join("\n"),
  eligibility: [
    "Students, freshers, and early-career learners",
    "Basic computer and internet access",
    "Commitment to weekly progress and professional communication",
  ].join("\n"),
};

type FilterStatus = InternshipApplicationStatus | "all";

function statusClass(status: InternshipApplicationStatus) {
  const styles: Record<InternshipApplicationStatus, string> = {
    registered: "border-blue-200 bg-blue-50 text-blue-700",
    shortlisted: "border-violet-200 bg-violet-50 text-violet-700",
    active: "border-amber-200 bg-amber-50 text-amber-800",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };
  return styles[status];
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function applicationToForm(application: InternshipApplication): InternshipApplicationFormValues {
  return {
    announcement_id: application.announcement_id,
    full_name: application.full_name,
    email: application.email,
    phone: application.phone,
    city: application.city,
    college: application.college,
    course: application.course,
    track: application.track,
    github_url: application.github_url ?? "",
    portfolio_url: application.portfolio_url ?? "",
    motivation: application.motivation,
    status: application.status,
    completion_notes: application.completion_notes ?? "",
  };
}

export default function Page() {
  const [dashboard, setDashboard] = useState<InternshipListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);
  const [applicationForm, setApplicationForm] = useState<InternshipApplicationFormValues>(emptyApplicationForm);
  const [announcementForm, setAnnouncementForm] = useState<InternshipAnnouncementFormValues>(emptyAnnouncementForm);
  const [editingApplication, setEditingApplication] = useState<InternshipApplication | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [certificate, setCertificate] = useState<InternshipCertificate | null>(null);

  const loadInternships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listInternships({ search, status });
      setDashboard(response);
      const defaultAnnouncement = response.announcements[0];
      if (defaultAnnouncement && !applicationForm.announcement_id) {
        setApplicationForm((current) => ({
          ...current,
          announcement_id: defaultAnnouncement.id,
          track: defaultAnnouncement.tracks[0] ?? current.track,
        }));
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load internship workflow.");
    } finally {
      setLoading(false);
    }
  }, [applicationForm.announcement_id, search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadInternships();
  }, [loadInternships]);

  const stats = useMemo(
    () => [
      { label: "Announcements", value: dashboard.total_announcements, icon: CalendarDays },
      { label: "Registrations", value: dashboard.total_applications, icon: UserRoundCheck },
      { label: "Active interns", value: dashboard.active, icon: Briefcase },
      { label: "Certificates", value: dashboard.certificates_issued, icon: Award },
    ],
    [dashboard],
  );

  const selectedAnnouncement = dashboard.announcements.find((item) => item.id === applicationForm.announcement_id);

  const openNewApplication = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    const announcement = dashboard.announcements[0];
    setEditingApplication(null);
    setApplicationForm({
      ...emptyApplicationForm,
      announcement_id: announcement?.id ?? "",
      track: announcement?.tracks[0] ?? "Web Development",
    });
    setShowApplicationForm(true);
  };

  const openEditApplication = (application: InternshipApplication) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditingApplication(application);
    setApplicationForm(applicationToForm(application));
    setShowApplicationForm(true);
  };

  const submitApplication = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingApplication) {
        await updateInternshipApplication(editingApplication.id, applicationForm);
      } else {
        await createInternshipApplication(applicationForm);
      }
      setShowApplicationForm(false);
      setEditingApplication(null);
      await loadInternships();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save internship application.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnnouncement = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createInternshipAnnouncement(announcementForm);
      setShowAnnouncementForm(false);
      await loadInternships();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to publish internship announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const markStatus = async (application: InternshipApplication, nextStatus: InternshipApplicationStatus) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setError(null);
    try {
      await updateInternshipApplication(application.id, { status: nextStatus });
      await loadInternships();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update internship status.");
    }
  };

  const issueCertificate = async (application: InternshipApplication) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setError(null);
    try {
      const response = await issueInternshipCertificate(application.id, application.completion_notes ?? "");
      setCertificate(response);
      await loadInternships();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to issue certificate.");
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#120f0b] text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Dashboard module</p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">Internships Management</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
                Configure announcements, manage registrations, move interns through shortlisted and active
                workflows, issue completion certificates, and publish QR-code verification.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/internship-registration"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
                >
                  Public registration
                  <ExternalLink size={16} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm((value) => !value)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Plus size={16} aria-hidden="true" />
                  New announcement
                </button>
                <button
                  type="button"
                  onClick={openNewApplication}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <UserRoundCheck size={16} aria-hidden="true" />
                  Add registrant
                </button>
              </div>
            </div>
            <img
              src="/assets/brand/internship-2026.jpg"
              alt="Raushni Internship 2026 announcement"
              className="h-full min-h-64 w-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <Icon size={20} className="text-orange-600" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-950">{item.value}</p>
              </div>
            );
          })}
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

        {showAnnouncementForm && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">Internship announcement</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {[
                ["title", "Title"],
                ["slug", "Slug"],
                ["summary", "Summary"],
                ["description", "Description"],
                ["start_date", "Start date"],
                ["end_date", "End date"],
                ["registration_deadline", "Registration deadline"],
                ["event_date", "Event date"],
                ["event_time", "Event time"],
                ["location", "Location"],
                ["poster_url", "Poster URL"],
                ["github_url", "GitHub URL"],
                ["contact_phone", "Contact phone"],
              ].map(([field, label]) => (
                <label key={field} className={field === "description" || field === "summary" ? "lg:col-span-2" : ""}>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  {field === "description" || field === "summary" ? (
                    <textarea
                      value={String(announcementForm[field as keyof InternshipAnnouncementFormValues])}
                      onChange={(event) => setAnnouncementForm((current) => ({ ...current, [field]: event.target.value }))}
                      className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  ) : (
                    <input
                      type={field.includes("date") ? "date" : "text"}
                      value={String(announcementForm[field as keyof InternshipAnnouncementFormValues])}
                      onChange={(event) => setAnnouncementForm((current) => ({ ...current, [field]: event.target.value }))}
                      className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  )}
                </label>
              ))}
              {["benefits", "tracks", "eligibility"].map((field) => (
                <label key={field}>
                  <span className="text-sm font-semibold capitalize text-gray-700">{field}</span>
                  <textarea
                    value={announcementForm[field as keyof InternshipAnnouncementFormValues]}
                    onChange={(event) => setAnnouncementForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1 min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submitAnnouncement}
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                Publish announcement
              </button>
              <button
                type="button"
                onClick={() => setShowAnnouncementForm(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showApplicationForm && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-950">{editingApplication ? "Update registrant" : "Add registrant"}</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <label>
                <span className="text-sm font-semibold text-gray-700">Announcement</span>
                <select
                  value={applicationForm.announcement_id}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, announcement_id: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  {dashboard.announcements.map((announcement) => (
                    <option key={announcement.id} value={announcement.id}>{announcement.title}</option>
                  ))}
                </select>
              </label>
              {[
                ["full_name", "Full name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City"],
                ["college", "College"],
                ["course", "Course"],
                ["track", "Track"],
                ["github_url", "GitHub URL"],
                ["portfolio_url", "Portfolio URL"],
              ].map(([field, label]) => (
                <label key={field}>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <input
                    value={String(applicationForm[field as keyof InternshipApplicationFormValues])}
                    onChange={(event) => setApplicationForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              ))}
              <label>
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <select
                  value={applicationForm.status}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, status: event.target.value as InternshipApplicationStatus }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="registered">Registered</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="lg:col-span-3">
                <span className="text-sm font-semibold text-gray-700">Motivation</span>
                <textarea
                  value={applicationForm.motivation}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, motivation: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="lg:col-span-3">
                <span className="text-sm font-semibold text-gray-700">Completion notes</span>
                <textarea
                  value={applicationForm.completion_notes}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, completion_notes: event.target.value }))}
                  className="mt-1 min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={submitApplication}
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {editingApplication ? "Update registrant" : "Save registrant"}
              </button>
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Active announcement</h2>
                <p className="mt-1 text-sm text-gray-600">Content used by the public registration page.</p>
              </div>
              {selectedAnnouncement && (
                <Link href="/internship-registration" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
                  View public page
                </Link>
              )}
            </div>
            {selectedAnnouncement ? (
              <AnnouncementCard announcement={selectedAnnouncement} />
            ) : (
              <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No announcement configured yet.</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Search intern, email, phone, registration, or track"
                />
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as FilterStatus)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44"
              >
                <option value="all">All statuses</option>
                <option value="registered">Registered</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={() => void loadInternships()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw size={18} aria-hidden="true" />
                Refresh
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
              {loading ? (
                <p className="bg-gray-50 px-4 py-10 text-center text-sm font-semibold text-gray-600">Loading internship records</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {dashboard.applications.map((application) => (
                    <div key={application.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-950">{application.full_name}</h3>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusClass(application.status)}`}>
                            {application.status}
                          </span>
                          {application.certificate_id && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              Certificate issued
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{application.registration_number} · {application.track} · {application.email}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-700">{application.motivation}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button type="button" onClick={() => openEditApplication(application)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                        <button type="button" onClick={() => void markStatus(application, "active")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">Activate</button>
                        <button type="button" onClick={() => void issueCertificate(application)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                          <Award size={16} aria-hidden="true" />
                          Issue cert
                        </button>
                      </div>
                    </div>
                  ))}
                  {dashboard.applications.length === 0 && (
                    <p className="bg-gray-50 px-4 py-10 text-center text-sm font-semibold text-gray-600">No internship registrations found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {certificate && (
          <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-emerald-700">Certificate issued</p>
                <h2 className="mt-1 text-2xl font-black text-gray-950">{certificate.certificate_number}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {certificate.participant_name} · {certificate.program_title} · {certificate.track}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/certificates/verify/${certificate.verification_code}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white">
                    <QrCode size={16} aria-hidden="true" />
                    Verify certificate
                  </Link>
                  <a
                    href={`http://localhost:8000/api/v1/internships/certificates/${certificate.verification_code}/html`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700"
                  >
                    <FileText size={16} aria-hidden="true" />
                    Open HTML / print PDF
                  </a>
                </div>
              </div>
              <div
                className="h-36 w-36 rounded-lg border border-gray-200 bg-white p-2"
                dangerouslySetInnerHTML={{ __html: certificate.qr_code_svg }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AnnouncementCard({ announcement }: { announcement: InternshipAnnouncement }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
      <img src={announcement.poster_url} alt={announcement.title} className="max-h-80 w-full object-cover" />
      <div className="grid gap-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">Internship announcement</p>
          <h3 className="mt-2 text-xl font-black text-gray-950">{announcement.title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{announcement.summary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="Date" value={dateLabel(announcement.event_date)} />
          <Info label="Time" value={announcement.event_time} />
          <Info label="Location" value={announcement.location} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-950">What interns gain</p>
          <div className="mt-2 grid gap-2">
            {announcement.benefits.map((benefit) => (
              <p key={benefit} className="flex gap-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                {benefit}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-950">{value}</p>
    </div>
  );
}
