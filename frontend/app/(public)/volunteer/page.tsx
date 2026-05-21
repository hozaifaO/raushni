import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { volunteerRoles } from "@/lib/public/content";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function Page() {
  return (
    <>
      <PublicHero
        eyebrow="Volunteer"
        title="Bring your time, skill, network, or care to community programs."
        text="Volunteers support teaching, camps, field coordination, content, fundraising, relief, and community follow-up."
        action={{ label: "Contact volunteer desk", href: "/contact" }}
      />

      <PublicSection
        eyebrow="Ways to help"
        title="Choose a role that matches your availability and strengths."
        text="You can volunteer weekly, for events, remotely, or during special campaigns."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {volunteerRoles.map((role) => (
            <div key={role} className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={20} aria-hidden="true" />
              <p className="text-sm font-semibold leading-6 text-stone-800">{role}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-black text-stone-950">Volunteer onboarding</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            New volunteers are oriented on program priorities, field conduct, documentation, child
            safety, and reporting expectations before active work begins.
          </p>
          <Link href="/contact" className="mt-4 inline-flex rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white">
            Start volunteering
          </Link>
        </div>
      </PublicSection>
    </>
  );
}
