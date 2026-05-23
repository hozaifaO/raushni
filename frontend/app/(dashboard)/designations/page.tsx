"use client";

import {
  BadgeCheck,
  Briefcase,
  ClipboardList,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import {
  createDesignation,
  deleteDesignation,
  listDesignations,
  updateDesignation,
} from "@/services/api/designations";
import type {
  Designation,
  DesignationFormValues,
  DesignationLevel,
  DesignationListResponse,
  DesignationStatus,
} from "@/types/models/designation";

type FilterStatus = DesignationStatus | "all";

const emptyList: DesignationListResponse = {
  items: [],
  total: 0,
  active: 0,
  inactive: 0,
  archived: 0,
  assigned_staff: 0,
  open_slots: 0,
};

const emptyForm: DesignationFormValues = {
  title: "Community Mobiliser",
  code: "COMM-MOB",
  department: "Community",
  level: "field",
  status: "active",
  reports_to: "Project Manager",
  description: "Supports field outreach, beneficiary coordination, attendance records, and community follow-up.",
  assignment_scope: "Field outreach and community engagement",
  responsibilities: "Maintain community contact lists\nCoordinate field visits and awareness sessions\nShare activity reports with the project team",
  required_documents: "Identity proof\nAddress proof\nEngagement letter",
  staff_assigned: "0",
  volunteer_slots: "4",
  sort_order: "60",
  cms_slug: "community-mobiliser",
  notes: "",
};

function designationToForm(designation: Designation): DesignationFormValues {
  return {
    title: designation.title,
    code: designation.code,
    department: designation.department,
    level: designation.level,
    status: designation.status,
    reports_to: designation.reports_to ?? "",
    description: designation.description,
    assignment_scope: designation.assignment_scope,
    responsibilities: designation.responsibilities.join("\n"),
    required_documents: designation.required_documents.join("\n"),
    staff_assigned: String(designation.staff_assigned),
    volunteer_slots: String(designation.volunteer_slots),
    sort_order: String(designation.sort_order),
    cms_slug: designation.cms_slug ?? "",
    notes: designation.notes ?? "",
  };
}

export default function Page() {
  const [designations, setDesignations] = useState<DesignationListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [department, setDepartment] = useState("");
  const [form, setForm] = useState<DesignationFormValues>(emptyForm);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  const loadDesignations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDesignations(await listDesignations({ search, status, department }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load designations.");
    } finally {
      setLoading(false);
    }
  }, [department, search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadDesignations();
  }, [loadDesignations]);

  const departments = useMemo(
    () => Array.from(new Set(designations.items.map((item) => item.department))).sort(),
    [designations.items],
  );

  const stats = useMemo(
    () => [
      { label: "Designations", value: designations.total, icon: Layers3 },
      { label: "Active", value: designations.active, icon: BadgeCheck },
      { label: "Assigned staff", value: designations.assigned_staff, icon: Users },
      { label: "Open slots", value: designations.open_slots, icon: Briefcase },
    ],
    [designations],
  );

  const updateField = <K extends keyof DesignationFormValues>(field: K, value: DesignationFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (designation: Designation) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(designation);
    setForm(designationToForm(designation));
    setIsFormOpen(true);
  };

  const submit = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await updateDesignation(editing.id, form);
      } else {
        await createDesignation(form);
      }
      setIsFormOpen(false);
      setEditing(null);
      await loadDesignations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save designation.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeDesignation = async (designation: Designation) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    if (!window.confirm(`Delete designation ${designation.title}?`)) return;
    await deleteDesignation(designation.id);
    await loadDesignations();
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Staff assignment metadata</p>
            <h1 className="mt-2 text-3xl font-black text-gray-950">Designation Management</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Control trust roles, departments, assignment scopes, document requirements, reporting lines, and capacity for staff,
              volunteers, interns, and project teams.
            </p>
          </div>
          {readOnly ? (
            <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800">
              Read-only guest access
            </span>
          ) : (
            <button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-700">
              <Plus size={18} aria-hidden="true" />
              Add designation
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Icon size={20} className="text-orange-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-gray-500">{item.label}</p>
                <p className="mt-1 text-3xl font-black text-gray-950">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" placeholder="Search title, code, department, or scope" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as FilterStatus)} className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-52">
            <option value="">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button type="button" onClick={() => void loadDesignations()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {isFormOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <ClipboardList size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-950">{editing ? "Edit designation" : "Add designation"}</h2>
                <p className="text-sm text-gray-600">Define staff assignment metadata and document requirements.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} />
              <Field label="Code" value={form.code} onChange={(value) => updateField("code", value)} />
              <Field label="Department" value={form.department} onChange={(value) => updateField("department", value)} />
              <Field label="Reports to" value={form.reports_to} onChange={(value) => updateField("reports_to", value)} />
              <Select label="Level" value={form.level} onChange={(value) => updateField("level", value as DesignationLevel)} options={["board", "leadership", "management", "coordination", "field", "volunteer", "intern"]} />
              <Select label="Status" value={form.status} onChange={(value) => updateField("status", value as DesignationStatus)} options={["active", "inactive", "archived"]} />
              <Field label="Assigned staff" value={form.staff_assigned} onChange={(value) => updateField("staff_assigned", value)} type="number" />
              <Field label="Capacity / slots" value={form.volunteer_slots} onChange={(value) => updateField("volunteer_slots", value)} type="number" />
              <Field label="Sort order" value={form.sort_order} onChange={(value) => updateField("sort_order", value)} type="number" />
              <Field label="CMS slug" value={form.cms_slug} onChange={(value) => updateField("cms_slug", value)} />
              <TextArea label="Assignment scope" value={form.assignment_scope} onChange={(value) => updateField("assignment_scope", value)} />
              <TextArea label="Description" value={form.description} onChange={(value) => updateField("description", value)} />
              <TextArea label="Responsibilities (one per line)" value={form.responsibilities} onChange={(value) => updateField("responsibilities", value)} />
              <TextArea label="Required documents (one per line)" value={form.required_documents} onChange={(value) => updateField("required_documents", value)} />
              <TextArea label="Notes" value={form.notes} onChange={(value) => updateField("notes", value)} wide />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Saving..." : "Save designation"}</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Loading designations</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {designations.items.map((designation) => {
              const capacity = Math.max(designation.volunteer_slots, designation.staff_assigned, 1);
              const percent = Math.min(Math.round((designation.staff_assigned / capacity) * 100), 100);
              return (
                <article key={designation.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-gray-950">{designation.title}</h2>
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700">{designation.code}</span>
                        <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold capitalize text-orange-700">{designation.status}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{designation.description}</p>
                      <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-4">
                        <Meta label="Department" value={designation.department} />
                        <Meta label="Level" value={designation.level.replace("_", " ")} />
                        <Meta label="Reports to" value={designation.reports_to ?? "Trust leadership"} />
                        <Meta label="Scope" value={designation.assignment_scope} />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-500">
                          <span>Capacity usage</span>
                          <span>{designation.staff_assigned}/{designation.volunteer_slots}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <TagList title="Responsibilities" items={designation.responsibilities} />
                        <TagList title="Required documents" items={designation.required_documents} />
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                        <button type="button" onClick={() => openEdit(designation)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Edit</button>
                        <button type="button" onClick={() => void removeDesignation(designation)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                          <Trash2 size={16} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
        {options.map((option) => (
          <option key={option} value={option}>{option.replace("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-1 font-semibold capitalize text-gray-900">{value}</p>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-bold uppercase text-gray-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-gray-500">No items configured</span>
        ) : items.map((item) => (
          <span key={item} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">{item}</span>
        ))}
      </div>
    </div>
  );
}
