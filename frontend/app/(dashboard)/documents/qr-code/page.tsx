import QrCodeGenerator from "@/components/Documents/Generators/QrCodeGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("qr-verification");
  return <QrCodeGenerator template={template} />;
}
