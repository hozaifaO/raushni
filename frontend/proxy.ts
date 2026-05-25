import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const protectedProxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (process.env.NEXT_PUBLIC_REQUIRE_AUTH !== "true") {
    return NextResponse.next();
  }

  return protectedProxy(request as never, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/members/:path*",
    "/beneficiaries/:path*",
    "/crowdfunding/:path*",
    "/internships/:path*",
    "/donations/:path*",
    "/designations/:path*",
    "/documents/:path*",
    "/certificates/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/cms/:path*",
  ],
};
