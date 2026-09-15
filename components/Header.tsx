"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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

type NotifType = "hearing" | "approval" | "invoice" | "case" | "staff";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1, type: "hearing",
    title: "Hearing reminder",
    body: "Ofori & Sons Ltd. — 18 Sep at 9:00 AM, High Court Accra",
    time: "Just now", read: false,
  },
  {
    id: 2, type: "approval",
    title: "Approval needed",
    body: "Amended Settlement Agreement — SKB-2026-047 awaiting review",
    time: "2 hrs ago", read: false,
  },
  {
    id: 3, type: "invoice",
    title: "Overdue invoice",
    body: "INV-2026-038 — GHS 6,800 from Accra Realty Ltd. is 10 days overdue",
    time: "1 day ago", read: false,
  },
  {
    id: 4, type: "case",
    title: "Case assigned",
    body: "SKB-2026-047 (Ofori & Sons) assigned to A. Mensah",
    time: "2 days ago", read: true,
  },
  {
    id: 5, type: "staff",
    title: "Staff meeting",
    body: "Firm-wide mandatory meeting — Fri 19 Sep at 4:00 PM",
    time: "6 days ago", read: true,
  },
];

const NOTIF_ICON: Record<NotifType, "calendar" | "check-circle" | "receipt" | "briefcase" | "team"> = {
  hearing: "calendar",
  approval: "check-circle",
  invoice: "receipt",
  case: "briefcase",
  staff: "team",
};

const NOTIF_COLOR: Record<NotifType, { bg: string; color: string }> = {
  hearing:  { bg: "#EFF4FF", color: "#1d4ed8" },
  approval: { bg: "#ECFDF5", color: "#059669" },
  invoice:  { bg: "#FFF5F5", color: "#DC2626" },
  case:     { bg: "#F5F3FF", color: "#7C3AED" },
  staff:    { bg: "#FFFBEB", color: "#D97706" },
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

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handle = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [notifOpen]);

  const markAll = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const markOne = (id: number) =>
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

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
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            <Icon name="bell" className="w-[18px] h-[18px] text-[#64748B]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5"
                style={{ background: "#DC2626" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
              style={{
                background: "white",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 32px rgba(11,35,73,0.14)",
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#0B2349]">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-white"
                      style={{ background: "#DC2626" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAll}
                    className="text-[11px] font-medium text-[#0B2349] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((n) => {
                  const nc = NOTIF_COLOR[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => markOne(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#FAFBFF] transition-colors border-b border-[#F8FAFC] last:border-0"
                      style={{ background: n.read ? "white" : "#FAFBFF" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: nc.bg }}
                      >
                        <Icon
                          name={NOTIF_ICON[n.type]}
                          className="w-4 h-4"
                          style={{ color: nc.color } as React.CSSProperties}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[12px] leading-snug ${n.read ? "text-[#64748B]" : "font-semibold text-[#1e293b]"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: "#DC2626" }} />
                          )}
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-[#C4C9D4] mt-1">{n.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Panel footer */}
              <div className="px-4 py-3 border-t border-[#F1F5F9] bg-[#FAFBFC]">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-full text-center text-[12px] font-medium text-[#0B2349] hover:underline"
                >
                  View all announcements
                </button>
              </div>
            </div>
          )}
        </div>

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
      </div>
    </header>
  );
}
