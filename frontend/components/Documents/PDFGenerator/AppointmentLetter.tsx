import { fallbackDocumentTemplates, type CmsDocumentTemplate } from "@/lib/cms/documentTemplates";

type AppointmentLetterProps = {
  template?: CmsDocumentTemplate;
  recipientName?: string;
  roleTitle?: string;
  startDate?: string;
  department?: string;
  letterNumber?: string;
};

export default function AppointmentLetter({
  template = fallbackDocumentTemplates["appointment-letter"],
  recipientName = "Recipient Name",
  roleTitle = "Program Volunteer",
  startDate = new Date().toLocaleDateString("en-IN"),
  department = "Community Programs",
  letterNumber = "RSH-APT-0000",
}: AppointmentLetterProps) {
  const body = template.body
    .split("${recipient_name}").join(recipientName)
    .split("${role_title}").join(roleTitle);

  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-gray-950">
      <header className="flex items-center gap-4 border-b border-gray-200 pb-5">
        <img src={template.logoUrl} alt="" className="h-20 w-20 rounded-full object-contain" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: template.accentColor }}>{template.subtitle}</p>
          <h1 className="mt-1 text-3xl font-black">{template.title}</h1>
          <p className="mt-1 text-sm text-gray-600">Letter No. {letterNumber}</p>
        </div>
      </header>
      <section className="py-8 text-base leading-8 text-gray-700">
        <p>Dear {recipientName},</p>
        <p className="mt-5">{body}</p>
        <dl className="mt-6 grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div><dt className="inline font-bold">Role:</dt> <dd className="inline">{roleTitle}</dd></div>
          <div><dt className="inline font-bold">Department:</dt> <dd className="inline">{department}</dd></div>
          <div><dt className="inline font-bold">Start date:</dt> <dd className="inline">{startDate}</dd></div>
        </dl>
        <p className="mt-6">{template.footer}</p>
      </section>
      <footer className="flex items-end justify-between border-t border-gray-200 pt-8 text-sm text-gray-600">
        <p>{template.legalNote}</p>
        <div className="min-w-44 border-t border-gray-400 pt-2 text-center font-semibold text-gray-800">{template.signatoryLabel}</div>
      </footer>
    </article>
  );
}
