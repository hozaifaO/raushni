"use client";

import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import {
  createSimpleRecord,
  deleteSimpleRecord,
  listSimpleRecords,
  updateSimpleRecord,
} from "@/services/api/simpleRecords";
import type { SimpleRecord, SimpleRecordFormValues, SimpleRecordListResponse, SimpleRecordStatus } from "@/types/models/simpleRecord";

type SimpleCrudPageProps = {
  title: string;
  modulePath: string;
  description: string;
  defaultCategory?: string;
};

const emptyList: SimpleRecordListResponse = { items: [], total: 0, active: 0, published: 0, archived: 0 };

function emptyForm(category = "general"): SimpleRecordFormValues {
  return {
    title: "",
    category,
    summary: "",
    status: "active",
    record_date: new Date().toISOString().slice(0, 10),
    contact_name: "",
    contact_email: "",
    amount: "",
    location: "",
    notes: "",
  };
}

function recordToForm(record: SimpleRecord): SimpleRecordFormValues {
  return {
    title: record.title,
    category: record.category,
    summary: record.summary,
    status: record.status,
    record_date: record.record_date,
    contact_name: record.contact_name ?? "",
    contact_email: record.contact_email ?? "",
    amount: record.amount == null ? "" : String(record.amount),
    location: record.location ?? "",
    notes: record.notes ?? "",
  };
}

export default function SimpleCrudPage({ title, modulePath, description, defaultCategory = "general" }: SimpleCrudPageProps) {
  const [records, setRecords] = useState<SimpleRecordListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SimpleRecordStatus | "all">("all");
  const [form, setForm] = useState<SimpleRecordFormValues>(emptyForm(defaultCategory));
  const [editing, setEditing] = useState<SimpleRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await listSimpleRecords(modulePath, { search, status }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [modulePath, search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadRecords();
  }, [loadRecords]);

  const stats = useMemo(
    () => [
      ["Total", records.total],
      ["Active", records.active],
      ["Published", records.published],
      ["Archived", records.archived],
    ],
    [records],
  );

  const openCreate = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(null);
    setForm(emptyForm(defaultCategory));
    setIsFormOpen(true);
  };

  const openEdit = (record: SimpleRecord) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(record);
    setForm(recordToForm(record));
    setIsFormOpen(true);
  };

  const saveRecord = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateSimpleRecord(modulePath, editing.id, form);
      } else {
        await createSimpleRecord(modulePath, form);
      }
      setIsFormOpen(false);
      setEditing(null);
      await loadRecords();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save record.");
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (record: SimpleRecord) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    const confirmed = window.confirm(`Delete ${record.title}?`);
    if (!confirmed) return;
    setError(null);
    try {
      await deleteSimpleRecord(modulePath, record.id);
      await loadRecords();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete record.");
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Dashboard module</p>
            <h1 className="mt-2 text-3xl font-black text-gray-950">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={readOnly}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus size={18} aria-hidden="true" />
            Add record
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}`}
                className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as SimpleRecordStatus | "all")}
              className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="button"
              onClick={() => void loadRecords()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {isFormOpen && (
          <div className="rounded-lg border border-orange-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
              <Field label="Category" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
              <Field label="Date" type="date" value={form.record_date} onChange={(value) => setForm((current) => ({ ...current, record_date: value }))} />
              <Field label="Location" value={form.location} onChange={(value) => setForm((current) => ({ ...current, location: value }))} />
              <Field label="Contact name" value={form.contact_name} onChange={(value) => setForm((current) => ({ ...current, contact_name: value }))} />
              <Field label="Contact email" type="email" value={form.contact_email} onChange={(value) => setForm((current) => ({ ...current, contact_email: value }))} />
              <Field label="Amount" type="number" value={form.amount} onChange={(value) => setForm((current) => ({ ...current, amount: value }))} />
              <label className="grid gap-1 text-sm font-semibold text-gray-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SimpleRecordStatus }))}
                  className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <TextArea label="Summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} />
              <TextArea label="Notes" value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => void saveRecord()} disabled={saving} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:bg-gray-300">
                {saving ? "Saving..." : editing ? "Update record" : "Create record"}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-gray-600">Loading records</div>
          ) : records.items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-base font-bold text-gray-950">No records found</p>
              <p className="mt-1 text-sm text-gray-500">Create the first record or adjust the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  <tr><th className="px-4 py-3">Record</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.items.map((record) => (
                    <tr key={record.id} className="hover:bg-orange-50/40">
                      <td className="px-4 py-4"><button type="button" onClick={() => openEdit(record)} className="text-left"><span className="font-bold text-gray-950">{record.title}</span><span className="mt-1 block max-w-xl text-gray-500">{record.summary}</span></button></td>
                      <td className="px-4 py-4"><span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold capitalize text-gray-700">{record.status}</span></td>
                      <td className="px-4 py-4 text-gray-700">{record.record_date}</td>
                      <td className="px-4 py-4 text-gray-700">{record.contact_name ?? record.location ?? "Not set"}</td>
                      <td className="px-4 py-4 text-right"><button type="button" onClick={() => void removeRecord(record)} disabled={readOnly} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:text-gray-300" aria-label={`Delete ${record.title}`}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-gray-700">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-gray-700 md:col-span-2">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}
