"use client";

import { Award, Printer, RefreshCw } from "lucide-react";
import { useState } from "react";
import { DocumentShell, TextField } from "@/components/Documents/Generators/DonationReceiptGenerator";
import AchievementCertificate from "@/components/Documents/PDFGenerator/AchievementCertificate";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";

const today = new Date().toISOString().slice(0, 10);

function certificateNumber() {
  return `RSH-ACH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function CertificateGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [form, setForm] = useState({
    recipientName: "Recipient Name",
    achievementTitle: "Community Service",
    certificateNumber: certificateNumber(),
    issuedOn: today,
  });

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <DocumentShell
      title="Achievement Certificate"
      icon={<Award size={22} aria-hidden="true" />}
      controls={
        <>
          <TextField label="Recipient name" value={form.recipientName} onChange={(value) => updateField("recipientName", value)} />
          <TextField label="Achievement title" value={form.achievementTitle} onChange={(value) => updateField("achievementTitle", value)} />
          <TextField label="Certificate number" value={form.certificateNumber} onChange={(value) => updateField("certificateNumber", value)} />
          <TextField label="Issued on" type="date" value={form.issuedOn} onChange={(value) => updateField("issuedOn", value)} />
          <button type="button" onClick={() => window.print()} className="primary-button"><Printer size={18} />Print / Save PDF</button>
          <button type="button" onClick={() => updateField("certificateNumber", certificateNumber())} className="secondary-button"><RefreshCw size={18} />Refresh number</button>
        </>
      }
    >
      <AchievementCertificate template={template} {...form} />
    </DocumentShell>
  );
}
