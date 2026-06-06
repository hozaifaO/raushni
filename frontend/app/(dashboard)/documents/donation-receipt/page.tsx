import DonationReceiptGenerator from "@/components/Documents/Generators/DonationReceiptGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("donation-receipt");
  return <DonationReceiptGenerator template={template} />;
}
