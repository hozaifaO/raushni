import { getSiteSettings } from "@/lib/cms/publicContent";
import CertificateVerifyClient from "./CertificateVerifyClient";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, settings] = await Promise.all([params, getSiteSettings()]);

  return <CertificateVerifyClient code={code} brandName={settings.brandShortName} />;
}
