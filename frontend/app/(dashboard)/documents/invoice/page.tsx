import InvoiceGenerator from "@/components/Documents/Generators/InvoiceGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("invoice");
  return <InvoiceGenerator template={template} />;
}
