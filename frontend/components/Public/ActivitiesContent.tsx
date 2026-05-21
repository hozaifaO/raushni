import { activities } from "@/lib/public/content";
import { InfoCard, PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function ActivitiesContent() {
  return (
    <>
      <PublicHero
        eyebrow="Activities"
        title="Field programs designed around learning, wellbeing, livelihood, and relief."
        text="Raushni activities are practical, recurring, and community-led so families receive support they can actually use."
        image="/assets/images/og-image.jpg"
        action={{ label: "Volunteer with us", href: "/volunteer" }}
      />

      <PublicSection
        eyebrow="Current work"
        title="Programs active across education and welfare priorities."
        text="Each activity is coordinated with volunteers, local stakeholders, and field documentation for stronger follow-up."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => (
            <InfoCard
              key={activity.title}
              title={activity.title}
              text={`${activity.text} Location: ${activity.location}.`}
              meta={`${activity.category} · ${activity.date}`}
            />
          ))}
        </div>
      </PublicSection>
    </>
  );
}
