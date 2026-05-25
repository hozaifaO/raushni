import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { getPublicPage, type CmsCard, type CmsSection } from "@/lib/cms/publicContent";
import { InfoCard, PublicHero, PublicSection } from "@/components/Public/PublicSections";

function cardText(item: CmsCard) {
  if (item.location && item.text) return `${item.text} Location: ${item.location}.`;
  return item.text ?? item.summary ?? item.caption ?? "";
}

function renderSection(section: CmsSection) {
  const items = section.items ?? [];
  if (section.layout === "checks") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {(items as string[]).map((item) => (
          <div key={item} className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={20} aria-hidden="true" />
            <p className="text-sm font-semibold leading-6 text-stone-800">{item}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section.layout === "events") {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {(items as CmsCard[]).map((item) => (
          <article key={item.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-orange-700">
              <CalendarDays size={18} aria-hidden="true" />
              {item.date} · {item.time}
            </div>
            <h3 className="mt-4 text-xl font-black text-stone-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-700">{item.text}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-stone-700">
              <MapPin size={16} aria-hidden="true" />
              {item.location}
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (section.layout === "gallery") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(items as CmsCard[]).map((item) => (
          <figure key={item.title} className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <img src={item.image} alt={item.title} className="aspect-[4/3] w-full bg-stone-100 object-contain p-4" />
            <figcaption className="border-t border-stone-200 p-4">
              <p className="font-bold text-stone-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-700">{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  if (section.layout === "news") {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {(items as CmsCard[]).map((item) => (
          <article key={item.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{item.tag}</p>
            <h3 className="mt-3 text-xl font-black leading-snug text-stone-950">{item.title}</h3>
            <p className="mt-2 text-sm font-semibold text-stone-700">{item.date}</p>
            <p className="mt-4 text-sm leading-6 text-stone-700">{item.summary}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(items as CmsCard[]).map((item) => (
        <InfoCard key={item.title} title={item.title} text={cardText(item)} meta={item.meta ?? item.category ?? item.type} />
      ))}
    </div>
  );
}

export default async function CmsManagedPage({ slug }: { slug: string }) {
  const page = await getPublicPage(slug);
  return (
    <>
      <PublicHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        text={page.heroText}
        image={page.heroImage}
        action={page.action}
      />
      {page.sections.map((section) => (
        <PublicSection key={`${page.slug}-${section.title}`} eyebrow={section.eyebrow} title={section.title} text={section.text}>
          {renderSection(section)}
        </PublicSection>
      ))}
    </>
  );
}
