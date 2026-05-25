"use client";

import { HeartHandshake, Plus, QrCode, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DonationForm, { emptyDonationForm } from "@/components/Features/Donations/DonationForm";
import DonationList from "@/components/Features/Donations/DonationList";
import DonationReceipt from "@/components/Features/Donations/DonationReceipt";
import { PaymentMethodIcon } from "@/components/Features/Donations/paymentMethodMeta";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import { fallbackDonationPaymentSettings, type DonationPaymentSettings } from "@/lib/cms/donationSettings";
import {
  createDonation,
  deleteDonation,
  issueDonationReceipt,
  listDonations,
  updateDonation,
} from "@/services/api/donations";
import type {
  Donation,
  DonationFormValues,
  DonationListResponse,
  DonationPaymentStatus,
  DonationReceipt as DonationReceiptModel,
} from "@/types/models/donation";

const emptyList: DonationListResponse = {
  items: [],
  total: 0,
  paid: 0,
  pending: 0,
  failed: 0,
  refunded: 0,
  total_amount: 0,
};

type FilterStatus = DonationPaymentStatus | "all";

function donationToForm(donation: Donation): DonationFormValues {
  return {
    donor_name: donation.donor_name,
    donor_email: donation.donor_email ?? "",
    donor_phone: donation.donor_phone,
    donor_address: donation.donor_address ?? "",
    donor_pan: donation.donor_pan ?? "",
    donor_type: donation.donor_type,
    amount: String(donation.amount),
    currency: donation.currency,
    purpose: donation.purpose,
    payment_method: donation.payment_method,
    payment_status: donation.payment_status,
    transaction_reference: donation.transaction_reference ?? "",
    donation_date: donation.donation_date,
    notes: donation.notes ?? "",
  };
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Page() {
  const [donations, setDonations] = useState<DonationListResponse>(emptyList);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [formValues, setFormValues] = useState<DonationFormValues>(emptyDonationForm);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [receipt, setReceipt] = useState<DonationReceiptModel | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<DonationPaymentSettings>(fallbackDonationPaymentSettings);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listDonations({ search, status });
      setDonations(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load donations. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPaymentSettings() {
      try {
        const response = await fetch("/cms/api/donation-payment-settings?filters[slug][$eq]=donation-payment-methods&populate=*", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const attrs = (await response.json())?.data?.[0]?.attributes;
        if (!attrs) return;
        setPaymentSettings({
          ...fallbackDonationPaymentSettings,
          ...attrs,
          paymentOptions: Array.isArray(attrs.paymentOptions) ? attrs.paymentOptions : fallbackDonationPaymentSettings.paymentOptions,
          instructions: Array.isArray(attrs.instructions) ? attrs.instructions : fallbackDonationPaymentSettings.instructions,
        });
      } catch (requestError) {
        if (!controller.signal.aborted) console.warn("Unable to load CMS donation payment settings", requestError);
      }
    }
    void loadPaymentSettings();
    return () => controller.abort();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Total donations", value: donations.total },
      { label: "Paid", value: donations.paid },
      { label: "Pending", value: donations.pending },
      { label: "Received amount", value: formatMoney(donations.total_amount) },
    ],
    [donations],
  );

  const openCreateForm = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditingDonation(null);
    setReceipt(null);
    setFormValues({ ...emptyDonationForm, donation_date: new Date().toISOString().slice(0, 10) });
    setIsFormOpen(true);
  };

  const openEditForm = (donation: Donation) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditingDonation(donation);
    setReceipt(null);
    setFormValues(donationToForm(donation));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDonation(null);
    setFormValues(emptyDonationForm);
  };

  const updateFormField = <K extends keyof DonationFormValues>(field: K, value: DonationFormValues[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingDonation) {
        await updateDonation(editingDonation.id, formValues);
      } else {
        await createDonation(formValues);
      }
      closeForm();
      await loadDonations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save donation.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeDonation = async (donation: Donation) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    const confirmed = window.confirm(`Delete donation ${donation.receipt_number} from ${donation.donor_name}?`);
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await deleteDonation(donation.id);
      await loadDonations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete donation.");
    }
  };

  const openReceipt = async (donation: Donation) => {
    setError(null);
    if (readOnly && !donation.receipt_issued) {
      setError("Guest users can view issued receipts only.");
      return;
    }
    if (donation.payment_status !== "paid") {
      setError("Mark the donation as paid before issuing a receipt.");
      return;
    }
    try {
      const response = await issueDonationReceipt(donation.id);
      setReceipt(response);
      setIsFormOpen(false);
      await loadDonations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate receipt.");
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
            <h1 className="mt-2 text-3xl font-bold text-gray-950">Donation Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Manage donor registration, donation records, payment status, receipts, and printable
              acknowledgement documents.
            </p>
          </div>
          {readOnly ? (
            <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800">
              Read-only guest access
            </span>
          ) : (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              <Plus size={18} aria-hidden="true" />
              Record donation
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <QrCode size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">{paymentSettings.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">{paymentSettings.intro}</p>
              <p className="mt-3 text-sm font-semibold text-gray-900">UPI ID: {paymentSettings.upiId}</p>
              <p className="text-sm text-gray-600">{paymentSettings.accountName}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
            <img src={paymentSettings.qrImageUrl} alt="Raushni donation UPI QR code" className="h-36 w-36 rounded-lg border border-gray-200 bg-gray-50 object-contain p-2" />
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                {paymentSettings.paymentOptions.filter((option) => option.enabled !== false).map((option) => (
                  <span key={option.value} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                    <PaymentMethodIcon method={option.value} size={14} />
                    {option.label}
                  </span>
                ))}
              </div>
              <ul className="grid gap-1 text-sm text-gray-600">
                {paymentSettings.instructions.slice(0, 3).map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
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
              placeholder="Search donor, phone, email, receipt, or reference"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FilterStatus)}
            className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44"
            aria-label="Filter donations by payment status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="button"
            onClick={() => void loadDonations()}
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
                <HeartHandshake size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {editingDonation ? "Edit donation" : "Record donation"}
                </h2>
                <p className="text-sm text-gray-600">
                  {editingDonation ? "Update donor, payment, or receipt details." : "Create a new donation record."}
                </p>
              </div>
            </div>
            <DonationForm
              values={formValues}
              submitting={submitting}
              submitLabel={editingDonation ? "Update donation" : "Save donation"}
              onChange={updateFormField}
              onCancel={closeForm}
              onSubmit={submitForm}
              paymentOptions={paymentSettings.paymentOptions}
            />
          </div>
        )}

        {receipt && <DonationReceipt receipt={receipt} onClose={() => setReceipt(null)} />}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Loading donation records</p>
          </div>
        ) : (
          <DonationList
            donations={donations.items}
            readOnly={readOnly}
            onEdit={openEditForm}
            onDelete={removeDonation}
            onReceipt={openReceipt}
          />
        )}
      </div>
    </section>
  );
}
