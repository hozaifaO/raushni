import Link from "next/link";
import { careerOpenings } from "@/lib/public/content";
import { InfoCard, PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function Page() {
  return (
    <>
      <PublicHero
        eyebrow="Careers"
        title="Work with a team focused on practical, accountable community impact."
        text="Raushni welcomes people who are comfortable with field realities, documentation, coordination, and respectful communication."
        image="/assets/brand/raushni-logo.png"
        action={{ label: "Contact hiring team", href: "/contact" }}
      />

      <PublicSection
        eyebrow="Open roles"
        title="Current opportunities"
        text="Openings may be full-time, part-time, contract, or volunteer-to-role depending on program needs."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {careerOpenings.map((opening) => (
            <InfoCard
              key={opening.title}
              title={opening.title}
              text={`${opening.text} Location: ${opening.location}.`}
              meta={opening.type}
            />
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-5">
          <p className="font-bold text-stone-950">How to apply</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            Send your profile, preferred role, availability, and relevant field or coordination
            experience through the contact page.
          </p>
          <Link href="/contact" className="mt-4 inline-flex rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white">
            Send enquiry
          </Link>
        </div>
      </PublicSection>
    </>
  );
}
