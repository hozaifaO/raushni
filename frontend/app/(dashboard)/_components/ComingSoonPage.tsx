"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, Home, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { findDashboardModule } from "@/lib/auth/modules";
import { canAdmin, canWrite, getStoredUser } from "@/lib/auth/permissions";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  const [role, setRole] = useState("GUEST");
  const moduleItem = useMemo(() => findDashboardModule(title), [title]);
  const moduleDescription =
    description ??
    moduleItem?.description ??
    "This dashboard section is configured and ready for module-specific workflows.";
  const hasWriteAccess = canWrite(role);
  const hasAdminAccess = canAdmin(role);
  const accessGranted = moduleItem?.access === "admin" ? hasAdminAccess : moduleItem?.access === "write" ? hasWriteAccess : true;

  useEffect(() => {
    setRole(getStoredUser().role);
  }, []);

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

          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            accessGranted
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}>
            {accessGranted ? <ShieldCheck size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
            {accessGranted ? "Read/write enabled" : "Read only"}
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
            {moduleDescription}
          </p>
          {!accessGranted && (
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-amber-700">
              Login as Admin to create, edit, delete, and configure this module.
            </p>
          )}

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
