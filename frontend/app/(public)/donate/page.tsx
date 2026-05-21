"use client";

import { CheckCircle2, HeartHandshake } from "lucide-react";
import { useState } from "react";
import DonationForm, { emptyDonationForm } from "@/components/Features/Donations/DonationForm";
import { registerPublicDonation } from "@/services/api/donations";
import type { Donation, DonationFormValues } from "@/types/models/donation";

export default function Page() {
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
    <section className="bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <HeartHandshake size={24} aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase text-orange-600">
            Raushni Educational & Social Welfare Trust
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Make a Donation</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your support helps keep education, welfare, relief, and livelihood programs available
            for families who need reliable community support.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-gray-700">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">Receipt process</p>
              <p className="mt-1 leading-6">
                After payment verification, the team issues an official receipt with the donation
                reference number.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">Payment status</p>
              <p className="mt-1 leading-6">
                Public submissions are saved as pending so the finance team can verify the transfer
                before final acknowledgement.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          {createdDonation && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Donation submitted successfully.</p>
                  <p className="mt-1">
                    Reference {createdDonation.receipt_number} is pending payment verification.
                  </p>
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
      </div>
    </section>
  );
}
