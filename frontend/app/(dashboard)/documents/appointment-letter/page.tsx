import AppointmentLetterGenerator from "@/components/Documents/Generators/AppointmentLetterGenerator";
import { getDocumentTemplate } from "@/lib/cms/documentTemplates";

export default async function Page() {
  const template = await getDocumentTemplate("appointment-letter");
  return <AppointmentLetterGenerator template={template} />;
}
