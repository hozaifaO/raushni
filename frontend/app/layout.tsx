import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "./AppShell";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raushni | NGO Management",
  description:
    "Raushni Educational & Social Welfare Trust management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
