"use client";

import Link from "next/link";
import { Icon } from "@/components/Icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const MONTHLY_ATTENDANCE = [
  { month: "Apr", pct: 94 },
  { month: "May", pct: 91 },
  { month: "Jun", pct: 96 },
  { month: "Jul", pct: 89 },
  { month: "Aug", pct: 93 },
  { month: "Sep", pct: 95 },
];

const LEAVE_BREAKDOWN = [
  { type: "Annual Leave", days: 38, color: "#0B2349" },
  { type: "Sick Leave", days: 12, color: "#059669" },
  { type: "Maternity Leave", days: 91, color: "#7C3AED" },
  { type: "Study Leave", days: 5, color: "#D97706" },
  { type: "Emergency Leave", days: 4, color: "#DC2626" },
];

const DEPT_HEADCOUNT = [
  { dept: "Litigation", count: 4 },
  { dept: "Corporate Law", count: 2 },
  { dept: "Conveyancing", count: 2 },
  { dept: "Family Law", count: 1 },
  { dept: "Intellectual Prop", count: 1 },
  { dept: "HR / Admin", count: 2 },
];

const KPI = [
  {
    label: "Avg Attendance",
    value: "93%",
    change: "+2%",
    up: true,
    color: "#059669",
    bg: "#ECFDF5",
    icon: "check-circle" as const,
  },
  {
    label: "Turnover Rate",
    value: "0%",
    change: "0%",
    up: true,
    color: "#0B2349",
    bg: "#EFF4FF",
    icon: "trending-up" as const,
  },
  {
    label: "Leave Days Used",
    value: "150",
    change: "+12",
    up: false,
    color: "#D97706",
    bg: "#FFFBEB",
    icon: "umbrella" as const,
  },
  {
    label: "Open Positions",
    value: "2",
    change: "New",
    up: false,
    color: "#DC2626",
    bg: "#FFF5F5",
    icon: "users" as const,
  },
];

const totalLeave = LEAVE_BREAKDOWN.reduce((a, l) => a + l.days, 0);
const totalHeadcount = DEPT_HEADCOUNT.reduce((a, d) => a + d.count, 0);
const maxDept = Math.max(...DEPT_HEADCOUNT.map((x) => x.count));
const DEPT_COLORS = ["#0B2349", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891b2"];

const cardStyle = {
  border: "1px solid #F1F5F9",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

export default function DashboardPage() {
  const leaveRequests = useQuery(api.leave.listAll) ?? [];
  const users = useQuery(api.users.list) ?? [];
  const courses = useQuery(api.training.listCourses) ?? [];
  const me = useQuery(api.users.getCurrentUser);

  const pendingLeave = leaveRequests.filter((r) => r.status === "Pending").length;
  const onLeaveToday = 1; // mock until attendance feed exists
  const partners = users.filter((u) => u.role === "partner" || u.role === "managing_partner").length;
  const associates = users.filter((u) => u.role === "associate").length;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  const quickStats = [
    { label: "Avg Tenure", value: "4.2 yrs" },
    { label: "On Leave Today", value: String(onLeaveToday) },
    { label: "Pending Approvals", value: String(pendingLeave), href: "/approvals" },
    { label: "Trainings Active", value: String(courses.length), href: "/training" },
    { label: "Partners", value: String(partners || 3) },
    { label: "Associates", value: String(associates || 6) },
  ];

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Welcome */}
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
          <p className="text-white/50 text-xs mt-0.5">People & HR overview · Jan – Sep 2026</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">{pendingLeave}</p>
            <p className="text-white/50 text-xs">Pending leave</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">93%</p>
            <p className="text-white/50 text-xs">Avg attendance</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">{users.length || totalHeadcount}</p>
            <p className="text-white/50 text-xs">Headcount</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                {k.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: k.bg }}
              >
                <Icon name={k.icon} className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="text-[11px] mt-1" style={{ color: k.up ? "#059669" : "#DC2626" }}>
              {k.change} vs last quarter
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance trend */}
        <div className="bg-white rounded-xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Attendance Rate (6 months)</h3>
            <Link href="/hr/attendance" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Attendance
            </Link>
          </div>
          <div className="flex items-end gap-2 h-28 mb-3">
            {MONTHLY_ATTENDANCE.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-[#64748B]">{m.pct}%</span>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${m.pct - 70}px`,
                    background: "#0B2349",
                    minHeight: 4,
                    opacity: 0.75 + m.pct / 500,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {MONTHLY_ATTENDANCE.map((m) => (
              <div key={m.month} className="flex-1 text-center text-[11px] text-[#94A3B8]">
                {m.month}
              </div>
            ))}
          </div>
        </div>

        {/* Leave breakdown */}
        <div className="bg-white rounded-xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Leave by Type (YTD)</h3>
            <Link href="/hr/leave" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Leave register
            </Link>
          </div>
          <div className="space-y-3">
            {LEAVE_BREAKDOWN.map((l) => (
              <div key={l.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-[#1e293b]">{l.type}</span>
                  <span className="text-[12px] font-semibold text-[#0B2349]">{l.days}d</span>
                </div>
                <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((l.days / totalLeave) * 100)}%`,
                      background: l.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3">
            {totalLeave} total leave days taken year-to-date
          </p>
        </div>

        {/* Headcount */}
        <div className="bg-white rounded-xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Headcount by Department</h3>
            <Link href="/hr/employees" className="text-[12px] font-medium text-[#0B2349] hover:underline">
              Employees
            </Link>
          </div>
          <div className="space-y-2.5">
            {DEPT_HEADCOUNT.map((d, i) => (
              <div key={d.dept} className="flex items-center gap-3">
                <span className="text-[12px] text-[#64748B] w-36 flex-shrink-0">{d.dept}</span>
                <div className="flex-1 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.count / maxDept) * 100}%`,
                      background: DEPT_COLORS[i % DEPT_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-[12px] font-semibold text-[#0B2349] w-4 text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3">{totalHeadcount} total staff</p>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-xl p-5" style={cardStyle}>
          <h3 className="text-[14px] font-bold text-[#0B2349] mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((s) => {
              const inner = (
                <>
                  <p className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-semibold">
                    {s.label}
                  </p>
                  <p className="text-[22px] font-bold text-[#0B2349] mt-1">{s.value}</p>
                </>
              );
              const className =
                "rounded-xl p-3 block transition-colors hover:border-[#C9A227]/50";
              const style = { background: "#FAFBFC", border: "1px solid #F1F5F9" };
              return s.href ? (
                <Link key={s.label} href={s.href} className={className} style={style}>
                  {inner}
                </Link>
              ) : (
                <div key={s.label} className={className} style={style}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
