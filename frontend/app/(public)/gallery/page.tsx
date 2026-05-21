import { galleryItems } from "@/lib/public/content";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function Page() {
  return (
    <>
      <PublicHero
        eyebrow="Gallery"
        title="Visual records from programs, campaigns, and trust communications."
        text="A public gallery helps supporters understand the identity, field focus, and community-facing work of Raushni."
      />

      <PublicSection
        eyebrow="Media"
        title="Program and brand gallery"
        text="These assets can be extended through Strapi media management as the public CMS grows."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item) => (
            <figure key={item.title} className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
              <img src={item.image} alt={item.title} className="aspect-[4/3] w-full bg-stone-100 object-contain p-4" />
              <figcaption className="border-t border-stone-200 p-4">
                <p className="font-bold text-stone-950">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </PublicSection>
    </>
  );
}
