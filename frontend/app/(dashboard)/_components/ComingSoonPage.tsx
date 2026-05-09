import Link from "next/link";
import { ArrowLeft, CalendarClock, Home } from "lucide-react";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export default function ComingSoonPage({
  title,
  description = "This dashboard section is being prepared and will be available soon.",
}: ComingSoonPageProps) {
  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
            <CalendarClock size={14} aria-hidden="true" />
            Coming soon
          </span>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <CalendarClock size={28} aria-hidden="true" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Dashboard module
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            {description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              <Home size={18} aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
