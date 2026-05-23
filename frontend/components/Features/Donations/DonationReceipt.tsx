"use client";

import { Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackDocumentTemplates, type CmsDocumentTemplate } from "@/lib/cms/documentTemplates";
import { documentQrUrl, documentVerificationValue } from "@/lib/documents/qr";
import type { DonationReceipt as DonationReceiptModel } from "@/types/models/donation";

type DonationReceiptProps = {
  receipt: DonationReceiptModel;
  onClose?: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
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

const stampLogoPath = "/assets/brand/raushni-stamp-logo.png";

export default function DonationReceipt({ receipt, onClose }: DonationReceiptProps) {
  const donation = receipt.donation;
  const [template, setTemplate] = useState<CmsDocumentTemplate>(fallbackDocumentTemplates["donation-receipt"]);
  const qrUrl = documentQrUrl(documentVerificationValue("donation-receipt", receipt.receipt_number));

  useEffect(() => {
    const controller = new AbortController();
    async function loadTemplate() {
      try {
        const response = await fetch("/cms/api/document-templates?filters[key][$eq]=donation-receipt&populate=*", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const attrs = (await response.json())?.data?.[0]?.attributes;
        if (!attrs) return;
        setTemplate((current) => ({
          ...current,
          name: attrs.name ?? current.name,
          title: attrs.title ?? current.title,
          subtitle: attrs.subtitle ?? current.subtitle,
          body: attrs.body ?? current.body,
          footer: attrs.footer ?? current.footer,
          legalNote: attrs.legalNote ?? current.legalNote,
          thankYouNote: attrs.thankYouNote ?? current.thankYouNote,
          signatoryLabel: attrs.signatoryLabel ?? current.signatoryLabel,
          stampUrl: attrs.stampUrl ?? current.stampUrl,
          accentColor: attrs.accentColor ?? current.accentColor,
        }));
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.warn("Unable to load donation receipt CMS template", requestError);
        }
      }
    }
    void loadTemplate();
    return () => controller.abort();
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Donation receipt</h2>
          <p className="text-sm text-gray-600">{receipt.receipt_number}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <Printer size={16} aria-hidden="true" />
            Print / PDF
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50"
              aria-label="Close receipt"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <article className="mx-auto max-w-3xl p-6 text-gray-950 print:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-300 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <img
              src={stampLogoPath}
              alt="Raushni Educational and Social Welfare Trust stamp logo"
              className="h-24 w-24 shrink-0 rounded-full border border-gray-200 bg-gray-50 object-contain p-1 print:h-28 print:w-28"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                {template.title}
              </p>
              <h3 className="mt-1 text-2xl font-bold">{receipt.organization}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">{template.legalNote || receipt.registration_note}</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-500">Receipt no.</p>
            <p className="mt-1 font-bold text-gray-950">{receipt.receipt_number}</p>
            <p className="mt-3 font-semibold text-gray-500">Issued on</p>
            <p className="mt-1 text-gray-800">{formatDate(receipt.issued_at)}</p>
          </div>
        </div>

        <div className="grid gap-4 py-6 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">Received from</p>
            <p className="mt-2 text-lg font-bold">{donation.donor_name}</p>
            <p className="mt-1 text-sm text-gray-600">{donation.donor_phone}</p>
            <p className="text-sm text-gray-600">{donation.donor_email || "Email not provided"}</p>
            <p className="mt-2 text-sm text-gray-600">{donation.donor_address || "Address not provided"}</p>
            <p className="mt-2 text-sm text-gray-600">PAN: {donation.donor_pan || "Not provided"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">Donation details</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">
              {formatMoney(donation.amount, donation.currency)}
            </p>
            <dl className="mt-4 grid gap-2 text-sm text-gray-700">
              <div className="flex justify-between gap-3">
                <dt>Purpose</dt>
                <dd className="font-semibold capitalize">{label(donation.purpose)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Payment</dt>
                <dd className="font-semibold capitalize">{label(donation.payment_method)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Status</dt>
                <dd className="font-semibold capitalize">{donation.payment_status}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Date</dt>
                <dd className="font-semibold">{formatDate(donation.donation_date)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          <div className="flex items-start gap-4">
            <img
              src={stampLogoPath}
              alt=""
              className="hidden h-16 w-16 shrink-0 rounded-full object-contain opacity-70 sm:block"
            />
            <div>
              <p>
                {template.body}
              </p>
              {donation.transaction_reference && (
                <p className="mt-2">
                  Transaction reference: <span className="font-semibold">{donation.transaction_reference}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-6 text-sm text-gray-600">
          <p>{template.thankYouNote}</p>
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white p-2">
            <img src={qrUrl} alt={`QR verification for receipt ${receipt.receipt_number}`} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-44 border-t border-gray-400 pt-2 text-center font-semibold text-gray-800">
            {template.signatoryLabel}
          </div>
        </div>
      </article>
    </div>
  );
}
