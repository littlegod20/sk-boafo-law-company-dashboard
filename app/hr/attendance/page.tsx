"use client";

import { Icon } from "@/components/Icons";

const TODAY = [
  { name: "S.K. Boafo",      role: "Managing Partner", in: "08:02",  out: "—",     status: "Present" },
  { name: "Kojo Frimpong",   role: "Partner",          in: "08:45",  out: "—",     status: "Present" },
  { name: "Abena Asante",    role: "Associate",        in: "09:10",  out: "—",     status: "Late" },
  { name: "Kofi Mensah",     role: "Associate",        in: "08:55",  out: "—",     status: "Present" },
  { name: "Ama Darko",       role: "Paralegal",        in: "—",      out: "—",     status: "Absent" },
  { name: "Kwame Osei",      role: "Associate",        in: "08:30",  out: "—",     status: "Present" },
  { name: "Efua Agyeman",    role: "Associate",        in: "—",      out: "—",     status: "On Leave" },
  { name: "Yaa Bonsu",       role: "HR Officer",       in: "08:00",  out: "—",     status: "Present" },
  { name: "Nana Acheampong", role: "Admin",            in: "08:20",  out: "—",     status: "Present" },
  { name: "Akua Twum",       role: "Paralegal",        in: "09:35",  out: "—",     status: "Late" },
  { name: "Kwabena Asare",   role: "Partner",          in: "07:58",  out: "—",     status: "Present" },
  { name: "Adwoa Boateng",   role: "Associate",        in: "08:42",  out: "—",     status: "Present" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Present:    { bg: "#ECFDF5", text: "#059669" },
  Late:       { bg: "#FFFBEB", text: "#D97706" },
  Absent:     { bg: "#FFF5F5", text: "#DC2626" },
  "On Leave": { bg: "#F1F5F9", text: "#64748B" },
};

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" }, { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" }, { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" }, { bg: "#F0FDF4", color: "#15803d" },
];

const present  = TODAY.filter((r) => r.status === "Present").length;
const late     = TODAY.filter((r) => r.status === "Late").length;
const absent   = TODAY.filter((r) => r.status === "Absent").length;
const onLeave  = TODAY.filter((r) => r.status === "On Leave").length;

export default function HRAttendancePage() {
  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">Attendance</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Today · Wednesday, 17 September 2026</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present",   value: present,  color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
          { label: "Late",      value: late,     color: "#D97706", bg: "#FFFBEB", icon: "clock" as const },
          { label: "Absent",    value: absent,   color: "#DC2626", bg: "#FFF5F5", icon: "xmark-circle" as const },
          { label: "On Leave",  value: onLeave,  color: "#64748B", bg: "#F1F5F9", icon: "umbrella" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-1">of {TODAY.length} staff</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-[14px] font-bold text-[#0B2349]">Today&apos;s Register</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Employee", "Role", "Clock In", "Clock Out", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TODAY.map((r, i) => {
              const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              return (
                <tr key={r.name} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                        {r.name.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <span className="font-medium text-[#1e293b]">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.role}</td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-[#1e293b]">{r.in}</td>
                  <td className="px-5 py-3.5 font-mono text-[12px] text-[#94A3B8]">{r.out}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].text }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
