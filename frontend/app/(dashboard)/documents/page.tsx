import { FileText } from "lucide-react";
import DocumentTemplateCard from "@/components/Documents/DocumentTemplateCard";
import { listDocumentTemplates } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const templates = await listDocumentTemplates();
  const documentTemplates = templates.filter((template) => template.category !== "certificate");
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <FileText size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">CMS managed</p>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Document Generation</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Member ID cards, donation receipts, appointment letters, QR verification blocks, and PDF wording are managed from Strapi document templates.
            </p>
          </div>
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
