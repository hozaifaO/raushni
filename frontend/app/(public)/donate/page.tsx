import { HeartHandshake } from "lucide-react";
import { getDonationPaymentSettings } from "@/lib/cms/donationSettings";
import { getPublicPage } from "@/lib/cms/publicContent";
import DonationFormPanel from "@/components/Public/DonationFormPanel";
import { PublicHero } from "@/components/Public/PublicSections";

type DonateSearchParams = {
  payment?: string | string[];
  receipt?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<DonateSearchParams> | DonateSearchParams;
}) {
  const params = await Promise.resolve(searchParams ?? {});
  const payment = firstParam(params.payment);
  const receipt = firstParam(params.receipt);
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
            <p className="mt-6 text-sm font-semibold uppercase text-orange-600">
              {page.sections[0]?.eyebrow ?? page.heroEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">
              {page.sections[0]?.title ?? page.title}
            </h2>
            {page.sections[0]?.text && (
              <p className="mt-3 text-sm leading-6 text-gray-800">{page.sections[0].text}</p>
            )}

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

          <div className="grid gap-4">
            {payment === "success" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-semibold">Payment completed successfully.</p>
                {receipt ? (
                  <p className="mt-1">Receipt reference {receipt} will be verified by the finance team.</p>
                ) : (
                  <p className="mt-1">Thank you. The finance team will verify your donation shortly.</p>
                )}
              </div>
            )}
            {(payment === "cancelled" || payment === "canceled") && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Payment was cancelled.</p>
                {receipt ? (
                  <p className="mt-1">
                    Donation {receipt} remains pending. You can submit again with a UTR when ready.
                  </p>
                ) : (
                  <p className="mt-1">No charge was completed. You can try again below.</p>
                )}
              </div>
            )}
            <DonationFormPanel paymentSettings={paymentSettings} />
          </div>
        </div>
      </section>
    </>
  );
}
