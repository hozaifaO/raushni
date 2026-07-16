import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export type PublicHeroAction = {
  label: string;
  href: string;
};

export type PublicHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  image?: string;
  action?: PublicHeroAction;
};

export function PublicHero({
  eyebrow,
  title,
  text,
  image = "/assets/brand/raushni-banner.png",
  action,
}: PublicHeroProps) {
  return (
    <section className="public-hero border-b border-stone-200 bg-white text-stone-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="public-hero-eyebrow text-sm font-bold uppercase tracking-[0.18em] text-orange-700">{eyebrow}</p>
          <h1 className="public-hero-title mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="public-hero-text mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">{text}</p>
          {action && (
            <Link
              href={action.href}
              className="mt-6 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              {action.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
        <img
          src={image}
          alt=""
          role="presentation"
          className="aspect-[4/3] w-full rounded-lg border border-stone-200 object-cover shadow-sm"
        />
      </div>
    </section>
  );
}

export type PublicSectionProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  children?: ReactNode;
};

export function PublicSection({ eyebrow, title, text, children }: PublicSectionProps) {
  return (
    <section className="border-b border-stone-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">{eyebrow}</p>}
          <h2 className="mt-3 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">{title}</h2>
          {text && <p className="mt-4 text-base leading-7 text-stone-800">{text}</p>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export type InfoCardProps = {
  title: string;
  text: string;
  meta?: string;
};

export function InfoCard({ title, text, meta }: InfoCardProps) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      {meta && <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{meta}</p>}
      <h3 className="mt-2 text-xl font-black text-stone-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-700">{text}</p>
    </article>
  );
}
