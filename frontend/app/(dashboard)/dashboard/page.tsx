import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  Globe2,
  Layers3,
  Server,
  ShieldCheck,
} from "lucide-react";
import { DASHBOARD_MODULES } from "@/lib/auth/modules";

const serviceLinks = [
  {
    name: "Frontend",
    href: "/",
    detail: "Public site, dashboard, auth, and content-driven pages",
    icon: Globe2,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    name: "Backend API",
    href: `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/dashboard/status`,
    detail: "FastAPI status, landing fallback, members, and operational APIs",
    icon: Server,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "Strapi CMS",
    href: "/cms",
    detail: "Landing content, media, publishing workflow, and admin access",
    icon: Layers3,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    name: "Database",
    href: "/settings",
    detail: "PostgreSQL-backed records, migrations, backups, and platform data",
    icon: Database,
    tone: "bg-sky-50 text-sky-700",
  },
];

const contentLinks = [
  { name: "Landing Content", href: "/cms", detail: "Managed in Strapi single type: landing-page" },
  { name: "Public Website", href: "/", detail: "Uses Strapi content with local fallback data" },
  { name: "Preview Workflow", href: "/preview", detail: "CMS preview surface for draft content" },
  {
    name: "API Health",
    href: `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/v1/dashboard/status`,
    detail: "Backend dashboard wiring endpoint",
  },
];

export default function Page() {
  const moduleCount = DASHBOARD_MODULES.reduce((count, group) => count + group.items.length, 0);

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[#f7f7f7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
          <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShieldCheck size={28} aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
              Raushni Management
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-stone-950 sm:text-5xl">
              Dashboard command center
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-700">
              Manage Raushni&apos;s frontend, backend, Strapi CMS, database workflows, operational modules, and public
              content from one professional workspace. Each card links to a configured route or service entry point.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cms"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-stone-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Manage Strapi Content
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-bold text-stone-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-700"
              >
                View Public Site
                <ExternalLink size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Modules", value: moduleCount },
              { label: "Service Areas", value: serviceLinks.length },
              { label: "Content Sources", value: contentLinks.length },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
                <p className="mt-3 text-4xl font-black text-stone-950">{item.value}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Configured
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceLinks.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.name}
                href={service.href}
                className="group rounded-lg border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${service.tone}`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-xl font-black text-stone-950">{service.name}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{service.detail}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-700">
                  Open
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
                  Dashboard Modules
                </p>
                <h2 className="mt-2 text-2xl font-black text-stone-950">Management links</h2>
              </div>
              <p className="text-sm text-stone-500">Routes are generated from the shared module registry.</p>
            </div>

            <div className="mt-6 space-y-6">
              {DASHBOARD_MODULES.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{group.category}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="group flex gap-3 rounded-lg border border-stone-200 bg-[#fbfaf7] p-4 transition hover:border-amber-300 hover:bg-white"
                        >
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Icon size={19} aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-black text-stone-950">{item.name}</span>
                            <span className="mt-1 block text-xs leading-5 text-stone-600">{item.description}</span>
                          </span>
                          <ArrowRight
                            size={16}
                            className="ml-auto mt-1 flex-none text-stone-400 transition group-hover:translate-x-1 group-hover:text-amber-700"
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
              Content & Setup
            </p>
            <h2 className="mt-2 text-2xl font-black text-stone-950">Working references</h2>
            <div className="mt-6 space-y-3">
              {contentLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-stone-200 bg-[#fbfaf7] p-4 transition hover:border-amber-300 hover:bg-white"
                >
                  <span>
                    <span className="block text-sm font-black text-stone-950">{item.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-stone-600">{item.detail}</span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="mt-1 flex-none text-stone-400 transition group-hover:translate-x-1 group-hover:text-amber-700"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-900">Recommended setup flow</p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-emerald-800">
                <li>1. Start database and backend services.</li>
                <li>2. Start Strapi and seed Raushni landing content.</li>
                <li>3. Open CMS from this dashboard and publish updates.</li>
                <li>4. Review public pages and dashboard module links.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
