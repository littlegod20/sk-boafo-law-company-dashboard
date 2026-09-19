"use client";

import Link from "next/link";
import { Icon } from "@/components/Icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ATTENDANCE_TODAY = [
  { name: "S.K. Boafo", role: "Managing Partner", status: "Present" },
  { name: "Kojo Frimpong", role: "Partner", status: "Present" },
  { name: "Abena Asante", role: "Associate", status: "Late" },
  { name: "Kofi Mensah", role: "Associate", status: "Present" },
  { name: "Ama Darko", role: "Paralegal", status: "Absent" },
  { name: "Yaa Bonsu", role: "HR Officer", status: "Present" },
  { name: "Efua Agyeman", role: "Associate", status: "On Leave" },
  { name: "Nana Acheampong", role: "Admin", status: "Present" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Present: { bg: "#ECFDF5", text: "#059669" },
  Late: { bg: "#FFFBEB", text: "#D97706" },
  Absent: { bg: "#FFF5F5", text: "#DC2626" },
  "On Leave": { bg: "#F1F5F9", text: "#64748B" },
  Pending: { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "#F1F5F9", text: "#64748B" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
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

export default function DashboardPage() {
  const leaveRequests = useQuery(api.leave.listAll) ?? [];
  const announcements = useQuery(api.announcements.list) ?? [];
  const users = useQuery(api.users.list) ?? [];
  const courses = useQuery(api.training.listCourses) ?? [];
  const me = useQuery(api.users.getCurrentUser);

  const pendingLeave = leaveRequests.filter((r) => r.status === "Pending");
  const onLeaveNow = leaveRequests.filter((r) => r.status === "Approved").slice(0, 4);
  const pinnedOrRecent = announcements.slice(0, 4);
  const team = users.slice(0, 6);
  const trainingPreview = courses.slice(0, 4);

  const present = ATTENDANCE_TODAY.filter((r) => r.status === "Present").length;
  const late = ATTENDANCE_TODAY.filter((r) => r.status === "Late").length;
  const absent = ATTENDANCE_TODAY.filter((r) => r.status === "Absent").length;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-5 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #0B2349 0%, #163a75 100%)",
          boxShadow: "0 4px 20px rgba(11,35,73,0.18)",
        }}
      >
        <div>
          <p className="text-white/60 text-sm">{greeting},</p>
          <h2 className="text-white text-xl font-semibold">
            {me?.name ?? "S.K. Boafo & Company"}
          </h2>
          <p className="text-white/50 text-xs mt-0.5">People & HR dashboard</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">{pendingLeave.length}</p>
            <p className="text-white/50 text-xs">Pending leave</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">{present}</p>
            <p className="text-white/50 text-xs">Present today</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">{users.length || "—"}</p>
            <p className="text-white/50 text-xs">Team members</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending leave",
            value: String(pendingLeave.length),
            change: "Awaiting approval",
            icon: "umbrella" as const,
            color: "#D97706",
            bg: "#FFFBEB",
            href: "/approvals",
          },
          {
            label: "Present today",
            value: String(present),
            change: `${late} late · ${absent} absent`,
            icon: "clock" as const,
            color: "#059669",
            bg: "#ECFDF5",
            href: "/hr/attendance",
          },
          {
            label: "Open courses",
            value: String(courses.length),
            change: "Training catalogue",
            icon: "book-open" as const,
            color: "#0B2349",
            bg: "#EFF4FF",
            href: "/training",
          },
          {
            label: "Announcements",
            value: String(announcements.length),
            change: "Firm updates",
            icon: "bell" as const,
            color: "#7C3AED",
            bg: "#F5F3FF",
            href: "/announcements",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-[#E2E8F0] bg-white p-4 hover:border-[#C9A227]/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#64748B] font-medium">{stat.label}</p>
                <p className="text-[22px] font-bold text-[#0B2349] mt-1 leading-none">{stat.value}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1.5">{stat.change}</p>
              </div>
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: stat.bg, color: stat.color }}
              >
                <Icon name={stat.icon} className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending leave queue */}
        <div className="lg:col-span-2 rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0B2349]">Pending leave requests</h3>
              <p className="text-[11px] text-[#94A3B8]">Approve or decline from Approvals</p>
            </div>
            <Link href="/approvals" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              View all
            </Link>
          </div>
          {pendingLeave.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">
              No leave requests awaiting approval.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {pendingLeave.slice(0, 6).map((r) => (
                <div key={r._id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: "#EFF4FF", color: "#1d4ed8" }}
                  >
                    {initials(r.employeeName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#0B2349] truncate">{r.employeeName}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {r.type} · {r.from} – {r.to} · {r.days} day{r.days !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance snapshot */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-semibold text-[#0B2349]">Attendance today</h3>
            <Link href="/attendance" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Details
            </Link>
          </div>
          <div className="px-5 py-3 flex gap-3 text-[11px]">
            <span className="text-[#059669] font-semibold">{present} present</span>
            <span className="text-[#D97706] font-semibold">{late} late</span>
            <span className="text-[#DC2626] font-semibold">{absent} absent</span>
          </div>
          <div className="divide-y divide-[#F1F5F9] max-h-[280px] overflow-y-auto">
            {ATTENDANCE_TODAY.map((r) => (
              <div key={r.name} className="flex items-center justify-between px-5 py-2.5">
                <div>
                  <p className="text-[12px] font-medium text-[#0B2349]">{r.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">{r.role}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Announcements */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-semibold text-[#0B2349]">Announcements</h3>
            <Link href="/announcements" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              All
            </Link>
          </div>
          {pinnedOrRecent.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">No announcements yet.</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {pinnedOrRecent.map((a) => (
                <div key={a._id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {a.pinned && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-[#C9A227]">Pinned</span>
                    )}
                    <p className="text-[13px] font-medium text-[#0B2349] truncate">{a.title}</p>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-semibold text-[#0B2349]">Training</h3>
            <Link href="/training" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Browse
            </Link>
          </div>
          {trainingPreview.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">No courses published.</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {trainingPreview.map((c) => (
                <div key={c._id} className="px-5 py-3 flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF4FF", color: "#0B2349" }}
                  >
                    <Icon name="book-open" className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#0B2349] truncate">{c.title}</p>
                    <p className="text-[10px] text-[#94A3B8]">{c.category ?? "General"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
            <h3 className="text-[14px] font-semibold text-[#0B2349]">Team</h3>
            <Link href="/staff" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Directory
            </Link>
          </div>
          {team.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-[#94A3B8]">Loading team…</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {team.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-5 py-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: "#F1F5F9", color: "#0B2349" }}
                  >
                    {initials(u.name ?? u.email ?? "?")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#0B2349] truncate">{u.name ?? u.email}</p>
                    <p className="text-[10px] text-[#94A3B8] capitalize">
                      {(u.role ?? "staff").replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {onLeaveNow.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1.5">
                Recently approved leave
              </p>
              {onLeaveNow.map((r) => (
                <p key={r._id} className="text-[11px] text-[#64748B]">
                  {r.employeeName} · {r.from} – {r.to}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
