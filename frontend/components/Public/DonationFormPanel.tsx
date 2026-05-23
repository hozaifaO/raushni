"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import DonationForm, { emptyDonationForm } from "@/components/Features/Donations/DonationForm";
import { registerPublicDonation } from "@/services/api/donations";
import type { Donation, DonationFormValues } from "@/types/models/donation";

export default function DonationFormPanel() {
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
      setValues({ ...emptyDonationForm, payment_status: "pending" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to submit donation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      />
    </div>
  );
}
