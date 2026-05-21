"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { publicContact } from "@/lib/public/content";
import { PublicHero, PublicSection } from "@/components/Public/PublicSections";

export default function Page() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PublicHero
        eyebrow="Contact"
        title="Reach the Raushni team for programs, partnerships, volunteering, and donations."
        text="Share your enquiry and the team will route it to the right program or administrative contact."
        image="/assets/brand/raushni-stamp-logo.png"
      />

      <PublicSection
        eyebrow="Connect"
        title="Contact details and enquiry form"
        text="For urgent field coordination, please call. For documents, partnership requests, or volunteer onboarding, email or use the form."
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <p className="text-sm leading-6 text-stone-700">{publicContact.address}</p>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <a className="text-sm font-semibold text-stone-800" href={`tel:${publicContact.phone.replace(/\s/g, "")}`}>
                  {publicContact.phone}
                </a>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-1 shrink-0 text-orange-700" size={20} aria-hidden="true" />
                <a className="text-sm font-semibold text-stone-800" href={`mailto:${publicContact.email}`}>
                  {publicContact.email}
                </a>
              </div>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
            className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            {sent && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Thank you. Your enquiry has been prepared for the Raushni team.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <input required placeholder="Full name" className="min-h-11 rounded-lg border border-stone-300 px-3 outline-none focus:border-orange-500" />
              <input required type="email" placeholder="Email address" className="min-h-11 rounded-lg border border-stone-300 px-3 outline-none focus:border-orange-500" />
            </div>
            <input placeholder="Phone number" className="min-h-11 rounded-lg border border-stone-300 px-3 outline-none focus:border-orange-500" />
            <select className="min-h-11 rounded-lg border border-stone-300 px-3 outline-none focus:border-orange-500" defaultValue="general">
              <option value="general">General enquiry</option>
              <option value="volunteer">Volunteer</option>
              <option value="donation">Donation</option>
              <option value="careers">Careers</option>
              <option value="partnership">Partnership</option>
            </select>
            <textarea required rows={5} placeholder="Message" className="rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-orange-500" />
            <button type="submit" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white">
              <Send size={16} aria-hidden="true" />
              Send enquiry
            </button>
          </form>
        </div>
      </PublicSection>
    </>
  );
}
