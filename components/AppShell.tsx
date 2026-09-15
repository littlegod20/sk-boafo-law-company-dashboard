"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [ready, setReady] = useState(false);

  const isLogin = pathname === "/login";

  useEffect(() => {
    const authed =
      typeof window !== "undefined" &&
      localStorage.getItem("sk_boafo_auth") === "true";

    if (!authed && !isLogin) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [pathname, isLogin, router]);

  // Avoid flash of layout while redirecting
  if (!ready) {
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

  // Login page — no shell
  if (isLogin) return <>{children}</>;

  // Authenticated shell
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
