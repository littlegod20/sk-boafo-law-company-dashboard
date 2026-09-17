"use client";

import { Icon } from "@/components/Icons";

const ENROLLED = [
  { id: "TR-001", title: "Employment Law Updates 2026",         provider: "Ghana Bar Association", due: "30 Sep 2026", progress: 65, hours: 8,  status: "In Progress" },
  { id: "TR-002", title: "HR Management Fundamentals",          provider: "CIPD Online",           due: "15 Oct 2026", progress: 30, hours: 12, status: "In Progress" },
  { id: "TR-003", title: "Workplace Health & Safety",           provider: "Internal",              due: "31 Aug 2026", progress: 100, hours: 4, status: "Completed"   },
  { id: "TR-004", title: "Data Protection & GDPR Compliance",   provider: "LegalLearn",            due: "31 Oct 2026", progress: 0,  hours: 6,  status: "Not Started" },
];

const AVAILABLE = [
  { title: "Advanced Employment Contracts",  provider: "Ghana Bar Association", duration: "6 hrs",  category: "Legal" },
  { title: "Diversity & Inclusion at Work",  provider: "CIPD Online",           duration: "4 hrs",  category: "HR" },
  { title: "Performance Management",         provider: "Internal",              duration: "3 hrs",  category: "HR" },
  { title: "Contract Drafting Masterclass",  provider: "LegalLearn",            duration: "10 hrs", category: "Legal" },
  { title: "Excel for HR Professionals",     provider: "Coursera",              duration: "5 hrs",  category: "Tech" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#EFF4FF", text: "#1d4ed8" },
  Completed:     { bg: "#ECFDF5", text: "#059669" },
  "Not Started": { bg: "#F1F5F9", text: "#64748B" },
};

const CAT_STYLE: Record<string, { bg: string; text: string }> = {
  Legal: { bg: "#EFF4FF", text: "#1d4ed8" },
  HR:    { bg: "#F5F3FF", text: "#7C3AED" },
  Tech:  { bg: "#ECFDF5", text: "#059669" },
};

const completed = ENROLLED.filter((e) => e.status === "Completed").length;
const totalHours = ENROLLED.filter((e) => e.status === "Completed").reduce((a, e) => a + e.hours, 0);
const inProgress = ENROLLED.filter((e) => e.status === "In Progress").length;

export default function TrainingPage() {
  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">Training</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Your learning and development tracker</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Completed",   value: completed,  suffix: "courses", color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
          { label: "In Progress", value: inProgress, suffix: "courses", color: "#1d4ed8", bg: "#EFF4FF", icon: "book-open" as const },
          { label: "CPD Hours",   value: totalHours, suffix: "hrs",     color: "#0B2349", bg: "#F1F5F9", icon: "clock" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-1">{s.suffix} this year</p>
          </div>
        ))}
      </div>

      {/* Enrolled courses */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-[14px] font-bold text-[#0B2349]">My Courses</h3>
        </div>
        <div className="divide-y divide-[#F8FAFC]">
          {ENROLLED.map((e) => (
            <div key={e.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="text-[13px] font-semibold text-[#1e293b]">{e.title}</p>
                    <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[e.status].bg, color: STATUS_STYLE[e.status].text }}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#94A3B8] mb-2">{e.provider} · {e.hours} hrs · Due {e.due}</p>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${e.progress}%`, background: e.status === "Completed" ? "#059669" : "#0B2349" }} />
                    </div>
                    <span className="text-[12px] font-semibold text-[#0B2349] w-10 text-right">{e.progress}%</span>
                  </div>
                </div>
                {e.status !== "Completed" && (
                  <button className="flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors hover:opacity-90" style={{ background: "#0B2349", color: "white" }}>
                    {e.status === "Not Started" ? "Start" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available courses */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-[14px] font-bold text-[#0B2349]">Browse Courses</h3>
        </div>
        <div className="divide-y divide-[#F8FAFC]">
          {AVAILABLE.map((c) => (
            <div key={c.title} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F1F5F9" }}>
                  <Icon name="book-open" className="w-4 h-4 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1e293b]">{c.title}</p>
                  <p className="text-[12px] text-[#94A3B8]">{c.provider} · {c.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: CAT_STYLE[c.category].bg, color: CAT_STYLE[c.category].text }}>{c.category}</span>
                <button className="rounded-lg px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F5F7FA] transition-colors">Enroll</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
