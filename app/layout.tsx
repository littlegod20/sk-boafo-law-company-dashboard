import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "S.K. Boafo & Company | Practice Dashboard",
  description:
    "Legal practice management dashboard for S.K. Boafo & Company — Gye Nyame Chambers",
  icons: {
    icon: "https://a.favicon.im/www.skboafoandcompany.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
