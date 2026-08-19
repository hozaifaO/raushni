import { Suspense } from "react";

import LoginPage from "./LoginForm";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-brand px-4">
          <p className="text-sm text-amber-100">Loading login…</p>
        </main>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
