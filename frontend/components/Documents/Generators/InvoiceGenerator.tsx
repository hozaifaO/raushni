"use client";

import { FileText, Printer, RefreshCw } from "lucide-react";
import { useState } from "react";
import { DocumentShell, TextField } from "@/components/Documents/Generators/DonationReceiptGenerator";
import Invoice from "@/components/Documents/PDFGenerator/Invoice";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";

const today = new Date().toISOString().slice(0, 10);

function invoiceNumber() {
  return `RSH-INV-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function InvoiceGenerator({ template }: { template: CmsDocumentTemplate }) {
  const [form, setForm] = useState({
    invoiceNumber: invoiceNumber(),
    issuedAt: today,
    billTo: "Billing Name",
    billToEmail: "Email not provided",
    billToAddress: "Address not provided",
    itemDescription: "Program service / support",
    quantity: "1",
    unitPrice: "0",
    tax: "0",
    paymentTerms: "Due on receipt",
  });

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <DocumentShell
      title="Invoice"
      icon={<FileText size={22} aria-hidden="true" />}
      controls={
        <>
          <TextField label="Invoice number" value={form.invoiceNumber} onChange={(value) => updateField("invoiceNumber", value)} />
          <TextField label="Issued on" type="date" value={form.issuedAt} onChange={(value) => updateField("issuedAt", value)} />
          <TextField label="Bill to" value={form.billTo} onChange={(value) => updateField("billTo", value)} />
          <TextField label="Bill to email" value={form.billToEmail} onChange={(value) => updateField("billToEmail", value)} />
          <TextField label="Description" value={form.itemDescription} onChange={(value) => updateField("itemDescription", value)} />
          <TextField label="Quantity" value={form.quantity} onChange={(value) => updateField("quantity", value)} />
          <TextField label="Unit price" value={form.unitPrice} onChange={(value) => updateField("unitPrice", value)} />
          <TextField label="Tax / adjustment" value={form.tax} onChange={(value) => updateField("tax", value)} />
          <button type="button" onClick={() => window.print()} className="primary-button"><Printer size={18} />Print / Save PDF</button>
          <button type="button" onClick={() => updateField("invoiceNumber", invoiceNumber())} className="secondary-button"><RefreshCw size={18} />Refresh number</button>
        </>
      }
    >
      <Invoice template={template} {...form} />
    </DocumentShell>
  );
}
