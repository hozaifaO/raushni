"use client";

import { Save, X } from "lucide-react";
import type { FormEvent } from "react";
import { PaymentMethodIcon } from "@/components/Features/Donations/paymentMethodMeta";
import { fallbackPaymentOptions, type DonationPaymentOption } from "@/lib/cms/donationSettings";
import type { DonationFormValues } from "@/types/models/donation";

type DonationFormProps = {
  values: DonationFormValues;
  submitting: boolean;
  submitLabel: string;
  publicMode?: boolean;
  paymentOptions?: DonationPaymentOption[];
  onChange: <K extends keyof DonationFormValues>(field: K, value: DonationFormValues[K]) => void;
  onCancel?: () => void;
  onSubmit: () => void;
};

export const emptyDonationForm: DonationFormValues = {
  donor_name: "",
  donor_email: "",
  donor_phone: "",
  donor_address: "",
  donor_pan: "",
  donor_type: "individual",
  amount: "",
  currency: "INR",
  purpose: "general",
  payment_method: "upi",
  payment_status: "pending",
  transaction_reference: "",
  donation_date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function DonationForm({
  values,
  submitting,
  submitLabel,
  publicMode = false,
  paymentOptions = fallbackPaymentOptions,
  onChange,
  onCancel,
  onSubmit,
}: DonationFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };
  const enabledPaymentOptions = paymentOptions.filter((option) => option.enabled !== false);

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Donor name
          <input
            required
            minLength={2}
            value={values.donor_name}
            onChange={(event) => onChange("donor_name", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Aisha Khan"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Phone
          <input
            required
            minLength={7}
            value={values.donor_phone}
            onChange={(event) => onChange("donor_phone", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="+91 9876543210"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={values.donor_email}
            onChange={(event) => onChange("donor_email", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="donor@example.org"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Donor type
          <select
            value={values.donor_type}
            onChange={(event) => onChange("donor_type", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
            <option value="trust">Trust</option>
            <option value="foundation">Foundation</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Amount
          <input
            required
            min="1"
            step="0.01"
            type="number"
            value={values.amount}
            onChange={(event) => onChange("amount", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="5000"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Purpose
          <select
            value={values.purpose}
            onChange={(event) => onChange("purpose", event.target.value as DonationFormValues["purpose"])}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="general">General welfare</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="livelihood">Livelihood</option>
            <option value="relief">Relief</option>
            <option value="environment">Environment</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Payment method
          <select
            value={values.payment_method}
            onChange={(event) =>
              onChange("payment_method", event.target.value as DonationFormValues["payment_method"])
            }
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            {enabledPaymentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        {!publicMode && (
          <label className="grid gap-2 text-sm font-medium text-gray-700">
            Payment status
            <select
              value={values.payment_status}
              onChange={(event) =>
                onChange("payment_status", event.target.value as DonationFormValues["payment_status"])
              }
              className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
        )}

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Donation date
          <input
            required
            type="date"
            value={values.donation_date}
            onChange={(event) => onChange("donation_date", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          PAN
          <input
            value={values.donor_pan}
            onChange={(event) => onChange("donor_pan", event.target.value.toUpperCase())}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="ABCDE1234F"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-gray-700">
          Transaction reference
          <input
            value={values.transaction_reference}
            onChange={(event) => onChange("transaction_reference", event.target.value)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="UPI, cheque, or bank reference"
          />
        </label>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-gray-800">Payment type</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {enabledPaymentOptions.map((option) => {
            const isSelected = values.payment_method === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("payment_method", option.value)}
                className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 text-left text-sm transition ${
                  isSelected
                    ? "border-orange-300 bg-orange-50 text-orange-900 ring-2 ring-orange-100"
                    : "border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/60"
                }`}
                aria-pressed={isSelected}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-orange-600 text-white" : "bg-gray-100 text-orange-600"}`}>
                  <PaymentMethodIcon method={option.value} className={isSelected ? "text-white" : "text-orange-600"} />
                </span>
                <span>
                  <span className="block font-bold">{option.label}</span>
                  {option.requiresReference && <span className="block text-xs text-gray-500">Reference required</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-gray-700">
        Address
        <input
          value={values.donor_address}
          onChange={(event) => onChange("donor_address", event.target.value)}
          className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Street, city, state"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-gray-700">
        Notes
        <textarea
          value={values.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Campaign, acknowledgement preference, or internal notes"
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <X size={18} aria-hidden="true" />
            Cancel
          </button>
        )}
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
