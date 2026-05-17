"use client";

import { Plus, RefreshCw, Search, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import MemberForm, { emptyMemberForm } from "@/components/Features/Members/MemberForm";
import MemberList from "@/components/Features/Members/MemberList";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from "@/services/api/members";
import type { Member, MemberFormValues, MemberListResponse, MemberStatus } from "@/types/models/member";

const emptyList: MemberListResponse = {
  items: [],
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
};

type FilterStatus = MemberStatus | "all";

function memberToForm(member: Member): MemberFormValues {
  return {
    full_name: member.full_name,
    email: member.email ?? "",
    phone: member.phone,
    role: member.role,
    status: member.status,
    joined_on: member.joined_on,
    address: member.address ?? "",
    emergency_contact: member.emergency_contact ?? "",
    notes: member.notes ?? "",
  };
}

export default function Page() {
  const [members, setMembers] = useState<MemberListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [formValues, setFormValues] = useState<MemberFormValues>(emptyMemberForm);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listMembers({ search, status });
      setMembers(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load members. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const stats = useMemo(
    () => [
      { label: "Total members", value: members.total },
      { label: "Active", value: members.active },
      { label: "Pending", value: members.pending },
      { label: "Inactive", value: members.inactive },
    ],
    [members],
  );

  const openCreateForm = () => {
    setEditingMember(null);
    setFormValues({ ...emptyMemberForm, joined_on: new Date().toISOString().slice(0, 10) });
    setIsFormOpen(true);
  };

  const openEditForm = (member: Member) => {
    setEditingMember(member);
    setFormValues(memberToForm(member));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    setFormValues(emptyMemberForm);
  };

  const updateFormField = <K extends keyof MemberFormValues>(field: K, value: MemberFormValues[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formValues);
      } else {
        await createMember(formValues);
      }
      closeForm();
      await loadMembers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save member.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (member: Member) => {
    const confirmed = window.confirm(`Delete ${member.full_name} from member records?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await deleteMember(member.id);
      await loadMembers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete member.");
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-orange-600">
              Educational and Social Welfare Trust
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950">Member Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Maintain member records, contact details, roles, joining dates, and active status.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Plus size={18} aria-hidden="true" />
            Add member
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Search name, phone, email, or role"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FilterStatus)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44"
            aria-label="Filter members by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={() => void loadMembers()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <Users size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {editingMember ? "Edit member" : "Add member"}
                </h2>
                <p className="text-sm text-gray-600">
                  {editingMember ? "Update the member record." : "Create a new member record."}
                </p>
              </div>
            </div>
            <MemberForm
              values={formValues}
              submitting={submitting}
              submitLabel={editingMember ? "Update member" : "Create member"}
              onChange={updateFormField}
              onCancel={closeForm}
              onSubmit={submitForm}
            />
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Loading member records</p>
          </div>
        ) : (
          <MemberList members={members.items} onEdit={openEditForm} onDelete={removeMember} />
        )}
      </div>
    </section>
  );
}
