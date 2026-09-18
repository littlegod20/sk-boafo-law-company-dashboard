"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!url) return null;
    return new ConvexReactClient(url);
  }, [url]);

  if (!client) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#0B2349" }}
      >
        <div
          className="max-w-md rounded-2xl p-6 text-center"
          style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
        >
          <p className="text-[15px] font-semibold text-[#0B2349] mb-2">
            Missing Convex configuration
          </p>
          <p className="text-[13px] text-[#64748B]">
            Set <code className="font-mono text-[12px]">NEXT_PUBLIC_CONVEX_URL</code> in
            your hosting environment (Cloudflare Pages → Settings → Environment
            variables), then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
