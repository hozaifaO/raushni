import { Award } from "lucide-react";
import DocumentTemplateCard from "@/components/Documents/DocumentTemplateCard";
import { listDocumentTemplates } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const templates = (await listDocumentTemplates()).filter((template) => template.category === "certificate");
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Award size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">CMS managed</p>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Certificate Templates</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Internship completion and achievement certificate wording, legal notes, signatory labels, QR behavior, and placeholders are configured in Strapi.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <DocumentTemplateCard key={template.key} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
