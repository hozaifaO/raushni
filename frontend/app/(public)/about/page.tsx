import { CheckCircle2 } from "lucide-react";
import { focusAreas } from "@/lib/public/content";
import { InfoCard, PublicHero, PublicSection } from "@/components/Public/PublicSections";

const commitments = [
  "Equal access to education, healthcare, and livelihood opportunities",
  "Transparent donor communication and accountable field documentation",
  "Community-led planning rooted in local needs and dignity",
  "Long-term support for children, women, youth, and vulnerable families",
];

export default function Page() {
  return (
    <>
      <PublicHero
        eyebrow="About Raushni"
        title="A public trust working for education, welfare, dignity, and opportunity."
        text="Raushni Educational & Social Welfare Trust supports underserved communities through learning programs, health access, livelihood development, relief, and community mobilization."
      />

      <PublicSection
        eyebrow="Who we are"
        title="Community work with structure, compassion, and accountability."
        text="We believe social welfare is strongest when local families, volunteers, donors, and field teams move together. Our programs focus on practical support that improves daily life while building long-term confidence."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((area) => (
            <InfoCard key={area.title} title={area.title} text={area.text} />
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Our promise"
        title="Every program should be useful, respectful, and measurable."
        text="Raushni’s approach combines field listening, volunteer action, and transparent follow-up so support reaches families in a meaningful way."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {commitments.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={20} aria-hidden="true" />
              <p className="text-sm font-semibold leading-6 text-stone-800">{item}</p>
            </div>
          ))}
        </div>
      </PublicSection>
    </>
  );
}
