"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { DEFAULT_ADMIN_USER, DEFAULT_STAFF_USER, setStoredUser } from "@/lib/auth/permissions";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

export default function LoginForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"), "/dashboard");
  const [email, setEmail] = useState("admin@raushni.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setStoredUser(normalizedEmail === DEFAULT_STAFF_USER.email ? DEFAULT_STAFF_USER : DEFAULT_ADMIN_USER);
    const nextUrl = safeCallbackUrl(result?.url, callbackUrl);
    window.location.href = nextUrl;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("accessToken");
    }
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-elevated p-6 shadow-hard sm:p-8">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/brand/raushni-logo.png"
            alt="Raushni logo"
            width={48}
            height={48}
            className="rounded-full object-contain ring-2 ring-brand/10"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Raushni</p>
            <h1 className="text-2xl font-black text-stone-950">Dashboard login</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Sign in with your admin or staff account for role-based access.
        </p>

        {status === "authenticated" && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Signed in as <span className="font-semibold">{session.user?.email}</span>.
          </div>
        )}

        <form onSubmit={login} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-stone-800">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-950 outline-none transition focus:border-accent focus:ring-2 focus:ring-amber-100"
            />
          </label>
          <label className="block text-sm font-semibold text-stone-800">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 h-11 w-full rounded-lg border border-stone-200 px-3 text-sm text-stone-950 outline-none transition focus:border-accent focus:ring-2 focus:ring-amber-100"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-accent-ink transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            <KeyRound size={18} aria-hidden="true" />
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {status === "authenticated" && (
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Sign out
          </button>
        )}

        <p className="mt-6 flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck size={14} aria-hidden />
          Session-based access · separate from Strapi CMS admin
        </p>
      </section>
    </main>
  );
}
