import { fallbackDocumentTemplates, type CmsDocumentTemplate } from "@/lib/cms/documentTemplates";

type MemberIDCardProps = {
  template?: CmsDocumentTemplate;
  memberName?: string;
  memberRole?: string;
  memberId?: string;
  joinedOn?: string;
  phone?: string;
  qrCodeSvg?: string;
};

export default function MemberIDCard({
  template = fallbackDocumentTemplates["member-id-card"],
  memberName = "Member Name",
  memberRole = "Volunteer",
  memberId = "RSH-MEM-0000",
  joinedOn = new Date().toLocaleDateString("en-IN"),
  phone = "+91",
  qrCodeSvg,
}: MemberIDCardProps) {
  return (
    <article className="grid w-[420px] gap-4 rounded-xl border border-gray-200 bg-white p-5 text-gray-950 shadow-sm">
      <header className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <img src={template.logoUrl} alt="" className="h-16 w-16 rounded-full object-contain" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: template.accentColor }}>{template.title}</p>
          <h1 className="text-lg font-black">Raushni Educational & Social Welfare Trust</h1>
          <p className="text-xs text-gray-600">{template.subtitle}</p>
        </div>
      </header>
      <section className="grid grid-cols-[1fr_88px] gap-4">
        <div>
          <p className="text-2xl font-black">{memberName}</p>
          <p className="mt-1 font-semibold" style={{ color: template.accentColor }}>{memberRole}</p>
          <dl className="mt-4 grid gap-1 text-sm text-gray-700">
            <div><dt className="inline font-bold">ID:</dt> <dd className="inline">{memberId}</dd></div>
            <div><dt className="inline font-bold">Joined:</dt> <dd className="inline">{joinedOn}</dd></div>
            <div><dt className="inline font-bold">Phone:</dt> <dd className="inline">{phone}</dd></div>
          </dl>
        </div>
        <div className="grid h-24 w-24 place-items-center rounded-lg border border-gray-200 bg-gray-50 p-2" dangerouslySetInnerHTML={qrCodeSvg ? { __html: qrCodeSvg } : undefined}>
          {!qrCodeSvg && <span className="text-center text-xs font-bold text-gray-500">QR</span>}
        </div>
      </section>
      <footer className="border-t border-gray-200 pt-3 text-xs leading-5 text-gray-600">{template.footer}</footer>
    </article>
  );
}
