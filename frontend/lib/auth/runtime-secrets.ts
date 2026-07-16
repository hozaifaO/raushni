/**
 * Server-only startup checks for production / auth-required deploys.
 * Import from instrumentation or BFF modules — never from client components.
 */

const PLACEHOLDER_RE = /(change-?me|replace-|dev-internal-api-key|your-?secret|example)/i;

function isPlaceholder(value: string | undefined): boolean {
  const trimmed = (value || "").trim();
  if (!trimmed) return true;
  if (trimmed.length < 32 && PLACEHOLDER_RE.test(trimmed)) return true;
  return PLACEHOLDER_RE.test(trimmed) && trimmed.length < 48;
}

function requireNonEmpty(name: string, value: string | undefined): void {
  if (!value?.trim()) {
    throw new Error(`${name} is required in production / when auth is required.`);
  }
}

function requireSecret(name: string, value: string | undefined): void {
  if (isPlaceholder(value) || (value || "").trim().length < 32) {
    throw new Error(
      `${name} must be a non-placeholder secret (min 32 chars) in production / when auth is required.`,
    );
  }
}

export function shouldEnforceFrontendSecrets(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    String(process.env.NEXT_PUBLIC_REQUIRE_AUTH || "").toLowerCase() === "true" ||
    String(process.env.REQUIRE_AUTH || "").toLowerCase() === "true"
  );
}

export function assertFrontendRuntimeSecrets(): void {
  if (!shouldEnforceFrontendSecrets()) {
    if (!process.env.INTERNAL_API_KEY?.trim()) {
      console.warn("[raushni] INTERNAL_API_KEY is empty — /api/v1 BFF will return 500.");
    }
    if (!process.env.CMS_API_TOKEN?.trim()) {
      console.warn("[raushni] CMS_API_TOKEN is empty — /cms/api BFF will return 500.");
    }
    return;
  }

  requireSecret("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET);
  requireNonEmpty("NEXTAUTH_URL", process.env.NEXTAUTH_URL);
  requireSecret("INTERNAL_API_KEY", process.env.INTERNAL_API_KEY);
  requireSecret("CMS_API_TOKEN", process.env.CMS_API_TOKEN);
  requireNonEmpty("NEXTAUTH_ADMIN_EMAIL", process.env.NEXTAUTH_ADMIN_EMAIL);
  requireNonEmpty("NEXTAUTH_ADMIN_PASSWORD", process.env.NEXTAUTH_ADMIN_PASSWORD);
  requireNonEmpty("NEXTAUTH_STAFF_EMAIL", process.env.NEXTAUTH_STAFF_EMAIL);
  requireNonEmpty("NEXTAUTH_STAFF_PASSWORD", process.env.NEXTAUTH_STAFF_PASSWORD);

  const apiInternal =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_PYTHON_URL ||
    process.env.NEXT_PUBLIC_API_URL;
  if (!apiInternal?.trim()) {
    throw new Error("API_INTERNAL_URL (or NEXT_PUBLIC_API_URL) is required for the BFF upstream.");
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_") && /(SECRET|PASSWORD|API_KEY|TOKEN)/i.test(key)) {
      throw new Error(`${key} must not expose secrets via NEXT_PUBLIC_*.`);
    }
  }
}
