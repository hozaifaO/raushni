import { BadgeCheck, CreditCard, FileText, QrCode, Receipt, ScrollText } from "lucide-react";
import type { CmsDocumentTemplate } from "@/lib/cms/documentTemplates";

const iconMap = {
  member_id: CreditCard,
  donation_receipt: Receipt,
  certificate: BadgeCheck,
  appointment_letter: ScrollText,
  qr_code: QrCode,
};

export default function DocumentTemplateCard({ template }: { template: CmsDocumentTemplate }) {
  const Icon = iconMap[template.category] ?? FileText;
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <Icon size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">{template.category.split("_").join(" ")}</p>
            <h2 className="mt-1 text-xl font-black text-gray-950">{template.name}</h2>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          CMS
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">{template.description}</p>
      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-bold text-gray-950">{template.title}</p>
        <p className="mt-1 text-sm text-gray-600">{template.subtitle}</p>
        <p className="mt-3 text-sm leading-6 text-gray-700">{template.body.replace(/<[^>]+>/g, "")}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {template.placeholders.slice(0, 6).map((placeholder) => (
          <span key={placeholder} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {placeholder}
          </span>
        ))}
      </div>
    </article>
  );
}
