"use client";

import { Icon } from "@/components/Icons";

const TEAM = [
  { name: "Kofi Mensah",     role: "Associate",  dept: "Litigation",        cases: 12, hours: 148, rating: 88, trend: "up" },
  { name: "Abena Asante",    role: "Associate",  dept: "Conveyancing",      cases: 9,  hours: 132, rating: 82, trend: "up" },
  { name: "Kwame Osei",      role: "Associate",  dept: "Family Law",        cases: 11, hours: 140, rating: 85, trend: "neutral" },
  { name: "Efua Agyeman",    role: "Associate",  dept: "Litigation",        cases: 0,  hours: 0,   rating: 91, trend: "neutral" },
  { name: "Ama Darko",       role: "Paralegal",  dept: "Corporate Law",     cases: 7,  hours: 120, rating: 79, trend: "down" },
  { name: "Akua Twum",       role: "Paralegal",  dept: "Conveyancing",      cases: 6,  hours: 115, rating: 76, trend: "up" },
  { name: "Adwoa Boateng",   role: "Associate",  dept: "Intellectual Prop", cases: 8,  hours: 126, rating: 80, trend: "up" },
  { name: "Yaa Bonsu",       role: "HR Officer", dept: "Human Resources",   cases: 0,  hours: 160, rating: 93, trend: "neutral" },
];

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" }, { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" }, { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" }, { bg: "#F0FDF4", color: "#15803d" },
];

const DEPT_STATS = [
  { dept: "Litigation",        members: 3, avgRating: 88, cases: 26 },
  { dept: "Conveyancing",      members: 2, avgRating: 79, cases: 15 },
  { dept: "Corporate Law",     members: 1, avgRating: 79, cases: 7 },
  { dept: "Family Law",        members: 1, avgRating: 85, cases: 11 },
  { dept: "Intellectual Prop", members: 1, avgRating: 80, cases: 8 },
];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")      return <span className="text-[#059669] text-[11px] font-bold">↑</span>;
  if (trend === "down")    return <span className="text-[#DC2626] text-[11px] font-bold">↓</span>;
  return <span className="text-[#94A3B8] text-[11px]">—</span>;
}

function ratingColor(r: number) {
  if (r >= 90) return "#059669";
  if (r >= 80) return "#0B2349";
  if (r >= 70) return "#D97706";
  return "#DC2626";
}

export default function TeamPerformancePage() {
  const avgRating = Math.round(TEAM.filter(m => m.rating > 0).reduce((a, m) => a + m.rating, 0) / TEAM.filter(m => m.rating > 0).length);
  const totalCases = TEAM.reduce((a, m) => a + m.cases, 0);
  const totalHours = TEAM.reduce((a, m) => a + m.hours, 0);

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">Team Performance</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Q3 2026 · {TEAM.length} team members</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Rating",    value: `${avgRating}`, unit: "/100", color: "#0B2349", bg: "#EFF4FF", icon: "star" as const },
          { label: "Cases Closed",  value: `${totalCases}`, unit: " Q3", color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
          { label: "Billable Hrs",  value: `${totalHours}`, unit: " h",  color: "#7C3AED", bg: "#F5F3FF", icon: "clock" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.value}<span className="text-[14px] font-medium text-[#94A3B8]">{s.unit}</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Team table */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9]">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Individual Scores</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Employee", "Cases", "Hours", "Rating", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM.map((m, i) => {
                const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <tr key={m.name} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                          {m.name.split(" ").map((w) => w[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[#1e293b] leading-tight">{m.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{m.cases || "—"}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{m.hours > 0 ? `${m.hours}h` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden w-16">
                          <div className="h-full rounded-full" style={{ width: `${m.rating}%`, background: ratingColor(m.rating) }} />
                        </div>
                        <span className="text-[12px] font-bold w-8" style={{ color: ratingColor(m.rating) }}>{m.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><TrendIcon trend={m.trend} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dept breakdown */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9]">
            <h3 className="text-[14px] font-bold text-[#0B2349]">By Department</h3>
          </div>
          <div className="divide-y divide-[#F8FAFC]">
            {DEPT_STATS.map((d) => (
              <div key={d.dept} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[13px] font-medium text-[#1e293b]">{d.dept}</p>
                  <span className="text-[12px] font-bold" style={{ color: ratingColor(d.avgRating) }}>{d.avgRating}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${d.avgRating}%`, background: ratingColor(d.avgRating), opacity: 0.7 }} />
                </div>
                <p className="text-[11px] text-[#94A3B8]">{d.members} member{d.members !== 1 ? "s" : ""} · {d.cases} cases</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
