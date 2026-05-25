import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/types/models/user";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      role?: UserRole;
      accessLevel?: "read" | "write";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    provider?: string;
    role?: UserRole;
  }
}
