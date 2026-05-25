import NextAuth, { type NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { normalizeRole } from "@/lib/auth/permissions";

function keycloakRoles(profile: unknown, account: unknown): string[] {
  const profileRoles = (profile as { realm_access?: { roles?: string[] } } | null)?.realm_access?.roles ?? [];
  const token = (account as { access_token?: string } | null)?.access_token;
  if (!token) return profileRoles;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    const realmRoles = payload?.realm_access?.roles ?? [];
    const clientRoles = Object.values(payload?.resource_access ?? {}).flatMap((entry) =>
      Array.isArray((entry as { roles?: unknown[] }).roles) ? (entry as { roles: string[] }).roles : [],
    );
    return [...profileRoles, ...realmRoles, ...clientRoles];
  } catch {
    return profileRoles;
  }
}

function roleFromProvider(profile: unknown, account: unknown) {
  const roles = keycloakRoles(profile, account).map((role) => role.toUpperCase());
  if (roles.includes("RAUSHNI_ADMIN") || roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("RAUSHNI_STAFF") || roles.includes("STAFF")) return "STAFF";
  return "GUEST";
}

const keycloakInternalIssuer =
  process.env.KEYCLOAK_INTERNAL_ISSUER ??
  process.env.KEYCLOAK_ISSUER ??
  "http://keycloak:8080/realms/raushni";
const keycloakPublicIssuer =
  process.env.KEYCLOAK_PUBLIC_ISSUER ?? process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/raushni";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "raushni-frontend",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "local-dev-secret",
      issuer: keycloakInternalIssuer,
      authorization: {
        url: `${keycloakPublicIssuer}/protocol/openid-connect/auth`,
        params: { scope: "openid email profile" },
      },
      token: `${keycloakInternalIssuer}/protocol/openid-connect/token`,
      userinfo: `${keycloakInternalIssuer}/protocol/openid-connect/userinfo`,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        token.role = roleFromProvider(profile, account);
      }
      token.role = normalizeRole(token.role);
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: normalizeRole(token.role),
        accessLevel: normalizeRole(token.role) === "GUEST" ? "read" : "write",
      };
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
