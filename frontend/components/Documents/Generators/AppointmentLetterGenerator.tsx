"use client";

import { ArrowLeft, Printer, RefreshCw, ScrollText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AppointmentLetter from "@/components/Documents/PDFGenerator/AppointmentLetter";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";

type FormState = {
  recipientName: string;
  roleTitle: string;
  department: string;
  startDate: string;
  letterNumber: string;
};

const today = new Date().toISOString().slice(0, 10);

function makeLetterNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RSH-APT-${datePart}-${randomPart}`;
}

export default function AppointmentLetterGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [form, setForm] = useState<FormState>({
    recipientName: "Recipient Name",
    roleTitle: "Program Volunteer",
    department: "Community Programs",
    startDate: today,
    letterNumber: makeLetterNumber(),
  });

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 text-gray-950 sm:px-6 lg:px-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .document-print-area,
          .document-print-area * {
            visibility: visible;
          }
          .document-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
          }
          .document-print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="document-print-hide rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <Link href="/documents" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-orange-700">
            <ArrowLeft size={16} aria-hidden="true" />
            Documents
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <ScrollText size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Generate</p>
              <h1 className="text-xl font-black">Appointment Letter</h1>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <TextField label="Recipient name" value={form.recipientName} onChange={(value) => updateField("recipientName", value)} />
            <TextField label="Role title" value={form.roleTitle} onChange={(value) => updateField("roleTitle", value)} />
            <TextField label="Department" value={form.department} onChange={(value) => updateField("department", value)} />
            <TextField label="Start date" type="date" value={form.startDate} onChange={(value) => updateField("startDate", value)} />
            <TextField label="Letter number" value={form.letterNumber} onChange={(value) => updateField("letterNumber", value)} />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Printer size={18} aria-hidden="true" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={() => updateField("letterNumber", makeLetterNumber())}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Refresh number
            </button>
          </div>
        </aside>

        <main className="document-print-area rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <AppointmentLetter
            template={template}
            recipientName={form.recipientName}
            roleTitle={form.roleTitle}
            department={form.department}
            startDate={form.startDate}
            letterNumber={form.letterNumber}
          />
        </main>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
