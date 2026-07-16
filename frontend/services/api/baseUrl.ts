/**
 * Browser: same-origin "" so /api/v1 hits the Next.js BFF.
 * Server: prefer the app public URL so RSC/server fetch also goes through the BFF.
 */
export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  const appUrl =
    process.env.NEXTAUTH_URL ||
    process.env.APP_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_PYTHON_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  );
}
