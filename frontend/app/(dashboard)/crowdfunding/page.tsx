"use client";

import {
  CalendarDays,
  CheckCircle2,
  Eye,
  IndianRupee,
  Megaphone,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import {
  createCampaign,
  deleteCampaign,
  listCampaigns,
  recordCampaignDonation,
  setCampaignStatus,
  updateCampaign,
} from "@/services/api/crowdfunding";
import type {
  Campaign,
  CampaignCategory,
  CampaignDonationFormValues,
  CampaignFormValues,
  CampaignListResponse,
  CampaignStatus,
} from "@/types/models/crowdfunding";

type FilterStatus = CampaignStatus | "all";

const emptyList: CampaignListResponse = {
  items: [],
  total: 0,
  draft: 0,
  published: 0,
  funded: 0,
  total_target: 0,
  total_raised: 0,
  overall_progress_percent: 0,
};

const emptyCampaignForm: CampaignFormValues = {
  title: "Project Sparsh School WATSAN Fund",
  slug: "project-sparsh-school-watsan-fund",
  summary:
    "Raise funds for safe drinking water, gender-segregated sanitation, handwashing stations, and hygiene education across marginalized schools in Muzaffarpur.",
  category: "watsan",
  status: "draft",
  target_amount: "4811136",
  amount_raised: "0",
  currency: "INR",
  start_date: "2026-05-15",
  end_date: "2026-09-30",
  location: "Muzaffarpur District, Bihar",
  beneficiary_count: "2500",
  cover_image_url: "/assets/images/og-image.jpg",
  public_url: "/donate?campaign=project-sparsh-school-watsan-fund",
  cms_slug: "project-sparsh-school-watsan-fund",
  owner: "Programs and Fundraising",
  highlights:
    "10 schools targeted for RO drinking water and sanitation infrastructure.\nMHM, hygiene, and teacher sensitization sessions included.\nCommunity ownership and maintenance plan built into the campaign.",
  impact_metrics: "2500 students reached\n10 school WATSAN sites\n12-month implementation window",
  notes: "Campaign content should be mirrored in CMS before publishing.",
};

const emptyDonationForm: CampaignDonationFormValues = {
  donor_name: "",
  amount: "",
  payment_method: "upi",
  receipt_no: "",
  note: "",
};

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function campaignToForm(campaign: Campaign): CampaignFormValues {
  return {
    title: campaign.title,
    slug: campaign.slug,
    summary: campaign.summary,
    category: campaign.category,
    status: campaign.status,
    target_amount: String(campaign.target_amount),
    amount_raised: String(campaign.amount_raised),
    currency: campaign.currency,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    location: campaign.location,
    beneficiary_count: String(campaign.beneficiary_count),
    cover_image_url: campaign.cover_image_url ?? "",
    public_url: campaign.public_url ?? "",
    cms_slug: campaign.cms_slug ?? "",
    owner: campaign.owner,
    highlights: campaign.highlights.join("\n"),
    impact_metrics: campaign.impact_metrics.join("\n"),
    notes: campaign.notes ?? "",
  };
}

export default function Page() {
  const [campaigns, setCampaigns] = useState<CampaignListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [form, setForm] = useState<CampaignFormValues>(emptyCampaignForm);
  const [donationForm, setDonationForm] = useState<CampaignDonationFormValues>(emptyDonationForm);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [donationCampaign, setDonationCampaign] = useState<Campaign | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await listCampaigns({ search, status }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load crowdfunding campaigns.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadCampaigns();
  }, [loadCampaigns]);

  const stats = useMemo(
    () => [
      { label: "Campaigns", value: campaigns.total, icon: Megaphone },
      { label: "Published", value: campaigns.published, icon: Eye },
      { label: "Raised", value: money(campaigns.total_raised), icon: IndianRupee },
      { label: "Overall progress", value: `${campaigns.overall_progress_percent}%`, icon: Target },
    ],
    [campaigns],
  );

  const updateField = <K extends keyof CampaignFormValues>(field: K, value: CampaignFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateDonationField = <K extends keyof CampaignDonationFormValues>(
    field: K,
    value: CampaignDonationFormValues[K],
  ) => {
    setDonationForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(null);
    setForm(emptyCampaignForm);
    setIsFormOpen(true);
  };

  const openEdit = (campaign: Campaign) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(campaign);
    setForm(campaignToForm(campaign));
    setIsFormOpen(true);
  };

  const submitCampaign = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await updateCampaign(editing.id, form);
      } else {
        await createCampaign(form);
      }
      setIsFormOpen(false);
      setEditing(null);
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (campaign: Campaign, nextStatus: CampaignStatus) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    await setCampaignStatus(campaign.id, nextStatus);
    await loadCampaigns();
  };

  const removeCampaign = async (campaign: Campaign) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    if (!window.confirm(`Delete campaign ${campaign.title}?`)) return;
    await deleteCampaign(campaign.id);
    await loadCampaigns();
  };

  const submitDonation = async () => {
    if (!donationCampaign) return;
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await recordCampaignDonation(donationCampaign.id, donationForm);
      setDonationCampaign(null);
      setDonationForm(emptyDonationForm);
      await loadCampaigns();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to record campaign donation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Campaign management</p>
              <h1 className="mt-2 text-3xl font-black text-gray-950">Crowdfunding</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Create campaigns, manage publish state, record donor progress, and keep targets aligned with CMS-ready
                public donation content.
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
              >
                <Plus size={18} aria-hidden="true" />
                Create campaign
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Stat key={item.label} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Search campaign, location, category"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as FilterStatus)}
              className="min-h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="paused">Paused</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="button"
              onClick={() => void loadCampaigns()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {isFormOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-gray-950">{editing ? "Edit campaign" : "Create campaign"}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} wide />
              <Field label="Slug" value={form.slug} onChange={(value) => updateField("slug", value)} />
              <SelectField label="Category" value={form.category} onChange={(value) => updateField("category", value as CampaignCategory)} options={["education", "health", "watsan", "relief", "livelihood", "other"]} />
              <SelectField label="Status" value={form.status} onChange={(value) => updateField("status", value as CampaignStatus)} options={["draft", "review", "published", "paused", "funded", "closed"]} />
              <Field label="Target amount" value={form.target_amount} onChange={(value) => updateField("target_amount", value)} type="number" />
              <Field label="Amount raised" value={form.amount_raised} onChange={(value) => updateField("amount_raised", value)} type="number" />
              <Field label="Start date" value={form.start_date} onChange={(value) => updateField("start_date", value)} type="date" />
              <Field label="End date" value={form.end_date} onChange={(value) => updateField("end_date", value)} type="date" />
              <Field label="Location" value={form.location} onChange={(value) => updateField("location", value)} />
              <Field label="Beneficiaries" value={form.beneficiary_count} onChange={(value) => updateField("beneficiary_count", value)} type="number" />
              <Field label="Public donation URL" value={form.public_url} onChange={(value) => updateField("public_url", value)} />
              <Field label="CMS slug" value={form.cms_slug} onChange={(value) => updateField("cms_slug", value)} />
              <TextArea label="Summary" value={form.summary} onChange={(value) => updateField("summary", value)} wide />
              <TextArea label="Highlights (one per line)" value={form.highlights} onChange={(value) => updateField("highlights", value)} />
              <TextArea label="Impact metrics (one per line)" value={form.impact_metrics} onChange={(value) => updateField("impact_metrics", value)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => void submitCampaign()} disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {submitting ? "Saving..." : "Save campaign"}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {donationCampaign && (
          <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-gray-950">Record donation</h2>
            <p className="mt-1 text-sm text-gray-600">{donationCampaign.title}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Donor name" value={donationForm.donor_name} onChange={(value) => updateDonationField("donor_name", value)} />
              <Field label="Amount" value={donationForm.amount} onChange={(value) => updateDonationField("amount", value)} type="number" />
              <SelectField label="Payment method" value={donationForm.payment_method} onChange={(value) => updateDonationField("payment_method", value)} options={["upi", "gpay", "cash", "cheque", "debit_card", "credit_card", "netbanking", "stripe", "other"]} />
              <Field label="Receipt no" value={donationForm.receipt_no} onChange={(value) => updateDonationField("receipt_no", value)} />
              <TextArea label="Note" value={donationForm.note} onChange={(value) => updateDonationField("note", value)} wide />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => void submitDonation()} disabled={submitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {submitting ? "Recording..." : "Record donation"}
              </button>
              <button type="button" onClick={() => setDonationCampaign(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm font-semibold text-gray-600">Loading campaigns</div>
          ) : campaigns.items.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm font-semibold text-gray-600">No campaigns found</div>
          ) : (
            campaigns.items.map((campaign) => (
              <article key={campaign.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-gray-950">{campaign.title}</h2>
                      <StatusBadge status={campaign.status} />
                      <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-bold capitalize text-gray-600">{campaign.category}</span>
                    </div>
                    <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">{campaign.summary}</p>
                    <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-4">
                      <Info icon={IndianRupee} label="Raised" value={`${money(campaign.amount_raised, campaign.currency)} / ${money(campaign.target_amount, campaign.currency)}`} />
                      <Info icon={Target} label="Progress" value={`${campaign.progress_percent}%`} />
                      <Info icon={Users} label="Beneficiaries" value={campaign.beneficiary_count.toLocaleString("en-IN")} />
                      <Info icon={CalendarDays} label="Ends" value={campaign.end_date} />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${campaign.progress_percent}%` }} />
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      {campaign.highlights.slice(0, 3).map((highlight) => (
                        <p key={highlight} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{highlight}</p>
                      ))}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
                      <button type="button" onClick={() => setDonationCampaign(campaign)} className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700">
                        Record donation
                      </button>
                      <button type="button" onClick={() => openEdit(campaign)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                        Edit
                      </button>
                      {campaign.status !== "published" && (
                        <button type="button" onClick={() => void changeStatus(campaign, "published")} className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-700">
                          <CheckCircle2 size={16} aria-hidden="true" />
                          Publish
                        </button>
                      )}
                      {campaign.status === "published" && (
                        <button type="button" onClick={() => void changeStatus(campaign, "paused")} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700">
                          <PauseCircle size={16} aria-hidden="true" />
                          Pause
                        </button>
                      )}
                      <button type="button" onClick={() => void removeCampaign(campaign)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                        <Trash2 size={16} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Icon size={20} className="text-orange-600" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
      <div>
        <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
        <p className="mt-0.5 font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const tone =
    status === "published" || status === "funded"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "paused" || status === "review"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-gray-200 bg-gray-50 text-gray-700";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>{status.replace("_", " ")}</span>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3">
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </label>
  );
}
