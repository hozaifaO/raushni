"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  Sprout,
} from "lucide-react";
import PublicPageShell from "@/components/Public/PublicPageShell";

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

const defaultFocusAreas = [
  { title: "Education", text: "Learning support, digital literacy, mentorship, and school readiness.", icon: BookOpen },
  { title: "Healthcare", text: "Basic care access, nutrition awareness, and community health camps.", icon: HeartPulse },
  { title: "Livelihood", text: "Skills, self-help groups, and pathways toward dignified income.", icon: Heart },
  { title: "Environment", text: "Tree plantation, cleanliness drives, and local sustainability action.", icon: Sprout },
];

const defaultStories = [
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

const defaultVolunteerWays = ["Teach or mentor", "Support health camps", "Document stories", "Coordinate relief", "Sponsor learning material"];

const iconMap = {
  education: BookOpen,
  healthcare: HeartPulse,
  health: HeartPulse,
  livelihood: Heart,
  environment: Sprout,
};

type FocusArea = {
  title: string;
  text: string;
  icon: typeof BookOpen;
};

type Story = {
  title: string;
  text: string;
};

type LandingContent = {
  title: string;
  heroEyebrow: string;
  heroSubtitle: string;
  aboutHeading: string;
  vision: string;
  missionHeading: string;
  mission: string;
  focusAreas: FocusArea[];
  objectives: string[];
  successHeading: string;
  successIntro: string;
  stories: Story[];
  volunteerHeading: string;
  volunteerIntro: string;
  volunteerWays: string[];
  contactHeading: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  assets: {
    logo: string;
    banner: string;
    video: string;
  };
};

type StrapiMedia = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  url?: string;
};

type StrapiLandingAttributes = Partial<
  Omit<LandingContent, "focusAreas" | "objectives" | "stories" | "volunteerWays" | "assets">
> & {
  focusAreas?: Array<{ title?: string; text?: string }>;
  objectives?: string;
  successStories?: string;
  volunteerWays?: string[];
  logo?: StrapiMedia;
  banner?: StrapiMedia;
  heroVideo?: StrapiMedia;
};

const defaultLandingContent: LandingContent = {
  title: "Raushni Educational & Social Welfare Trust",
  heroEyebrow: "Community-led education, healthcare, and dignity",
  heroSubtitle:
    "A beacon of hope for equal access to quality education, essential healthcare, and dignified livelihood opportunities.",
  aboutHeading: "Lighting pathways out of poverty and illiteracy.",
  vision:
    "Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every individual, irrespective of socio-economic background, has equal access to quality education, essential healthcare, and dignified livelihood opportunities. We empower communities to break cycles of poverty and participate actively in the nation's progress.",
  missionHeading: "Sustainable change, one life at a time.",
  mission: "To empower underserved communities through quality education, healthcare access, skill development, and social welfare programs.",
  focusAreas: defaultFocusAreas,
  objectives,
  successHeading: "Progress shaped by community trust.",
  successIntro:
    "Every initiative begins with listening. Our programs are designed around local needs, volunteer action, and measurable dignity for families.",
  stories: defaultStories,
  volunteerHeading: "Bring your time, skill, network, or care.",
  volunteerIntro:
    "Volunteers support teaching, health camps, field coordination, content, fundraising, disaster relief, and community mobilization. Every contribution helps a family move with more confidence.",
  volunteerWays: defaultVolunteerWays,
  contactHeading: "Let's build a more equitable community.",
  contactAddress: "Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113",
  contactPhone: "+91 997 3955 7600",
  contactEmail: "info@raushni.com",
  assets: {
    logo: "/assets/brand/raushni-logo.png",
    banner: "/assets/brand/raushni-banner.png",
    video: "/assets/videos/raushni-community.mp4",
  },
};

const styles = {
  section: "scroll-mt-24 border-b border-stone-200 bg-white px-4 py-24 sm:px-6 lg:px-8",
  sectionInner: "mx-auto max-w-7xl",
  eyebrow: "text-sm font-bold uppercase tracking-[0.18em] text-amber-700",
  heading: "mt-4 text-4xl font-black leading-tight text-stone-950 sm:text-5xl",
  body: "text-lg leading-9 text-stone-800",
  card: "rounded-lg border border-stone-200 bg-white p-6 shadow-sm",
  primaryButton:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2",
  secondaryButton:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#120f0b]",
};

function resolveMediaUrl(media: StrapiMedia | undefined, fallback: string) {
  const url = media?.data?.attributes?.url ?? media?.url;

  if (!url) {
    return fallback;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${process.env.NEXT_PUBLIC_CMS_URL ?? ""}${url}`;
}

function parseRichTextList(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  const items = value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

function parseStories(value: string | undefined, fallback: Story[]) {
  if (!value) {
    return fallback;
  }

  const items = parseRichTextList(value, []).map((item, index) => {
    const [title, ...rest] = item.split(":");
    return {
      title: rest.length > 0 ? title.trim() : fallback[index]?.title ?? `Story ${index + 1}`,
      text: rest.length > 0 ? rest.join(":").trim() : item,
    };
  });

  return items.length > 0 ? items : fallback;
}

function normalizeFocusAreas(value: StrapiLandingAttributes["focusAreas"], fallback: FocusArea[]) {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  return value
    .filter((area) => area.title || area.text)
    .map((area, index) => {
      const title = area.title ?? fallback[index]?.title ?? "Focus Area";
      const icon = iconMap[title.toLowerCase() as keyof typeof iconMap] ?? fallback[index]?.icon ?? Heart;

      return {
        title,
        text: area.text ?? fallback[index]?.text ?? "",
        icon,
      };
    });
}

function normalizeLandingContent(attributes: StrapiLandingAttributes): LandingContent {
  return {
    ...defaultLandingContent,
    title: attributes.title ?? defaultLandingContent.title,
    heroEyebrow: attributes.heroEyebrow ?? defaultLandingContent.heroEyebrow,
    heroSubtitle: attributes.heroSubtitle ?? defaultLandingContent.heroSubtitle,
    aboutHeading: attributes.aboutHeading ?? defaultLandingContent.aboutHeading,
    vision: attributes.vision ?? defaultLandingContent.vision,
    missionHeading: attributes.missionHeading ?? defaultLandingContent.missionHeading,
    mission: attributes.mission ?? defaultLandingContent.mission,
    focusAreas: normalizeFocusAreas(attributes.focusAreas, defaultLandingContent.focusAreas),
    objectives: parseRichTextList(attributes.objectives, defaultLandingContent.objectives),
    successHeading: attributes.successHeading ?? defaultLandingContent.successHeading,
    successIntro: attributes.successIntro ?? defaultLandingContent.successIntro,
    stories: parseStories(attributes.successStories, defaultLandingContent.stories),
    volunteerHeading: attributes.volunteerHeading ?? defaultLandingContent.volunteerHeading,
    volunteerIntro: attributes.volunteerIntro ?? defaultLandingContent.volunteerIntro,
    volunteerWays: Array.isArray(attributes.volunteerWays) ? attributes.volunteerWays : defaultLandingContent.volunteerWays,
    contactHeading: attributes.contactHeading ?? defaultLandingContent.contactHeading,
    contactAddress: attributes.contactAddress ?? defaultLandingContent.contactAddress,
    contactPhone: attributes.contactPhone ?? defaultLandingContent.contactPhone,
    contactEmail: attributes.contactEmail ?? defaultLandingContent.contactEmail,
    assets: {
      logo: resolveMediaUrl(attributes.logo, defaultLandingContent.assets.logo),
      banner: resolveMediaUrl(attributes.banner, defaultLandingContent.assets.banner),
      video: resolveMediaUrl(attributes.heroVideo, defaultLandingContent.assets.video),
    },
  };
}

export default function HomePage() {
  const [landingContent, setLandingContent] = useState(defaultLandingContent);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLandingContent() {
      try {
        const response = await fetch("/cms/api/landing-page?populate=*", {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const attributes = payload?.data?.attributes;

        if (attributes) {
          setLandingContent(normalizeLandingContent(attributes));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Unable to load Strapi landing content", error);
        }
      }
    }

    loadLandingContent();

    return () => controller.abort();
  }, []);

  return (
    <PublicPageShell mainClassName="bg-white text-stone-950">
      <section id="top" className="relative flex min-h-[92vh] items-end overflow-hidden bg-stone-950 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
              src={landingContent.assets.video}
          autoPlay
          muted
          loop
          playsInline
          poster={landingContent.assets.banner}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-[#120f0b]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-32 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-black/25 px-4 py-2 text-sm font-semibold text-amber-100">
              <PlayCircle size={18} aria-hidden="true" />
              {landingContent.heroEyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
              {landingContent.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/88 sm:text-xl">
              {landingContent.heroSubtitle}
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
              src={landingContent.assets.banner}
              alt="Raushni brand banner"
              className="aspect-[3/2] w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      <section id="about" className={styles.section}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className={styles.eyebrow}>About Us</p>
            <h2 className={styles.heading}>
              {landingContent.aboutHeading}
            </h2>
          </div>
          <p className={styles.body}>
            {landingContent.vision}
          </p>
        </div>
      </section>

      <section id="mission" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className="max-w-3xl">
            <p className={styles.eyebrow}>Our Mission</p>
            <h2 className={styles.heading}>
              {landingContent.missionHeading}
            </h2>
            <p className={`${styles.body} mt-5`}>
              {landingContent.mission}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {landingContent.focusAreas.map((area) => {
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
                  <p className="mt-3 text-sm leading-6 text-stone-700">{area.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {landingContent.objectives.map((objective) => (
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

      <section id="success" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className={styles.eyebrow}>Success Stories</p>
              <h2 className={styles.heading}>
                {landingContent.successHeading}
              </h2>
            </div>
            <p className="text-lg leading-8 text-stone-700">
              {landingContent.successIntro}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {landingContent.stories.map((story) => (
              <article key={story.title} className={styles.card}>
                <h3 className="text-xl font-black text-stone-950">{story.title}</h3>
                <p className="mt-4 text-sm leading-7 text-stone-700">{story.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="volunteer" className={styles.section}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className={styles.eyebrow}>Volunteer</p>
            <h2 className={styles.heading}>
              {landingContent.volunteerHeading}
            </h2>
            <p className={`${styles.body} mt-5 max-w-3xl`}>
              {landingContent.volunteerIntro}
            </p>
          </div>
          <div className={styles.card}>
            <h3 className="text-2xl font-black text-stone-950">Ways to help</h3>
            <div className="mt-5 grid gap-3">
              {landingContent.volunteerWays.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-stone-800">
                  <CheckCircle2 className="text-emerald-700" size={18} aria-hidden="true" />
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

      <section id="contact" className="scroll-mt-24 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className={styles.eyebrow}>Contact</p>
            <h2 className={styles.heading}>
              {landingContent.contactHeading}
            </h2>
            <div className="mt-8 space-y-4 text-stone-700">
              <p className="flex gap-3">
                <MapPin className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                {landingContent.contactAddress}
              </p>
              <p className="flex gap-3">
                <Phone className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                {landingContent.contactPhone}
              </p>
              <p className="flex gap-3">
                <Mail className="mt-1 flex-none text-amber-700" size={20} aria-hidden="true" />
                {landingContent.contactEmail}
              </p>
            </div>
          </div>

          <form className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-stone-800">Name</span>
                <input className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-stone-800">Phone or email</span>
                <input className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-stone-950 placeholder:text-stone-500 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-stone-800">Message</span>
              <textarea className="mt-2 min-h-32 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-stone-950 placeholder:text-stone-500 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
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
    </PublicPageShell>
  );
}
