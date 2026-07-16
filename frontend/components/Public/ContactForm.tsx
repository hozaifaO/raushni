"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { registerPublicEnquiry } from "@/services/api/enquiries";

type ContactFormValues = {
  contact_name: string;
  contact_email: string;
  phone: string;
  category: string;
  summary: string;
};

const emptyForm: ContactFormValues = {
  contact_name: "",
  contact_email: "",
  phone: "",
  category: "general",
  summary: "",
};

const inputClassName =
  "min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500";

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const updateField = <K extends keyof ContactFormValues>(field: K, value: ContactFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSent(false);
    try {
      await registerPublicEnquiry({
        contact_name: values.contact_name.trim(),
        contact_email: values.contact_email.trim(),
        phone: values.phone.trim() || null,
        category: values.category,
        summary: values.summary.trim(),
      });
      setSent(true);
      setValues(emptyForm);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
    >
      {sent && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Thank you. Your enquiry has been received by the team.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          name="contact_name"
          value={values.contact_name}
          onChange={(event) => updateField("contact_name", event.target.value)}
          placeholder="Full name"
          autoComplete="name"
          disabled={submitting}
          className={inputClassName}
        />
        <input
          required
          type="email"
          name="contact_email"
          value={values.contact_email}
          onChange={(event) => updateField("contact_email", event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          disabled={submitting}
          className={inputClassName}
        />
      </div>
      <input
        name="phone"
        type="tel"
        value={values.phone}
        onChange={(event) => updateField("phone", event.target.value)}
        placeholder="Phone number"
        autoComplete="tel"
        disabled={submitting}
        className={inputClassName}
      />
      <select
        name="category"
        value={values.category}
        onChange={(event) => updateField("category", event.target.value)}
        disabled={submitting}
        className={inputClassName}
      >
        <option value="general">General enquiry</option>
        <option value="volunteer">Volunteer</option>
        <option value="donation">Donation</option>
        <option value="careers">Careers</option>
        <option value="partnership">Partnership</option>
      </select>
      <textarea
        required
        name="summary"
        rows={5}
        value={values.summary}
        onChange={(event) => updateField("summary", event.target.value)}
        placeholder="Message"
        disabled={submitting}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500"
      />
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} aria-hidden="true" />
        {submitting ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
