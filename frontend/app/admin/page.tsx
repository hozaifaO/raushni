import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { canAdmin } from "@/lib/auth/permissions";

/**
 * Site /admin is not Strapi — it requires dashboard login, then sends
 * admins to the CMS editor (or staff to the in-app CMS page).
 */
export default async function AdminEntryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const cmsBase = (
    process.env.NEXT_PUBLIC_CMS_URL ||
    process.env.CMS_INTERNAL_URL ||
    ""
  ).replace(/\/$/, "");

  if (canAdmin(session.user.role) && cmsBase) {
    redirect(`${cmsBase}/admin`);
  }

  // Staff (or admin without CMS URL): stay inside the app CMS helper page.
  redirect("/cms");
}
