"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icons";
import { ConfirmDialog, Modal, FormField, ModalFooter, inputCls } from "./Modal";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

// ── Shared personal nav (all non-HR roles) ───────────────────────────────────
const PERSONAL_NAV = [
  { href: "/leave",            label: "My leave",        icon: "umbrella" as const },
  { href: "/my-performance",   label: "My performance",  icon: "trending-up" as const },
  { href: "/attendance",       label: "My attendance",   icon: "clock" as const },
  { href: "/files",            label: "My files",        icon: "folder" as const },
  { href: "/messages",         label: "Messages",        icon: "message-square" as const },
  { href: "/announcements",    label: "Announcements",   icon: "bell" as const, badge: 2 },
  { href: "/training",         label: "Training",        icon: "book-open" as const },
];

const APPROVALS_ITEM = { href: "/approvals", label: "Approvals", icon: "check-circle" as const, badge: 5 };

// Roles that have approval authority
const APPROVER_ROLES = new Set(["managing_partner", "partner", "admin"]);

// ── Per-role work nav ─────────────────────────────────────────────────────────
type NavItem = { href: string; label: string; icon: import("./Icons").IconName; badge?: number };

const WORK_NAV: Record<string, NavItem[]> = {
  managing_partner: [
    { href: "/",          label: "Dashboard",       icon: "grid" },
    { href: "/cases",     label: "Case Management", icon: "briefcase" },
    { href: "/clients",   label: "Clients",         icon: "users" },
    { href: "/calendar",  label: "Court Calendar",  icon: "calendar" },
    { href: "/billing",   label: "Billing & Invoices", icon: "receipt" },
    { href: "/documents", label: "Documents",       icon: "file-text" },
    { href: "/staff",     label: "Staff & Team",    icon: "team" },
  ],
  partner: [
    { href: "/",          label: "Dashboard",       icon: "grid" },
    { href: "/cases",     label: "Case Management", icon: "briefcase" },
    { href: "/clients",   label: "Clients",         icon: "users" },
    { href: "/calendar",  label: "Court Calendar",  icon: "calendar" },
    { href: "/billing",   label: "Billing & Invoices", icon: "receipt" },
    { href: "/documents", label: "Documents",       icon: "file-text" },
  ],
  associate: [
    { href: "/",          label: "Dashboard",       icon: "grid" },
    { href: "/cases",     label: "Case Management", icon: "briefcase" },
    { href: "/clients",   label: "Clients",         icon: "users" },
    { href: "/calendar",  label: "Court Calendar",  icon: "calendar" },
    { href: "/documents", label: "Documents",       icon: "file-text" },
  ],
  paralegal: [
    { href: "/",          label: "Dashboard",       icon: "grid" },
    { href: "/cases",     label: "Case Management", icon: "briefcase" },
    { href: "/calendar",  label: "Court Calendar",  icon: "calendar" },
    { href: "/documents", label: "Documents",       icon: "file-text" },
  ],
  admin: [
    { href: "/",          label: "Dashboard",       icon: "grid" },
    { href: "/clients",   label: "Clients",         icon: "users" },
    { href: "/billing",   label: "Billing & Invoices", icon: "receipt" },
    { href: "/documents", label: "Documents",       icon: "file-text" },
    { href: "/staff",     label: "Staff & Team",    icon: "team" },
  ],
};

// ── HR role nav (OMNI-style) ──────────────────────────────────────────────────
const HR_NAV_MAIN = [
  { href: "/",                 label: "Dashboard",        icon: "grid" as const },
  { href: "/leave",            label: "My leave",         icon: "umbrella" as const },
  { href: "/my-performance",   label: "My performance",   icon: "trending-up" as const },
  { href: "/team-performance", label: "Team performance", icon: "team" as const },
  { href: "/attendance",       label: "My attendance",    icon: "clock" as const },
  { href: "/files",            label: "My files",         icon: "folder" as const },
  { href: "/messages",         label: "Messages",         icon: "message-square" as const },
  { href: "/approvals",        label: "Approvals",        icon: "check-circle" as const, badge: 5 },
  { href: "/announcements",    label: "Announcements",    icon: "bell" as const, badge: 2 },
  { href: "/training",         label: "Training",         icon: "book-open" as const },
];

const HR_PROJECTS = [
  { href: "/projects",  label: "All projects", icon: "layers" as const },
  { href: "/insights",  label: "Insights",     icon: "bar-chart" as const },
];

const HR_SECTION = [
  { href: "/hr/leave",          label: "Leave register",  icon: "calendar" as const },
  { href: "/hr/employees",      label: "Employees",       icon: "users" as const },
  { href: "/hr/attendance",     label: "Attendance",      icon: "clock" as const },
  { href: "/hr/recruitment",    label: "Recruitment",     icon: "briefcase" as const },
  { href: "/hr/onboarding",     label: "Onboarding",      icon: "check-circle" as const },
  { href: "/hr/exit-clearance", label: "Exit clearance",  icon: "log-out" as const },
  { href: "/hr/expense-claims", label: "Expense claims",  icon: "receipt" as const },
];

const ROLES = [
  { id: "managing_partner", label: "Managing Partner", color: "#C9A227" },
  { id: "partner",          label: "Partner",          color: "#2260b8" },
  { id: "associate",        label: "Associate",        color: "#059669" },
  { id: "paralegal",        label: "Paralegal",        color: "#D97706" },
  { id: "admin",            label: "Admin",            color: "#7C3AED" },
  { id: "hr_officer",       label: "HR Officer",       color: "#0891b2" },
];

// Role id → display label (for sidebar display of DB role)
const ROLE_ID_TO_LABEL: Record<string, string> = {
  managing_partner: "Managing Partner",
  partner:          "Partner",
  associate:        "Associate",
  paralegal:        "Paralegal",
  admin:            "Admin",
  hr_officer:       "HR Officer",
};

// Shared nav link renderer used by both role nav sets
function NavLink({
  item,
  pathname,
  collapsed,
  indent = false,
}: {
  item: { href: string; label: string; icon: import("./Icons").IconName; badge?: number };
  pathname: string;
  collapsed: boolean;
  indent?: boolean;
}) {
  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors relative ${
        active ? "text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/8"
      } ${collapsed ? "justify-center" : ""}`}
      style={active ? { background: "rgba(201,162,39,0.18)", color: "#fff" } : {}}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r" style={{ background: "#C9A227" }} />
      )}
      {indent && !collapsed && <span className="w-3 flex-shrink-0" />}
      <Icon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2 : 1.75} />
      {!collapsed && (
        <>
          <span className="text-[13px] leading-tight flex-1">{item.label}</span>
          {item.badge != null && (
            <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none" style={{ background: "#C9A227", color: "#0B2349" }}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { signOut } = useAuthActions();

  // Live user from Convex
  const dbUser = useQuery(api.users.getCurrentUser);

  const [activeRole, setActiveRole]         = useState("managing_partner");
  const [roleOpen, setRoleOpen]             = useState(false);
  const [collapsed, setCollapsed]           = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [projectsOpen, setProjectsOpen]     = useState(true);
  const [hrSectionOpen, setHrSectionOpen]   = useState(true);

  // Modals
  const [showProfile, setShowProfile]             = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwSaved, setPwSaved]                     = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  // Sync activeRole whenever the DB user loads
  useEffect(() => {
    if (dbUser?.role) setActiveRole(dbUser.role);
  }, [dbUser?.role]);

  // Derived display user — use DB record when loaded, sensible fallback while loading
  const loggedUser = {
    name:  dbUser?.name  ?? "Loading…",
    role:  ROLE_ID_TO_LABEL[dbUser?.role ?? ""] ?? "Staff",
    email: dbUser?.email ?? "",
  };

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

  const handleMenuAction = (label: string) => {
    setProfileOpen(false);
    if (label === "My Profile") {
      setShowProfile(true);
    } else if (label === "Account Settings") {
      router.push("/settings");
    } else if (label === "Change Password") {
      setPwForm({ current: "", next: "", confirm: "" });
      setPwError("");
      setPwSaved(false);
      setShowChangePassword(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleChangePassword = () => {
    if (!pwForm.current) { setPwError("Please enter your current password."); return; }
    if (pwForm.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwError("");
    setPwSaved(true);
    setTimeout(() => setShowChangePassword(false), 1200);
  };

  return (
    <>
      <aside
        className={`flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-64"
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
                <Icon name="chevron-right" className="w-5 h-5" />
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
                <Icon name="chevron-left" className="w-4 h-4" strokeWidth={2} />
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
          {activeRole === "hr_officer" ? (
            /* ── HR role nav ── */
            <>
              {HR_NAV_MAIN.map((item) => <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />)}

              {/* Projects group */}
              {!collapsed && (
                <button
                  onClick={() => setProjectsOpen((o) => !o)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1 text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <Icon name="layers" className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] flex-1 text-left">Projects</span>
                  <Icon
                    name="chevron-down"
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${projectsOpen ? "rotate-180" : ""}`}
                    strokeWidth={2.5}
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  />
                </button>
              )}
              {(collapsed || projectsOpen) && HR_PROJECTS.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} indent={!collapsed} />
              ))}

              {/* HR group */}
              {!collapsed && (
                <button
                  onClick={() => setHrSectionOpen((o) => !o)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1 text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <Icon name="team" className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] flex-1 text-left">HR</span>
                  <Icon
                    name="chevron-down"
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${hrSectionOpen ? "rotate-180" : ""}`}
                    strokeWidth={2.5}
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  />
                </button>
              )}
              {(collapsed || hrSectionOpen) && HR_SECTION.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} indent={!collapsed} />
              ))}
            </>
          ) : (
            /* ── Law-firm role nav (role-aware work + shared personal) ── */
            <>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-2 pb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Work
                </p>
              )}
              {(WORK_NAV[activeRole] ?? WORK_NAV.associate).map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
              {APPROVER_ROLES.has(activeRole) && (
                <NavLink item={APPROVALS_ITEM} pathname={pathname} collapsed={collapsed} />
              )}

              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-4 pb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Personal
                </p>
              )}
              {PERSONAL_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
            </>
          )}
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
              {/* User info header inside popover */}
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <p className="text-white text-[13px] font-semibold truncate">{loggedUser.name}</p>
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{loggedUser.email}</p>
              </div>

              {[
                { icon: "user" as const,     label: "My Profile",        color: "#93C5FD" },
                { icon: "settings" as const, label: "Account Settings",  color: "#86EFAC" },
                { icon: "shield" as const,   label: "Change Password",   color: "#FCD34D" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
                  onClick={() => handleMenuAction(item.label)}
                >
                  <Icon name={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-[13px] text-white">
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
            title={collapsed ? `${loggedUser.name} — ${loggedUser.role}` : undefined}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ background: "#C9A227", color: "#0B2349" }}
            >
              {initials(loggedUser.name)}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-xs font-medium truncate">{loggedUser.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {loggedUser.role}
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

      {/* ------------------------------------------------------------------ */}
      {/* Sign-out confirm dialog                                             */}
      {/* ------------------------------------------------------------------ */}
      <ConfirmDialog
        isOpen={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        message="You will be signed out of the S.K. Boafo & Company dashboard. Any unsaved changes will be lost."
        confirmLabel="Sign Out"
        variant="danger"
      />

      {/* ------------------------------------------------------------------ */}
      {/* My Profile modal                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="My Profile">
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: "#0B2349", color: "#C9A227" }}
          >
            {initials(loggedUser.name)}
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#0B2349]">{loggedUser.name}</p>
            <p className="text-[13px] text-[#64748B]">{loggedUser.role}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#E2E8F0] divide-y divide-[#F1F5F9] overflow-hidden">
          {[
            { label: "Email",        value: loggedUser.email },
            { label: "Phone",        value: dbUser?.workPhone ?? "—" },
            { label: "Department",   value: dbUser?.dept ?? "—" },
            { label: "Bar Number",   value: dbUser?.barNumber ?? "—" },
            { label: "Joined",       value: dbUser?.joinedDate ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</span>
              <span className="text-[13px] text-[#1e293b] font-medium">{value}</span>
            </div>
          ))}
        </div>

        <ModalFooter
          onClose={() => setShowProfile(false)}
          confirmLabel="Edit in Account Settings"
          onConfirm={() => { setShowProfile(false); router.push("/settings"); }}
        />
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Change Password modal                                               */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Change Password"
      >
        {pwSaved ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#ECFDF5" }}
            >
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="text-[15px] font-semibold text-[#0B2349]">Password updated</p>
            <p className="text-[13px] text-[#64748B] text-center">Your password has been changed successfully.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <FormField label="Current Password">
                <input
                  type="password"
                  placeholder="Enter current password"
                  className={inputCls}
                  value={pwForm.current}
                  onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwError(""); }}
                />
              </FormField>
              <FormField label="New Password">
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className={inputCls}
                  value={pwForm.next}
                  onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); setPwError(""); }}
                />
              </FormField>
              <FormField label="Confirm New Password">
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className={inputCls}
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwError(""); }}
                />
              </FormField>
              {pwError && (
                <p className="text-[12px] text-[#DC2626] rounded-lg px-3 py-2" style={{ background: "#FFF5F5", border: "1px solid #FCA5A5" }}>
                  {pwError}
                </p>
              )}
            </div>
            <ModalFooter
              onClose={() => setShowChangePassword(false)}
              confirmLabel="Update Password"
              onConfirm={handleChangePassword}
            />
          </>
        )}
      </Modal>
    </>
  );
}
