import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { normalizeRole } from "@/lib/auth/permissions";

const adminEmail = process.env.NEXTAUTH_ADMIN_EMAIL ?? "admin@raushni.com";
const adminPassword = process.env.NEXTAUTH_ADMIN_PASSWORD ?? "ChangeMe@12345";
const staffEmail = process.env.NEXTAUTH_STAFF_EMAIL ?? "staff@raushni.com";
const staffPassword = process.env.NEXTAUTH_STAFF_PASSWORD ?? "ChangeMe@12345";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Raushni account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (email === adminEmail.toLowerCase() && password === adminPassword) {
          return {
            id: "raushni-admin",
            name: "Admin User",
            email: adminEmail,
            role: "ADMIN",
          };
        }

        if (email === staffEmail.toLowerCase() && password === staffPassword) {
          return {
            id: "raushni-staff",
            name: "Staff User",
            email: staffEmail,
            role: "STAFF",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = normalizeRole((user as { role?: string }).role);
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
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
