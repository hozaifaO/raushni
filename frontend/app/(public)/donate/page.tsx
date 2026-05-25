import { HeartHandshake } from "lucide-react";
import { getDonationPaymentSettings } from "@/lib/cms/donationSettings";
import { getPublicPage } from "@/lib/cms/publicContent";
import DonationFormPanel from "@/components/Public/DonationFormPanel";
import { PublicHero } from "@/components/Public/PublicSections";

export default async function Page() {
  const page = await getPublicPage("donate");
  const paymentSettings = await getDonationPaymentSettings();
  const highlights = page.sections[0]?.items ?? [];

  return (
    <>
      <PublicHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        text={page.heroText}
        image={page.heroImage}
        action={page.action}
      />
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <HeartHandshake size={24} aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase text-orange-600">{page.sections[0]?.eyebrow ?? page.heroEyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-950">{page.sections[0]?.title ?? page.title}</h2>
          {page.sections[0]?.text && <p className="mt-3 text-sm leading-6 text-gray-800">{page.sections[0].text}</p>}

          <div className="mt-6 grid gap-3 text-sm text-gray-700">
            {highlights.map((item) => {
              const card = typeof item === "string" ? { title: item, text: "" } : item;
              return (
                <div key={card.title} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-gray-950">{card.title}</p>
                  {card.text && <p className="mt-1 leading-6">{card.text}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <DonationFormPanel paymentSettings={paymentSettings} />
      </div>
      </section>
    </>
  );
}
