import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "S.K. Boafo & Company | Practice Dashboard",
  description: "Legal practice management dashboard for S.K. Boafo & Company — Gye Nyame Chambers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#F5F7FA", margin: 0 }}>
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minWidth: 0 }}>
            <Header />
            <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
