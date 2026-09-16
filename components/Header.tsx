"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "./Icons";

const PAGE_TITLES: Record<string, string> = {
  "/":              "Dashboard Overview",
  "/cases":         "Case Management",
  "/clients":       "Clients",
  "/calendar":      "Court Calendar",
  "/approvals":     "Approvals",
  "/billing":       "Billing & Invoices",
  "/documents":     "Documents",
  "/staff":         "Staff & Team",
  "/announcements": "Announcements",
  "/settings":      "Settings",
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
  { id: 1, type: "hearing",  title: "Hearing reminder",  body: "Ofori & Sons Ltd. — 18 Sep at 9:00 AM, High Court Accra",              time: "Just now",  read: false },
  { id: 2, type: "approval", title: "Approval needed",   body: "Amended Settlement Agreement — SKB-2026-047 awaiting review",           time: "2 hrs ago", read: false },
  { id: 3, type: "invoice",  title: "Overdue invoice",   body: "INV-2026-038 — GHS 6,800 from Accra Realty Ltd. is 10 days overdue",    time: "1 day ago", read: false },
  { id: 4, type: "case",     title: "Case assigned",     body: "SKB-2026-047 (Ofori & Sons) assigned to A. Mensah",                    time: "2 days ago", read: true  },
  { id: 5, type: "staff",    title: "Staff meeting",     body: "Firm-wide mandatory meeting — Fri 19 Sep at 4:00 PM",                  time: "6 days ago", read: true  },
];

const NOTIF_ICON: Record<NotifType, "calendar" | "check-circle" | "receipt" | "briefcase" | "team"> = {
  hearing:  "calendar",
  approval: "check-circle",
  invoice:  "receipt",
  case:     "briefcase",
  staff:    "team",
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

  const [notifOpen, setNotifOpen]         = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close drawer on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setNotifOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = notifOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [notifOpen]);

  const markAll = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const markOne = (id: number) =>
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <>
      <header
        className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-[#E2E8F0] flex-shrink-0"
        style={{ zIndex: 10, position: "relative" }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] truncate">
            <span style={{ color: "#94A3B8" }}>S.K. Boafo</span>
            {" "}
            <span style={{ color: "#94A3B8" }}>/</span>
            {" "}
            <span className="font-semibold" style={{ color: "#0B2349" }}>{title}</span>
          </h1>
          <p className="text-[11px] text-[#94A3B8]">{today}</p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] min-w-0 w-64 flex-shrink-0">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search cases, clients..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none"
          />
          <kbd className="text-[10px] text-[#94A3B8] bg-[#EAECF0] px-1.5 py-0.5 rounded font-mono flex-shrink-0 leading-none">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors flex-shrink-0"
          onClick={() => setNotifOpen(true)}
          aria-label="Notifications"
        >
          <Icon name="bell" className="w-5 h-5 text-[#64748B]" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none"
              style={{ background: "#DC2626" }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Notification sidebar drawer (fixed, full-height, slides from right) */}
      {/* ---------------------------------------------------------------- */}

      {/* Backdrop */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(11,35,73,0.35)" }}
          onClick={() => setNotifOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white"
        style={{
          width: 360,
          transform: notifOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: notifOpen ? "-8px 0 40px rgba(11,35,73,0.18)" : "none",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-[#F1F5F9]"
          style={{ background: "#0B2349" }}
        >
          <div className="flex items-center gap-2.5">
            <Icon name="bell" className="w-5 h-5 text-white" />
            <span
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: '"Baskerville", "Baskerville Old Face", Georgia, serif' }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-bold rounded-full px-1.5 py-0.5 text-white"
                style={{ background: "#DC2626" }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={() => setNotifOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <Icon name="x" className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-[#F1F5F9] bg-[#FAFBFC] flex-shrink-0">
            <p className="text-[11px] text-[#94A3B8]">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>
            <button
              onClick={markAll}
              className="text-[11px] font-semibold text-[#0B2349] hover:underline"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.map((n) => {
            const nc = NOTIF_COLOR[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markOne(n.id)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left border-b border-[#F8FAFC] last:border-0 transition-colors"
                style={{ background: n.read ? "white" : "#F8FBFF" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: nc.bg }}
                >
                  <Icon
                    name={NOTIF_ICON[n.type]}
                    className="w-[18px] h-[18px]"
                    style={{ color: nc.color } as React.CSSProperties}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-[12px] leading-snug ${n.read ? "text-[#64748B]" : "font-semibold text-[#1e293b]"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#DC2626" }} />
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{n.body}</p>
                  <p className="text-[10px] text-[#C4C9D4] mt-1.5">{n.time}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-[#F1F5F9] bg-[#FAFBFC] flex-shrink-0">
          <button
            onClick={() => setNotifOpen(false)}
            className="w-full rounded-lg py-2 text-[12px] font-medium text-[#0B2349] hover:bg-[#EFF4FF] transition-colors border border-[#E2E8F0]"
          >
            View all announcements
          </button>
        </div>
      </div>
    </>
  );
}
