"use client";

import { Icon } from "@/components/Icons";

const METRICS = [
  { label: "Cases Closed",    value: 14,  target: 20,  unit: "",   color: "#0B2349", bg: "#EFF4FF", icon: "check-circle" as const },
  { label: "Billable Hours",  value: 138, target: 160, unit: "h",  color: "#059669", bg: "#ECFDF5", icon: "clock" as const },
  { label: "Client Rating",   value: 4.7, target: 5,   unit: "/5", color: "#7C3AED", bg: "#F5F3FF", icon: "star" as const },
  { label: "Tasks On Time",   value: 91,  target: 100, unit: "%",  color: "#D97706", bg: "#FFFBEB", icon: "trending-up" as const },
];

const REVIEWS = [
  { period: "Q2 2026", rating: "Excellent", score: 94, reviewer: "K. Asare",    date: "10 Jul 2026" },
  { period: "Q1 2026", rating: "Good",      score: 81, reviewer: "K. Asare",    date: "08 Apr 2026" },
  { period: "Q4 2025", rating: "Excellent", score: 90, reviewer: "S.K. Boafo",  date: "12 Jan 2026" },
  { period: "Q3 2025", rating: "Good",      score: 78, reviewer: "K. Asare",    date: "09 Oct 2025" },
];

const GOALS = [
  { label: "Complete Corporate Law certification",   due: "30 Nov 2026", progress: 45, status: "In Progress" },
  { label: "Mentor 2 junior associates",             due: "31 Dec 2026", progress: 100, status: "Done" },
  { label: "Lead 3 client presentations",            due: "31 Oct 2026", progress: 67, status: "In Progress" },
  { label: "Reduce case backlog by 20%",             due: "30 Sep 2026", progress: 80, status: "In Progress" },
];

const RATING_STYLE: Record<string, { bg: string; text: string }> = {
  Excellent:   { bg: "#ECFDF5", text: "#059669" },
  Good:        { bg: "#EFF4FF", text: "#1d4ed8" },
  Satisfactory: { bg: "#FFFBEB", text: "#D97706" },
};

const GOAL_STYLE: Record<string, { bg: string; text: string }> = {
  Done:        { bg: "#ECFDF5", text: "#059669" },
  "In Progress": { bg: "#EFF4FF", text: "#1d4ed8" },
};

export default function MyPerformancePage() {
  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">My Performance</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Q3 2026 · Jul – Sep 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => {
          const pct = Math.min(Math.round((m.value / m.target) * 100), 100);
          return (
            <div key={m.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{m.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                  <Icon name={m.icon} className="w-4 h-4" style={{ color: m.color }} />
                </div>
              </div>
              <p className="text-[28px] font-bold leading-none" style={{ color: m.color }}>
                {m.value}{m.unit}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">Target: {m.target}{m.unit}</p>
              <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color, opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Goals */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9]">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Goals &amp; Objectives</h3>
          </div>
          <div className="divide-y divide-[#F8FAFC]">
            {GOALS.map((g) => (
              <div key={g.label} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-[13px] font-medium text-[#1e293b] leading-snug flex-1">{g.label}</p>
                  <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: GOAL_STYLE[g.status].bg, color: GOAL_STYLE[g.status].text }}>
                    {g.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.progress}%`, background: g.progress === 100 ? "#059669" : "#0B2349" }} />
                  </div>
                  <span className="text-[11px] text-[#94A3B8] w-8 text-right">{g.progress}%</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1.5">Due {g.due}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Review history */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9]">
            <h3 className="text-[14px] font-bold text-[#0B2349]">Review History</h3>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Period", "Rating", "Score", "Reviewer", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REVIEWS.map((r) => (
                <tr key={r.period} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#1e293b]">{r.period}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: RATING_STYLE[r.rating].bg, color: RATING_STYLE[r.rating].text }}>
                      {r.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#0B2349]">{r.score}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.reviewer}</td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-[12px]">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
