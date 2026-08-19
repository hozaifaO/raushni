import { isPublicApiBffPath, isPublicCmsGetPath } from "@/lib/auth/bff-allowlist";
import { isPlaceholderCredential, safeCallbackUrl } from "@/lib/auth/safe-callback-url";

describe("safeCallbackUrl", () => {
  it("allows relative paths", () => {
    expect(safeCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/admin?x=1")).toBe("/admin?x=1");
  });

  it("rejects open redirects", () => {
    expect(safeCallbackUrl("//evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackUrl("/\\evil")).toBe("/dashboard");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/dashboard");
  });

  it("uses fallback for empty", () => {
    expect(safeCallbackUrl(null, "/login")).toBe("/login");
  });
});

describe("isPlaceholderCredential", () => {
  it("flags empty and ChangeMe defaults", () => {
    expect(isPlaceholderCredential("")).toBe(true);
    expect(isPlaceholderCredential("ChangeMe@12345")).toBe(true);
    expect(isPlaceholderCredential("a-real-long-enough-secret-value")).toBe(false);
  });
});

describe("bff allowlists", () => {
  it("allows public API paths", () => {
    expect(isPublicApiBffPath(["donations", "public"])).toBe(true);
    expect(isPublicApiBffPath(["enquiries", "public"])).toBe(true);
    expect(isPublicApiBffPath(["internships", "applications", "public"])).toBe(true);
    expect(isPublicApiBffPath(["internships", "certificates", "ABC"])).toBe(true);
    expect(isPublicApiBffPath(["members"])).toBe(false);
    expect(isPublicApiBffPath(["donations"])).toBe(false);
  });

  it("allows public CMS GET roots only", () => {
    expect(isPublicCmsGetPath(["landing-pages"])).toBe(true);
    expect(isPublicCmsGetPath(["site-settings"])).toBe(true);
    expect(isPublicCmsGetPath(["users"])).toBe(false);
  });
});
