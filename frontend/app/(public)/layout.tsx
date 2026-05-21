import type { ReactNode } from "react";
import PublicPageShell from "@/components/Public/PublicPageShell";

export default function SectionLayout({ children }: { children: ReactNode }) {
  return <PublicPageShell>{children}</PublicPageShell>;
}
