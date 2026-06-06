import Link from "next/link";
import { Award, CreditCard, FileText, QrCode, Receipt, ScrollText } from "lucide-react";
import DocumentTemplateCard from "@/components/Documents/DocumentTemplateCard";
import { listDocumentTemplates } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const templates = await listDocumentTemplates();
  const documentTemplates = templates.filter((template) => template.category !== "certificate");
  const generators = [
    { href: "/documents/id-card", label: "Member ID Card", icon: CreditCard },
    { href: "/documents/donation-receipt", label: "Donation Receipt", icon: Receipt },
    { href: "/documents/invoice", label: "Invoice", icon: FileText },
    { href: "/documents/appointment-letter", label: "Appointment Letter", icon: ScrollText },
    { href: "/documents/certificate", label: "Certificate", icon: Award },
    { href: "/documents/qr-code", label: "QR Code", icon: QrCode },
  ];
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <FileText size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">CMS managed</p>
                <h1 className="mt-1 text-3xl font-black text-gray-950">Document Generation</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                  Member ID cards, donation receipts, appointment letters, QR verification blocks, and PDF wording are managed from Strapi document templates.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {generators.map((generator) => {
            const Icon = generator.icon;
            return (
              <Link
                key={generator.href}
                href={generator.href}
                className="inline-flex min-h-14 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 text-sm font-black text-gray-900 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-orange-100 text-orange-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  {generator.label}
                </span>
                <span className="text-orange-700">Open</span>
              </Link>
            );
          })}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {documentTemplates.map((template) => (
            <DocumentTemplateCard key={template.key} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
