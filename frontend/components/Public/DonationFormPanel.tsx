"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import DonationForm, { emptyDonationForm } from "@/components/Features/Donations/DonationForm";
import { PaymentMethodIcon } from "@/components/Features/Donations/paymentMethodMeta";
import { fallbackDonationPaymentSettings, type DonationPaymentSettings } from "@/lib/cms/donationSettings";
import { createDonationCheckout, registerPublicDonation } from "@/services/api/donations";
import type { Donation, DonationFormValues } from "@/types/models/donation";

const gatewayPaymentMethods = new Set(["credit_card", "debit_card", "international_card", "stripe"]);

export default function DonationFormPanel({ paymentSettings = fallbackDonationPaymentSettings }: { paymentSettings?: DonationPaymentSettings }) {
  const [values, setValues] = useState<DonationFormValues>({
    ...emptyDonationForm,
    payment_status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  const updateField = <K extends keyof DonationFormValues>(field: K, value: DonationFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submitDonation = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await registerPublicDonation({ ...values, payment_status: "pending" });
      setCreatedDonation(response);
      if (gatewayPaymentMethods.has(values.payment_method)) {
        const checkout = await createDonationCheckout(response.id);
        window.location.href = checkout.checkout_url;
        return;
      }
      setValues({ ...emptyDonationForm, payment_status: "pending" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit donation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5">
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
        <img src={paymentSettings.qrImageUrl} alt="Raushni donation UPI QR code" className="h-36 w-36 rounded-lg border border-gray-200 bg-white object-contain p-2" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">{paymentSettings.title}</p>
          <p className="mt-2 text-sm leading-6 text-gray-800">{paymentSettings.intro}</p>
          <p className="mt-3 text-sm font-semibold text-gray-950">UPI ID: {paymentSettings.upiId}</p>
          <p className="text-sm text-gray-800">{paymentSettings.accountName}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {paymentSettings.paymentOptions.filter((option) => option.enabled !== false).map((option) => (
          <span key={option.value} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
            <PaymentMethodIcon method={option.value} size={14} />
            {option.label}
          </span>
        ))}
      </div>
    </div>

    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      {createdDonation && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Donation submitted successfully.</p>
              <p className="mt-1">Reference {createdDonation.receipt_number} is pending payment verification.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <DonationForm
        values={values}
        submitting={submitting}
        submitLabel="Submit donation"
        publicMode
        onChange={updateField}
        onSubmit={submitDonation}
        paymentOptions={paymentSettings.paymentOptions}
      />
    </div>
    </div>
  );
}
