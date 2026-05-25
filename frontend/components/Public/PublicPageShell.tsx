import type { ReactNode } from "react";
import Footer from "@/components/Layout/Footer";
import PublicHeader from "@/components/Public/PublicHeader";

export default function PublicPageShell({
  children,
  mainClassName = "",
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="public-site min-h-screen bg-white">
      <PublicHeader />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}
