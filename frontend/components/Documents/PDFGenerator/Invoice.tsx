import { fallbackDocumentTemplates, type CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";
import { documentQrUrl, documentVerificationValue } from "@/lib/documents/qr";

type InvoiceProps = {
  template?: CmsDocumentTemplate;
  invoiceNumber?: string;
  issuedAt?: string;
  billTo?: string;
  billToEmail?: string;
  billToAddress?: string;
  itemDescription?: string;
  quantity?: string;
  unitPrice?: string;
  tax?: string;
  paymentTerms?: string;
  qrCodeUrl?: string;
};

function toMoney(value: string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number.isFinite(amount) ? amount : 0);
}

export default function Invoice({
  template = fallbackDocumentTemplates.invoice,
  invoiceNumber = "RSH-INV-0000",
  issuedAt = new Date().toLocaleDateString("en-IN"),
  billTo = "Billing Name",
  billToEmail = "Email not provided",
  billToAddress = "Address not provided",
  itemDescription = "Program service / support",
  quantity = "1",
  unitPrice = "0",
  tax = "0",
  paymentTerms = "Due on receipt",
  qrCodeUrl,
}: InvoiceProps) {
  const subtotal = Number(quantity || 0) * Number(unitPrice || 0);
  const taxAmount = Number(tax || 0);
  const total = subtotal + taxAmount;
  const qrUrl = qrCodeUrl ?? documentQrUrl(documentVerificationValue("invoice", invoiceNumber));

  return (
    <article className="mx-auto max-w-4xl bg-white p-8 text-gray-950">
      <header className="flex items-start justify-between gap-6 border-b border-gray-300 pb-6">
        <div className="flex gap-4">
          <img src={template.logoUrl} alt="" className="h-24 w-24 rounded-full border border-gray-200 object-contain p-1" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: template.accentColor }}>{template.subtitle}</p>
            <h1 className="mt-2 text-4xl font-black">{template.title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">{template.legalNote}</p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <p className="font-semibold text-gray-500">Invoice no.</p>
          <p className="mt-1 font-bold text-gray-950">{invoiceNumber}</p>
          <p className="mt-3 font-semibold text-gray-500">Issued on</p>
          <p className="mt-1 text-gray-800">{issuedAt}</p>
        </div>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-bold uppercase text-gray-500">Bill to</p>
          <p className="mt-2 text-lg font-black">{billTo}</p>
          <p className="mt-1 text-sm text-gray-600">{billToEmail}</p>
          <p className="mt-2 text-sm text-gray-600">{billToAddress}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-700">
          <p>{template.body}</p>
          <p className="mt-3 font-bold text-gray-950">Payment terms: {paymentTerms}</p>
        </div>
      </section>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-300 bg-gray-50 text-gray-600">
            <th className="p-3">Description</th>
            <th className="p-3 text-right">Qty</th>
            <th className="p-3 text-right">Unit price</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-3 font-semibold">{itemDescription}</td>
            <td className="p-3 text-right">{quantity}</td>
            <td className="p-3 text-right">{toMoney(unitPrice)}</td>
            <td className="p-3 text-right font-bold">{toMoney(String(subtotal))}</td>
          </tr>
        </tbody>
      </table>

      <section className="ml-auto mt-6 grid max-w-sm gap-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><strong>{toMoney(String(subtotal))}</strong></div>
        <div className="flex justify-between"><span>Tax / adjustment</span><strong>{toMoney(String(taxAmount))}</strong></div>
        <div className="flex justify-between border-t border-gray-300 pt-3 text-lg"><span>Total</span><strong>{toMoney(String(total))}</strong></div>
      </section>

      <footer className="mt-8 grid grid-cols-[1fr_112px_1fr] items-end gap-5 border-t border-gray-200 pt-8 text-sm text-gray-600">
        <p>{template.footer}</p>
        <div className="grid h-28 w-28 place-items-center justify-self-center rounded-lg border border-gray-200 bg-white p-2">
          <img src={qrUrl} alt={`QR verification for ${invoiceNumber}`} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-44 border-t border-gray-400 pt-2 text-center font-semibold text-gray-800">{template.signatoryLabel}</div>
      </footer>
    </article>
  );
}
