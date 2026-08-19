"use client";

import { ArrowLeft, Printer, Receipt, RefreshCw } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import DonationReceipt from "@/components/Documents/PDFGenerator/DonationReceipt";
import PrintStyles from "@/components/Documents/Generators/PrintStyles";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";
import { issueDonationReceipt, listDonations } from "@/services/api/donations";
import type { Donation } from "@/types/models/donation";

type FormState = {
  receiptNumber: string;
  issuedAt: string;
  donorName: string;
  donorPhone: string;
  donorEmail: string;
  donorAddress: string;
  donorPan: string;
  amount: string;
  purpose: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference: string;
};

const today = new Date().toISOString().slice(0, 10);

function receiptNumber() {
  return `RSH-DON-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formatAmount(donation: Donation) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: donation.currency || "INR" }).format(donation.amount);
}

export default function DonationReceiptGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    receiptNumber: receiptNumber(),
    issuedAt: today,
    donorName: "Donor Name",
    donorPhone: "+91",
    donorEmail: "Email not provided",
    donorAddress: "Address not provided",
    donorPan: "Not provided",
    amount: "INR 0",
    purpose: "General welfare",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    transactionReference: "Not provided",
  });

  useEffect(() => {
    async function load() {
      try {
        const response = await listDonations({ status: "all" });
        setDonations(response.items);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to load donation records. Manual receipt is available.");
      }
    }
    void load();
  }, []);

  const selectDonation = async (id: string) => {
    const donation = donations.find((item) => item.id === id);
    if (!donation) return;
    let issuedNumber = donation.receipt_number;
    try {
      if (donation.payment_status === "paid") {
        const receipt = await issueDonationReceipt(donation.id);
        issuedNumber = receipt.receipt_number;
      }
    } catch {
      issuedNumber = donation.receipt_number;
    }
    setForm({
      receiptNumber: issuedNumber,
      issuedAt: today,
      donorName: donation.is_anonymous ? "Anonymous" : donation.donor_name,
      donorPhone: donation.is_anonymous ? "Not provided" : donation.donor_phone,
      donorEmail: donation.is_anonymous
        ? "Not provided"
        : (donation.donor_email ?? "Email not provided"),
      donorAddress: donation.is_anonymous
        ? "Not provided"
        : (donation.donor_address ?? "Address not provided"),
      donorPan: donation.is_anonymous ? "Not provided" : (donation.donor_pan ?? "Not provided"),
      amount: formatAmount(donation),
      purpose: donation.purpose.replace(/_/g, " "),
      paymentMethod: donation.payment_method.replace(/_/g, " "),
      paymentStatus: donation.payment_status,
      transactionReference: donation.transaction_reference ?? "Not provided",
    });
  };

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <DocumentShell
      title="Donation Receipt"
      icon={<Receipt size={22} aria-hidden="true" />}
      accent="orange"
      controls={
        <>
          {error && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}
          <label className="grid gap-1 text-sm font-bold text-gray-700">
            Select donation
            <select onChange={(event) => void selectDonation(event.target.value)} className="field">
              <option value="">Manual receipt</option>
              {donations.map((donation) => <option key={donation.id} value={donation.id}>{donation.receipt_number} - {donation.donor_name}</option>)}
            </select>
          </label>
          <TextField label="Receipt number" value={form.receiptNumber} onChange={(value) => updateField("receiptNumber", value)} />
          <TextField label="Issued on" type="date" value={form.issuedAt} onChange={(value) => updateField("issuedAt", value)} />
          <TextField label="Donor name" value={form.donorName} onChange={(value) => updateField("donorName", value)} />
          <TextField label="Amount" value={form.amount} onChange={(value) => updateField("amount", value)} />
          <TextField label="Payment method" value={form.paymentMethod} onChange={(value) => updateField("paymentMethod", value)} />
          <TextField label="Transaction reference" value={form.transactionReference} onChange={(value) => updateField("transactionReference", value)} />
          <button type="button" onClick={() => window.print()} className="primary-button"><Printer size={18} />Print / Save PDF</button>
          <button type="button" onClick={() => updateField("receiptNumber", receiptNumber())} className="secondary-button"><RefreshCw size={18} />Refresh number</button>
        </>
      }
    >
      <DonationReceipt
        templateTitle={template.title}
        legalNote={template.legalNote}
        body={template.body}
        thankYouNote={template.thankYouNote}
        signatoryLabel={template.signatoryLabel}
        receiptNumber={form.receiptNumber}
        issuedAt={form.issuedAt}
        donorName={form.donorName}
        donorPhone={form.donorPhone}
        donorEmail={form.donorEmail}
        donorAddress={form.donorAddress}
        donorPan={form.donorPan}
        amount={form.amount}
        purpose={form.purpose}
        paymentMethod={form.paymentMethod}
        paymentStatus={form.paymentStatus}
        transactionReference={form.transactionReference}
      />
    </DocumentShell>
  );
}

export function DocumentShell({ title, icon, controls, children }: { title: string; icon: React.ReactNode; accent?: string; controls: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 text-gray-950 sm:px-6 lg:px-8">
      <PrintStyles />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="document-print-hide rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <Link href="/documents" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-orange-700">
            <ArrowLeft size={16} aria-hidden="true" />Documents
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700">{icon}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">Generate</p>
              <h1 className="text-xl font-black">{title}</h1>
            </div>
          </div>
          <div className="mt-5 grid gap-4">{controls}</div>
        </aside>
        <main className="document-print-area rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</main>
      </div>
      <style jsx global>{`
        .field {
          min-height: 2.75rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0 0.75rem;
          color: #030712;
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
        }
        .primary-button,
        .secondary-button {
          display: inline-flex;
          min-height: 2.75rem;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 700;
        }
        .primary-button {
          background: #ea580c;
          color: white;
        }
        .secondary-button {
          border: 1px solid #d1d5db;
          color: #374151;
        }
      `}</style>
    </section>
  );
}

export function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-gray-700">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="field" />
    </label>
  );
}
