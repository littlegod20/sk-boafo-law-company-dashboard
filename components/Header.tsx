"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./Icons";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard Overview",
  "/cases": "Case Management",
  "/clients": "Clients",
  "/calendar": "Court Calendar",
  "/approvals": "Approvals",
  "/billing": "Billing & Invoices",
  "/documents": "Documents",
  "/staff": "Staff & Team",
  "/announcements": "Announcements",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "SK Boafo Dashboard";
  const today = new Date().toLocaleDateString("en-GH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-[#E2E8F0] flex-shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-[#0B2349] truncate">{title}</h1>
        <p className="text-[11px] text-[#94A3B8]">{today}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] w-56">
        <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search cases, clients..."
          className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none"
        />
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors">
          <Icon name="bell" className="w-4.5 h-4.5 text-[#64748B]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#E2E8F0]" />

        {/* New Case button */}
        <button
          className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white transition-colors"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
          New Case
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ml-1"
          style={{ background: "#C9A227", color: "#0B2349" }}
          title="S.K. Boafo — Managing Partner"
        >
          SK
        </div>
      </div>
    </header>
  );
}
