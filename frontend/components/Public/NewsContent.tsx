import { newsItems } from "@/lib/public/content";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function NewsContent() {
  return (
    <>
      <PublicHero
        eyebrow="News"
        title="Updates from Raushni programs, field teams, and community initiatives."
        text="Follow program progress, volunteer coordination, donor-supported work, and important public announcements."
        image="/assets/images/og-image.jpg"
      />

      <PublicSection
        eyebrow="Latest"
        title="Recent updates"
        text="Stories and announcements are prepared for public transparency and community awareness."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {newsItems.map((item) => (
            <article key={item.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{item.tag}</p>
              <h3 className="mt-3 text-xl font-black leading-snug text-stone-950">{item.title}</h3>
              <p className="mt-2 text-sm font-semibold text-stone-500">{item.date}</p>
              <p className="mt-4 text-sm leading-6 text-stone-600">{item.summary}</p>
            </article>
          ))}
        </div>
      </PublicSection>
    </>
  );
}
