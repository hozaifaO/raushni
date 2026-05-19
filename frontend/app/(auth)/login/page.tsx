"use client";

import Link from "next/link";
import { Eye, LogIn, ShieldCheck } from "lucide-react";
import { signInAsAdmin, signOutToGuest } from "@/lib/auth/permissions";

export default function Page() {
  const continueAsAdmin = () => {
    signInAsAdmin();
    window.location.href = "/dashboard";
  };

  const continueAsGuest = () => {
    signOutToGuest();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-950">Admin login</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Continue as the Raushni admin user to unlock read and write access across dashboard modules, including the CMS entry point.
        </p>

        <button
          type="button"
          onClick={continueAsAdmin}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <LogIn size={18} aria-hidden="true" />
          Login as Admin
        </button>

        <Link
          href="/dashboard"
          onClick={continueAsGuest}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Eye size={18} aria-hidden="true" />
          Continue as Read-only Guest
        </Link>
      </section>
    </main>
  );
}
