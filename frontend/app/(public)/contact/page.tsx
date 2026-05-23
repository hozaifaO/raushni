import { Mail, MapPin, Phone } from "lucide-react";
import { getPublicPage, getSiteSettings } from "@/lib/cms/publicContent";
import ContactForm from "@/components/Public/ContactForm";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default async function Page() {
  const [page, settings] = await Promise.all([getPublicPage("contact"), getSiteSettings()]);
  const primarySection = page.sections[0];

  return (
    <>
      <PublicHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        text={page.heroText}
        image={page.heroImage}
        action={page.action}
      />

      <PublicSection
        eyebrow={primarySection?.eyebrow ?? "Connect"}
        title={primarySection?.title ?? "Contact details and enquiry form"}
        text={primarySection?.text}
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <p className="text-sm leading-6 text-stone-700">{settings.contactAddress}</p>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <a className="text-sm font-semibold text-stone-800" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
                  {settings.contactPhone}
                </a>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <a className="text-sm font-semibold text-stone-800" href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </PublicSection>
    </>
  );
}
