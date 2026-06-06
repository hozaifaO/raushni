import CertificateGenerator from "@/components/Documents/Generators/CertificateGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("achievement-certificate");
  return <CertificateGenerator template={template} />;
}
