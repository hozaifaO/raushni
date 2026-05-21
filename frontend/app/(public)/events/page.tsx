import { CalendarDays, MapPin } from "lucide-react";
import { events } from "@/lib/public/content";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function Page() {
  return (
    <>
      <PublicHero
        eyebrow="Events"
        title="Join upcoming camps, orientations, distributions, and community programs."
        text="Events bring volunteers, families, donors, and partners together for focused action in the field."
        action={{ label: "Register as volunteer", href: "/volunteer" }}
      />

      <PublicSection
        eyebrow="Upcoming"
        title="Planned public programs"
        text="Dates may be updated based on field readiness, weather, and partner availability."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {events.map((event) => (
            <article key={event.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-orange-700">
                <CalendarDays size={18} aria-hidden="true" />
                {event.date} · {event.time}
              </div>
              <h3 className="mt-4 text-xl font-black text-stone-950">{event.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{event.text}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-stone-700">
                <MapPin size={16} aria-hidden="true" />
                {event.location}
              </div>
            </article>
          ))}
        </div>
      </PublicSection>
    </>
  );
}
