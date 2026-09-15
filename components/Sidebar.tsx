"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";
import { ConfirmDialog } from "./Modal";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "grid" as const },
  { href: "/cases", label: "Case Management", icon: "briefcase" as const },
  { href: "/clients", label: "Clients", icon: "users" as const },
  { href: "/calendar", label: "Court Calendar", icon: "calendar" as const },
  { href: "/approvals", label: "Approvals", icon: "check-circle" as const, badge: 5 },
  { href: "/billing", label: "Billing & Invoices", icon: "receipt" as const },
  { href: "/documents", label: "Documents", icon: "file-text" as const },
  { href: "/staff", label: "Staff & Team", icon: "team" as const },
];

const BOTTOM_ITEMS = [
  { href: "/announcements", label: "Announcements", icon: "bell" as const, badge: 2 },
  { href: "/settings", label: "Settings", icon: "settings" as const },
];

const ROLES = [
  { id: "managing_partner", label: "Managing Partner", color: "#C9A227" },
  { id: "partner", label: "Partner", color: "#2260b8" },
  { id: "associate", label: "Associate", color: "#059669" },
  { id: "paralegal", label: "Paralegal", color: "#D97706" },
  { id: "admin", label: "Admin", color: "#7C3AED" },
];

const PROFILE_MENU = [
  { icon: "user" as const, label: "My Profile" },
  { icon: "settings" as const, label: "Account Settings" },
  { icon: "shield" as const, label: "Change Password" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState("managing_partner");
  const [roleOpen, setRoleOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const currentRole = ROLES.find((r) => r.id === activeRole)!;

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [profileOpen]);

  return (
    <>
      <aside
        className={`flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
        style={{ background: "#0B2349" }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Logo / toggle — fixed so toggle is always visible                */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex-shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {collapsed ? (
            /* Collapsed: just the expand button, centred */
            <div className="flex items-center justify-center py-[18px]">
              <button
                onClick={() => setCollapsed(false)}
                className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                aria-label="Expand sidebar"
              >
                <Icon name="menu" className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded: SK badge + firm name + collapse × */
            <div className="flex items-center gap-3 px-4 py-[18px]">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-lg w-9 h-9 font-bold text-sm"
                style={{ background: "#C9A227", color: "#0B2349" }}
              >
                SK
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm leading-tight truncate">
                  S.K. Boafo & Co.
                </p>
                <p className="text-[11px] leading-tight" style={{ color: "#C9A227" }}>
                  Gye Nyame Chambers
                </p>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="flex-shrink-0 rounded-lg p-1.5 hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
                aria-label="Collapse sidebar"
              >
                <Icon name="x" className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Role Switcher                                                      */}
        {/* ---------------------------------------------------------------- */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: currentRole.color }}
              />
              <span className="text-white text-xs font-medium flex-1 truncate">
                {currentRole.label}
              </span>
              <Icon
                name="chevron-down"
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${roleOpen ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                Role
              </span>
            </button>
            {roleOpen && (
              <div
                className="mt-1 rounded-lg overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setActiveRole(r.id); setRoleOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    <span className={`text-xs ${r.id === activeRole ? "text-white font-medium" : "text-white/70"}`}>
                      {r.label}
                    </span>
                    {r.id === activeRole && (
                      <Icon name="check" className="w-3 h-3 ml-auto text-white/70" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Navigation                                                        */}
        {/* ---------------------------------------------------------------- */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {!collapsed && (
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-2 pb-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Main
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative ${
                  active ? "text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/8"
                } ${collapsed ? "justify-center" : ""}`}
                style={active ? { background: "rgba(201,162,39,0.18)", color: "#fff" } : {}}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: "#C9A227" }}
                  />
                )}
                <Icon
                  name={item.icon}
                  className="w-[18px] h-[18px] flex-shrink-0"
                  strokeWidth={active ? 2 : 1.75}
                />
                {!collapsed && (
                  <>
                    <span className="text-[13px] leading-tight flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none"
                        style={{ background: "#C9A227", color: "#0B2349" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-4 pb-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              General
            </p>
          )}
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative ${
                  active ? "text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/8"
                } ${collapsed ? "justify-center" : ""}`}
                style={active ? { background: "rgba(201,162,39,0.18)" } : {}}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: "#C9A227" }}
                  />
                )}
                <Icon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
                {!collapsed && (
                  <>
                    <span className="text-[13px] flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/* User Profile — with dropdown                                      */}
        {/* ---------------------------------------------------------------- */}
        <div
          ref={profileRef}
          className="relative flex-shrink-0 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* Floating profile menu (above the profile row) */}
          {profileOpen && !collapsed && (
            <div
              className="absolute bottom-full left-2 right-2 mb-1 rounded-xl overflow-hidden py-1 z-20"
              style={{
                background: "#0e2d5c",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              {PROFILE_MENU.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
                  onClick={() => setProfileOpen(false)}
                >
                  <Icon name={item.icon} className="w-4 h-4" style={{ color: "rgba(255,255,255,0.45)" }} />
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {item.label}
                  </span>
                </button>
              ))}
              <div className="mx-3 my-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left"
                onClick={() => { setProfileOpen(false); setConfirmSignOut(true); }}
              >
                <Icon name="log-out" className="w-4 h-4" style={{ color: "#DC2626" }} />
                <span className="text-[13px]" style={{ color: "#DC2626" }}>
                  Sign Out
                </span>
              </button>
            </div>
          )}

          {/* Profile row button */}
          <button
            className={`w-full flex items-center gap-3 py-4 hover:bg-white/5 transition-colors ${
              collapsed ? "justify-center px-0" : "px-4"
            }`}
            onClick={() => !collapsed && setProfileOpen(!profileOpen)}
            title={collapsed ? "S.K. Boafo — Managing Partner" : undefined}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ background: "#C9A227", color: "#0B2349" }}
            >
              SK
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-xs font-medium truncate">S.K. Boafo</p>
                  <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Managing Partner
                  </p>
                </div>
                <Icon
                  name="chevron-down"
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  strokeWidth={2}
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Sign-out confirm dialog — rendered outside the sidebar */}
      <ConfirmDialog
        isOpen={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={() => {
          // In a real app: call auth signOut here
          setConfirmSignOut(false);
        }}
        title="Sign out?"
        message="You will be signed out of the S.K. Boafo & Company dashboard. Any unsaved changes will be lost."
        confirmLabel="Sign Out"
        variant="danger"
      />
    </>
  );
}
