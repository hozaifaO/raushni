"use client";

import { Edit, FileText, Printer, Trash2 } from "lucide-react";
import type { Donation } from "@/types/models/donation";

type DonationListProps = {
  donations: Donation[];
  readOnly?: boolean;
  onEdit: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
  onReceipt: (donation: Donation) => void;
};

const statusClasses = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  refunded: "border-gray-200 bg-gray-100 text-gray-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function label(value: string) {
  return value.split("_").join(" ");
}

export default function DonationList({
  donations,
  readOnly = false,
  onEdit,
  onDelete,
  onReceipt,
}: DonationListProps) {
  if (donations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-gray-950">No donation records found</p>
        <p className="mt-2 text-sm text-gray-600">
          Record a donation or adjust the search and payment status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Donor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Donation
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Receipt
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-orange-50/50">
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-gray-950">{donation.donor_name}</div>
                  <div className="text-sm text-gray-500">{donation.donor_phone}</div>
                  <div className="text-sm text-gray-500">{donation.donor_email || "Email not set"}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="font-semibold text-gray-950">
                    {formatMoney(donation.amount, donation.currency)}
                  </div>
                  <div className="text-sm capitalize text-gray-500">
                    {label(donation.purpose)} on {formatDate(donation.donation_date)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-medium capitalize text-gray-900">
                    {label(donation.payment_method)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {donation.transaction_reference || "Reference not set"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{donation.receipt_number}</div>
                  <div className="text-sm text-gray-500">
                    {donation.receipt_issued ? "Issued" : "Ready when paid"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses[donation.payment_status]}`}
                  >
                    {donation.payment_status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => onReceipt(donation)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      aria-label={`Open receipt for ${donation.donor_name}`}
                      title="Receipt"
                    >
                      {donation.receipt_issued ? (
                        <Printer size={16} aria-hidden="true" />
                      ) : (
                        <FileText size={16} aria-hidden="true" />
                      )}
                    </button>
                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(donation)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          aria-label={`Edit donation from ${donation.donor_name}`}
                          title="Edit"
                        >
                          <Edit size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(donation)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete donation from ${donation.donor_name}`}
                          title="Delete"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
