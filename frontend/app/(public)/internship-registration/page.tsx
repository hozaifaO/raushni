"use client";

import { CheckCircle2, Github, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackPages, type CmsPublicPage } from "@/lib/cms/publicContent";
import {
  listPublicInternships,
  registerInternshipApplication,
} from "@/services/api/internships";
import type {
  InternshipAnnouncement,
  InternshipApplication,
  InternshipApplicationFormValues,
} from "@/types/models/internship";

const emptyForm: InternshipApplicationFormValues = {
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

const defaultCmsPage = fallbackPages["internship-registration"];

function resolvePublicMediaUrl(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (value.startsWith("http") || value.startsWith("/assets")) return value;
  return `${process.env.NEXT_PUBLIC_CMS_URL ?? ""}${value}`;
}

function normalizeCmsPage(payload: unknown): CmsPublicPage {
  const attrs = (payload as { data?: Array<{ attributes?: Partial<CmsPublicPage> & { heroImageUrl?: string; heroImage?: { data?: { attributes?: { url?: string } }; url?: string } } }> })?.data?.[0]?.attributes;
  if (!attrs) return defaultCmsPage;
  const heroImageUrl = attrs.heroImage?.data?.attributes?.url ?? attrs.heroImage?.url ?? attrs.heroImageUrl;
  return {
    ...defaultCmsPage,
    slug: attrs.slug ?? defaultCmsPage.slug,
    title: attrs.title ?? defaultCmsPage.title,
    heroEyebrow: attrs.heroEyebrow ?? defaultCmsPage.heroEyebrow,
    heroTitle: attrs.heroTitle ?? defaultCmsPage.heroTitle,
    heroText: attrs.heroText ?? defaultCmsPage.heroText,
    heroImage: resolvePublicMediaUrl(heroImageUrl, defaultCmsPage.heroImage),
    sections: Array.isArray(attrs.sections) ? attrs.sections : defaultCmsPage.sections,
  };
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(value));
}

export default function Page() {
  const [cmsPage, setCmsPage] = useState<CmsPublicPage>(defaultCmsPage);
  const [announcements, setAnnouncements] = useState<InternshipAnnouncement[]>([]);
  const [form, setForm] = useState<InternshipApplicationFormValues>(emptyForm);
  const [created, setCreated] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await listPublicInternships();
        setAnnouncements(response);
        const active = response[0];
        if (active) {
          setForm((current) => ({
            ...current,
            announcement_id: active.id,
            track: active.tracks[0] ?? current.track,
          }));
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load internship announcement.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCmsPage() {
      try {
        const response = await fetch("/cms/api/public-pages?filters[slug][$eq]=internship-registration&populate=*", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        setCmsPage(normalizeCmsPage(await response.json()));
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.warn("Unable to load internship registration content from CMS", requestError);
        }
      }
    }
    void loadCmsPage();
    return () => controller.abort();
  }, []);

  const announcement = announcements.find((item) => item.id === form.announcement_id) ?? announcements[0];
  const registrationSection = cmsPage.sections[0];

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await registerInternshipApplication(form);
      setCreated(response);
      setForm({
        ...emptyForm,
        announcement_id: announcement?.id ?? "",
        track: announcement?.tracks[0] ?? "Web Development",
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit internship registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#f7f7f7]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-sm font-semibold text-stone-600">Loading internship announcement</div>
          ) : announcement ? (
            <>
              <img src={announcement.poster_url} alt={announcement.title} className="w-full object-cover" />
              <div className="p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Internship 2026</p>
                <h1 className="mt-3 text-3xl font-black text-stone-950">{announcement.title}</h1>
                <p className="mt-3 text-sm leading-7 text-stone-700">{announcement.description}</p>

                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label="Date" value={dateLabel(announcement.event_date)} />
                  <Info label="Time" value={announcement.event_time} />
                  <Info label="Location" value={announcement.location} />
                </div>

                <div className="mt-6">
                  <p className="font-bold text-stone-950">What you will gain</p>
                  <div className="mt-3 grid gap-2">
                    {announcement.benefits.map((benefit) => (
                      <p key={benefit} className="flex gap-2 text-sm text-stone-700">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                        {benefit}
                      </p>
                    ))}
                  </div>
                </div>

                <a
                  href={announcement.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-stone-950 underline decoration-amber-500 decoration-2 underline-offset-4"
                >
                  <Github size={16} aria-hidden="true" />
                  Project GitHub
                </a>
              </div>
            </>
          ) : (
            <div className="p-8 text-sm font-semibold text-stone-600">No internship announcement is currently published.</div>
          )}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">{registrationSection?.eyebrow ?? cmsPage.heroEyebrow}</p>
              <h2 className="mt-1 text-2xl font-black text-stone-950">{registrationSection?.title ?? cmsPage.heroTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{registrationSection?.text ?? cmsPage.heroText}</p>
            </div>
          </div>

          {created && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-bold">Registration submitted successfully.</p>
              <p className="mt-1">Reference: {created.registration_number}. Current status: registered.</p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-800">Internship announcement</span>
              <select
                value={form.announcement_id}
                onChange={(event) => setForm((current) => ({ ...current, announcement_id: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              >
                {announcements.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </label>
            {[
              ["full_name", "Full name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["city", "City"],
              ["college", "College / institution"],
              ["course", "Course / degree"],
              ["github_url", "GitHub URL"],
              ["portfolio_url", "Portfolio URL"],
            ].map(([field, label]) => (
              <label key={field}>
                <span className="text-sm font-semibold text-stone-800">{label}</span>
                <input
                  value={String(form[field as keyof InternshipApplicationFormValues])}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                />
              </label>
            ))}
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-800">Preferred track</span>
              <select
                value={form.track}
                onChange={(event) => setForm((current) => ({ ...current, track: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              >
                {(announcement?.tracks ?? ["Web Development"]).map((track) => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-800">Why do you want to join?</span>
              <textarea
                value={form.motivation}
                onChange={(event) => setForm((current) => ({ ...current, motivation: event.target.value }))}
                className="mt-1 min-h-32 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || !announcement}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-bold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            {submitting ? "Submitting..." : "Submit registration"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-bold uppercase text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-black text-stone-950">{value}</p>
    </div>
  );
}
