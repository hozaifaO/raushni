import { fallbackDocumentTemplates, type CmsDocumentTemplate } from "@/lib/cms/documentTemplatesShared";
import { documentQrUrl, documentVerificationValue } from "@/lib/documents/qr";

type AchievementCertificateProps = {
  template?: CmsDocumentTemplate;
  recipientName?: string;
  achievementTitle?: string;
  certificateNumber?: string;
  issuedOn?: string;
  qrCodeSvg?: string;
  qrCodeUrl?: string;
};

export default function AchievementCertificate({
  template = fallbackDocumentTemplates["achievement-certificate"],
  recipientName = "Recipient Name",
  achievementTitle = "Community Service",
  certificateNumber = "RSH-ACH-0000",
  issuedOn = new Date().toLocaleDateString("en-IN"),
  qrCodeSvg,
  qrCodeUrl,
}: AchievementCertificateProps) {
  const qrUrl = qrCodeUrl ?? documentQrUrl(documentVerificationValue("achievement-certificate", certificateNumber));
  return (
    <article className="mx-auto max-w-4xl border-[10px] border-gray-900 bg-white p-10 text-center text-gray-950 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.22em]" style={{ color: template.accentColor }}>{template.name}</p>
      <h1 className="mt-6 text-5xl font-black">{template.title}</h1>
      <p className="mt-5 text-lg text-gray-600">{template.subtitle}</p>
      <p className="mt-4 text-4xl font-black" style={{ color: template.accentColor }}>{recipientName}</p>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-700">{template.body}</p>
      <p className="mt-4 text-base font-bold">{achievementTitle}</p>
      <div className="mt-10 grid grid-cols-[1fr_120px_1fr] items-end gap-6 text-sm text-gray-600">
        <div className="border-t border-gray-400 pt-2">{issuedOn}</div>
        <div className="grid h-28 w-28 place-items-center justify-self-center rounded-lg border border-gray-200 bg-white p-2" dangerouslySetInnerHTML={qrCodeSvg ? { __html: qrCodeSvg } : undefined}>
          {!qrCodeSvg && <img src={qrUrl} alt={`QR verification for ${certificateNumber}`} className="h-full w-full object-contain" />}
        </div>
        <div className="border-t border-gray-400 pt-2">{template.signatoryLabel}</div>
      </div>
      <p className="mt-5 text-xs text-gray-500">{certificateNumber} · {template.footer}</p>
    </article>
  );
}
