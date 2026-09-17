"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

const MONTH_RECORDS = [
  { date: "01 Sep", day: "Mon", in: "08:05", out: "17:30", hours: 9.4, status: "Present" },
  { date: "02 Sep", day: "Tue", in: "08:12", out: "17:45", hours: 9.5, status: "Present" },
  { date: "03 Sep", day: "Wed", in: "09:22", out: "17:30", hours: 8.1, status: "Late" },
  { date: "04 Sep", day: "Thu", in: "08:00", out: "18:00", hours: 10.0, status: "Present" },
  { date: "05 Sep", day: "Fri", in: "08:10", out: "17:00", hours: 8.8, status: "Present" },
  { date: "08 Sep", day: "Mon", in: "—",     out: "—",     hours: 0,   status: "Absent" },
  { date: "09 Sep", day: "Tue", in: "08:20", out: "17:30", hours: 9.2, status: "Present" },
  { date: "10 Sep", day: "Wed", in: "08:05", out: "17:45", hours: 9.7, status: "Present" },
  { date: "11 Sep", day: "Thu", in: "09:15", out: "17:30", hours: 8.3, status: "Late" },
  { date: "12 Sep", day: "Fri", in: "08:00", out: "17:00", hours: 9.0, status: "Present" },
  { date: "15 Sep", day: "Mon", in: "08:08", out: "17:30", hours: 9.4, status: "Present" },
  { date: "16 Sep", day: "Tue", in: "08:03", out: "18:00", hours: 10.0, status: "Present" },
  { date: "17 Sep", day: "Wed", in: "08:02", out: "—",     hours: 0,   status: "Present" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Present: { bg: "#ECFDF5", text: "#059669" },
  Late:    { bg: "#FFFBEB", text: "#D97706" },
  Absent:  { bg: "#FFF5F5", text: "#DC2626" },
};

export default function MyAttendancePage() {
  const [tab, setTab] = useState<"september" | "august">("september");

  const present = MONTH_RECORDS.filter((r) => r.status === "Present").length;
  const late    = MONTH_RECORDS.filter((r) => r.status === "Late").length;
  const absent  = MONTH_RECORDS.filter((r) => r.status === "Absent").length;
  const totalHours = MONTH_RECORDS.reduce((a, r) => a + r.hours, 0);

  return (
    <div className="space-y-5 max-w-[1000px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">My Attendance</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Your personal attendance record</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Days Present",  value: present,                     color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
          { label: "Days Late",     value: late,                        color: "#D97706", bg: "#FFFBEB", icon: "clock" as const },
          { label: "Days Absent",   value: absent,                      color: "#DC2626", bg: "#FFF5F5", icon: "xmark-circle" as const },
          { label: "Total Hours",   value: `${totalHours.toFixed(0)}h`, color: "#0B2349", bg: "#EFF4FF", icon: "trending-up" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-1">of {MONTH_RECORDS.length} working days</p>
          </div>
        ))}
      </div>

      {/* Month tabs */}
      <div className="flex items-center gap-2">
        {(["september", "august"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors"
            style={tab === t ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} 2026
          </button>
        ))}
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Date", "Day", "Clock In", "Clock Out", "Hours", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(tab === "september" ? MONTH_RECORDS : []).map((r) => (
              <tr key={r.date} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#1e293b]">{r.date}</td>
                <td className="px-5 py-3.5 text-[#64748B]">{r.day}</td>
                <td className="px-5 py-3.5 font-mono text-[12px] text-[#1e293b]">{r.in}</td>
                <td className="px-5 py-3.5 font-mono text-[12px] text-[#94A3B8]">{r.out}</td>
                <td className="px-5 py-3.5 font-semibold text-[#0B2349]">{r.hours > 0 ? `${r.hours}h` : "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].text }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {tab === "august" && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">August records archived</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
