"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  Menu,
  Phone,
  PlayCircle,
  Sprout,
  X,
} from "lucide-react";
import Footer from "@/components/Layout/Footer";

const navItems = [
  { label: "About Us", href: "#about" },
  { label: "Our Mission", href: "#mission" },
  { label: "Success Stories", href: "#success" },
  { label: "Volunteer", href: "#volunteer" },
  { label: "Contact", href: "#contact" },
];

const objectives = [
  "Formal and digital education for children and adults",
  "Healthcare and nutrition access for marginalized families",
  "Vocational training, self-help groups, and sustainable livelihoods",
  "Women and adolescent girls' safety, dignity, and economic independence",
  "Tree plantation, waste management, and environmental care",
  "Digital and financial inclusion for rural communities",
  "Emergency relief during natural disasters",
  "Community mobilization, advocacy, and strategic partnerships",
];

const focusAreas = [
  { title: "Education", text: "Learning support, digital literacy, mentorship, and school readiness.", icon: BookOpen },
  { title: "Healthcare", text: "Basic care access, nutrition awareness, and community health camps.", icon: HeartPulse },
  { title: "Livelihood", text: "Skills, self-help groups, and pathways toward dignified income.", icon: Heart },
  { title: "Environment", text: "Tree plantation, cleanliness drives, and local sustainability action.", icon: Sprout },
];

const stories = [
  {
    title: "A classroom closer to home",
    text: "Children from underserved families receive structured learning support, books, and mentoring that keeps them connected to school.",
  },
  {
    title: "Women building income",
    text: "Self-help group training helps women gain confidence, manage savings, and explore small-enterprise opportunities.",
  },
  {
    title: "Relief with dignity",
    text: "During emergencies, volunteers coordinate food, medicine, and essentials through local community networks.",
  },
];

const styles = {
  section: "scroll-mt-24 border-b border-stone-200 px-4 py-24 sm:px-6 lg:px-8",
  sectionInner: "mx-auto max-w-7xl",
  eyebrow: "text-sm font-bold uppercase tracking-[0.18em] text-amber-700",
  eyebrowDark: "text-sm font-bold uppercase tracking-[0.18em] text-amber-300",
  heading: "mt-4 text-4xl font-black leading-tight text-stone-950 sm:text-5xl",
  body: "text-lg leading-9 text-stone-700",
  card: "rounded-lg border border-stone-200 bg-white p-6 shadow-sm",
  primaryButton:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2",
  secondaryButton:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#120f0b]",
  darkPanel: "rounded-lg border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/20",
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeItems = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: item.href === `#${activeSection}`,
      })),
    [activeSection],
  );

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((section): section is Element => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen bg-[#faf7f2] text-stone-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-[#120f0b]/80 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Raushni home">
            <img
              src="/assets/brand/raushni-logo.png"
              alt="Raushni Educational and Social Welfare Trust logo"
              className="h-14 w-14 rounded-2xl object-contain"
            />
            <span className="hidden text-sm font-bold uppercase leading-tight tracking-wide sm:block">
              Raushni
              <span className="block text-[11px] font-medium text-amber-100">Educational & Social Welfare Trust</span>
            </span>
          </a>

          <nav className="hidden items-center justify-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 md:flex">
            {activeItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  item.active ? "bg-white text-stone-950" : "text-white/86 hover:bg-white/10 hover:text-amber-100"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#volunteer"
            className="hidden min-h-10 items-center justify-center rounded-full bg-amber-400 px-4 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] md:inline-flex"
          >
            Join Us
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#120f0b] px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {activeItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                    item.active ? "bg-white text-stone-950" : "text-white hover:bg-white/10 hover:text-amber-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section id="top" className="relative flex min-h-[92vh] items-end overflow-hidden bg-stone-950 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="/assets/videos/raushni-community.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/brand/raushni-banner.png"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-[#120f0b]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-black/25 px-4 py-2 text-sm font-semibold text-amber-100">
              <PlayCircle size={18} aria-hidden="true" />
              Community-led education, healthcare, and dignity
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
              Raushni Educational & Social Welfare Trust
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/88 sm:text-xl">
              A beacon of hope for equal access to quality education, essential healthcare, and dignified livelihood opportunities.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#mission"
                className={styles.primaryButton}
              >
                Explore Our Work
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className={styles.secondaryButton}
              >
                Contact the Trust
              </a>
            </div>
          </div>

          <div className="hidden self-end rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md lg:block">
            <img
              src="/assets/brand/raushni-banner.png"
              alt="Raushni brand banner"
              className="aspect-[3/2] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section id="about" className={`${styles.section} bg-[#faf7f2]`}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className={styles.eyebrow}>About Us</p>
            <h2 className={styles.heading}>
              Lighting pathways out of poverty and illiteracy.
            </h2>
          </div>
          <p className={styles.body}>
            Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every individual,
            irrespective of socio-economic background, has equal access to quality education, essential healthcare,
            and dignified livelihood opportunities. We empower communities to break cycles of poverty and participate
            actively in the nation&apos;s progress.
          </p>
        </div>
      </section>

      <section id="mission" className={`${styles.section} bg-[#f4efe7]`}>
        <div className={styles.sectionInner}>
          <div className="max-w-3xl">
            <p className={styles.eyebrow}>Our Mission</p>
            <h2 className={styles.heading}>
              Sustainable change, one life at a time.
            </h2>
            <p className={`${styles.body} mt-5`}>
              To empower underserved communities through quality education, healthcare access, skill development,
              and social welfare programs.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              return (
                <article
                  key={area.title}
                  className={`${styles.card} transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-stone-950">{area.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{area.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {objectives.map((objective) => (
              <div
                key={objective}
                className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-4 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 flex-none text-emerald-700" size={20} aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-stone-800">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="success" className={`${styles.section} bg-[#faf7f2]`}>
        <div className={styles.sectionInner}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className={styles.eyebrow}>Success Stories</p>
              <h2 className={styles.heading}>
                Progress shaped by community trust.
              </h2>
            </div>
            <p className="text-lg leading-8 text-stone-700">
              Every initiative begins with listening. Our programs are designed around local needs, volunteer action,
              and measurable dignity for families.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stories.map((story) => (
              <article key={story.title} className={styles.card}>
                <h3 className="text-xl font-black text-stone-950">{story.title}</h3>
                <p className="mt-4 text-sm leading-7 text-stone-700">{story.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="volunteer" className="scroll-mt-24 bg-[#120f0b] px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className={styles.eyebrowDark}>Volunteer</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Bring your time, skill, network, or care.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-white/78">
              Volunteers support teaching, health camps, field coordination, content, fundraising, disaster relief,
              and community mobilization. Every contribution helps a family move with more confidence.
            </p>
          </div>
          <div className={styles.darkPanel}>
            <h3 className="text-2xl font-black">Ways to help</h3>
            <div className="mt-5 grid gap-3">
              {["Teach or mentor", "Support health camps", "Document stories", "Coordinate relief", "Sponsor learning material"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/88">
                  <CheckCircle2 className="text-amber-300" size={18} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <a
              href="#contact"
              className={`${styles.primaryButton} mt-7 min-h-11 px-5`}
            >
              Start Volunteering
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-[#faf7f2] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className={styles.eyebrow}>Contact</p>
            <h2 className={styles.heading}>
              Let&apos;s build a more equitable community.
            </h2>
            <div className="mt-8 space-y-4 text-stone-700">
              <p className="flex gap-3">
                <MapPin className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113
              </p>
              <p className="flex gap-3">
                <Phone className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                +91 997 3955 7600
              </p>
              <p className="flex gap-3">
                <Mail className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                info@raushni.com
              </p>
            </div>
          </div>

          <form className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-stone-800">Name</span>
                <input className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-stone-800">Phone or email</span>
                <input className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 px-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-stone-800">Message</span>
              <textarea className="mt-2 min-h-32 w-full rounded-lg border border-stone-300 px-3 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
            </label>
            <button
              type="button"
              className={`${styles.primaryButton} mt-5 min-h-11 px-6`}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
