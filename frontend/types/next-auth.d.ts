import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/types/models/user";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      role?: UserRole;
      accessLevel?: "read" | "write";
      tenantSlug?: string;
      organizationId?: string;
    };
  }

  interface User {
    role?: UserRole;
    tenantSlug?: string;
    organizationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    tenantSlug?: string;
    organizationId?: string;
  }
}
