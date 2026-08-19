/**
 * Relative callback URLs only — blocks open redirects (//evil, https://evil).
 * Same-origin absolute URLs are reduced to path+search+hash (client-side).
 */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/dashboard"): string {
  const raw = (value || "").trim();
  if (!raw) {
    return fallback;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
        return safeCallbackUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`, fallback);
      }
    } catch {
      return fallback;
    }
    return fallback;
  }

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  if (raw.includes("\\") || raw.includes("@")) {
    return fallback;
  }
  return raw;
}

const PLACEHOLDER_RE = /(change-?me|replace-|your-?secret|example|ChangeMe@)/i;

export function isPlaceholderCredential(value: string | undefined): boolean {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return true;
  }
  if (trimmed.length < 12 && PLACEHOLDER_RE.test(trimmed)) {
    return true;
  }
  return PLACEHOLDER_RE.test(trimmed);
}

export function authCredentialsRequired(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    String(process.env.NEXT_PUBLIC_REQUIRE_AUTH || "").toLowerCase() === "true" ||
    String(process.env.REQUIRE_AUTH || "").toLowerCase() === "true"
  );
}
