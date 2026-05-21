import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function PublicHero({
  eyebrow,
  title,
  text,
  image = "/assets/brand/raushni-banner.png",
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{text}</p>
          {action && (
            <Link
              href={action.href}
              className="mt-7 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              {action.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
        <img src={image} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
      </div>
    </section>
  );
}

export function PublicSection({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-stone-200 bg-[#fafafa] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">{eyebrow}</p>}
          <h2 className="mt-3 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">{title}</h2>
          {text && <p className="mt-4 text-base leading-7 text-stone-700">{text}</p>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function InfoCard({
  title,
  text,
  meta,
}: {
  title: string;
  text: string;
  meta?: string;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      {meta && <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{meta}</p>}
      <h3 className="mt-2 text-xl font-black text-stone-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </article>
  );
}
