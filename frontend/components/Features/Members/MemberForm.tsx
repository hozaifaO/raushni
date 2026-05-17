"use client";

import { Save, X } from "lucide-react";
import type { FormEvent } from "react";
import type { MemberFormValues } from "@/types/models/member";

type MemberFormProps = {
  values: MemberFormValues;
  submitting: boolean;
  submitLabel: string;
  onChange: <K extends keyof MemberFormValues>(field: K, value: MemberFormValues[K]) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export const emptyMemberForm: MemberFormValues = {
  full_name: "",
  email: "",
  phone: "",
  role: "Volunteer",
  status: "active",
  joined_on: new Date().toISOString().slice(0, 10),
  address: "",
  emergency_contact: "",
  notes: "",
};

export default function MemberForm({
  values,
  submitting,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
}: MemberFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Full name
          <input
            required
            minLength={2}
            value={values.full_name}
            onChange={(event) => onChange("full_name", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Aisha Khan"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Phone
          <input
            required
            minLength={7}
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="+91 9876543210"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={values.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="member@example.org"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Role
          <input
            required
            minLength={2}
            value={values.role}
            onChange={(event) => onChange("role", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Volunteer"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Status
          <select
            value={values.status}
            onChange={(event) => onChange("status", event.target.value as MemberFormValues["status"])}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Joined on
          <input
            required
            type="date"
            value={values.joined_on}
            onChange={(event) => onChange("joined_on", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-gray-700">
        Address
        <input
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Street, city, state"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-gray-700">
        Emergency contact
        <input
          value={values.emergency_contact}
          onChange={(event) => onChange("emergency_contact", event.target.value)}
          className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Name or phone number"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-gray-700">
        Notes
        <textarea
          value={values.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Program involvement, availability, or documents pending"
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <X size={18} aria-hidden="true" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} aria-hidden="true" />
          {submitting ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
}
