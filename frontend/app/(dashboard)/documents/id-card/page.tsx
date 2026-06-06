import MemberIdCardGenerator from "@/components/Documents/Generators/MemberIdCardGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("member-id-card");
  return <MemberIdCardGenerator template={template} />;
}
