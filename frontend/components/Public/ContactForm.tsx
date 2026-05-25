"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
    >
      {sent && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Thank you. Your enquiry has been prepared for the team.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <input required placeholder="Full name" className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500" />
        <input required type="email" placeholder="Email address" className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500" />
      </div>
      <input placeholder="Phone number" className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500" />
      <select className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-950 outline-none focus:border-orange-500" defaultValue="general">
        <option value="general">General enquiry</option>
        <option value="volunteer">Volunteer</option>
        <option value="donation">Donation</option>
        <option value="careers">Careers</option>
        <option value="partnership">Partnership</option>
      </select>
      <textarea required rows={5} placeholder="Message" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-950 placeholder:text-stone-500 outline-none focus:border-orange-500" />
      <button type="submit" className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-orange-600 px-5 text-sm font-bold text-white">
        <Send size={16} aria-hidden="true" />
        Send enquiry
      </button>
    </form>
  );
}
