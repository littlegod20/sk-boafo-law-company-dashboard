"use client";

import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useConvexAuth();
  const isLogin = pathname === "/login";

  // Login page — no shell (middleware already allows /login unauthenticated)
  if (isLogin) return <>{children}</>;

  // Wait for Convex Auth to hydrate before painting the dashboard shell
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0B2349" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: "#C9A227", color: "#0B2349" }}
          >
            SK
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "#F5F7FA",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
