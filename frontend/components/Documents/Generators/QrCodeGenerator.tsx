"use client";

import { Printer, QrCode } from "lucide-react";
import { useState } from "react";
import { DocumentShell, TextField } from "@/components/Documents/Generators/DonationReceiptGenerator";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";
import { documentQrUrl } from "@/lib/documents/qr";

export default function QrCodeGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [value, setValue] = useState("https://raushni-dev.com");
  const [label, setLabel] = useState("Raushni verification");

  return (
    <DocumentShell
      title="QR Verification Block"
      icon={<QrCode size={22} aria-hidden="true" />}
      controls={
        <>
          <TextField label="Label" value={label} onChange={setLabel} />
          <TextField label="QR value / URL" value={value} onChange={setValue} />
          <button type="button" onClick={() => window.print()} className="primary-button"><Printer size={18} />Print / Save PDF</button>
        </>
      }
    >
      <article className="mx-auto grid max-w-xl place-items-center gap-6 bg-white p-10 text-center text-gray-950">
        <img src={template.logoUrl || "/assets/brand/raushni-logo.png"} alt="" className="h-24 w-24 rounded-full object-contain" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: template.accentColor }}>{template.title}</p>
          <h1 className="mt-2 text-3xl font-black">{label}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{template.body}</p>
        </div>
        <div className="grid h-56 w-56 place-items-center rounded-lg border border-gray-200 bg-white p-4">
          <img src={documentQrUrl(value)} alt={`QR for ${label}`} className="h-full w-full object-contain" />
        </div>
        <p className="break-all text-xs text-gray-500">{value}</p>
        <p className="text-xs text-gray-500">{template.footer}</p>
      </article>
    </DocumentShell>
  );
}
