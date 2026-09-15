import { Icon } from "@/components/Icons";

// ─── Static Data ──────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Active Cases",
    value: "47",
    change: "+3 this week",
    trend: "up",
    icon: "briefcase" as const,
    color: "#0B2349",
    bg: "#EFF4FF",
  },
  {
    label: "Total Clients",
    value: "124",
    change: "+8 this month",
    trend: "up",
    icon: "users" as const,
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    label: "Court Hearings",
    value: "12",
    change: "Next in 3 days",
    trend: "neutral",
    icon: "gavel" as const,
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    label: "Outstanding Invoices",
    value: "GHS 87,500",
    change: "4 overdue",
    trend: "down",
    icon: "receipt" as const,
    color: "#DC2626",
    bg: "#FFF5F5",
  },
];

const RECENT_CASES = [
  { id: "SKB-2026-047", client: "Ofori & Sons Ltd.", type: "Corporate", attorney: "A. Mensah", status: "Active", hearing: "18 Sep 2026" },
  { id: "SKB-2026-046", client: "Adwoa Boateng", type: "Estate & Probate", attorney: "K. Asante", status: "Pending", hearing: "22 Sep 2026" },
  { id: "SKB-2026-045", client: "Ghana Mining Co.", type: "Mining & Energy", attorney: "E. Darko", status: "Active", hearing: "25 Sep 2026" },
  { id: "SKB-2026-044", client: "Kofi Agyeman", type: "Employment", attorney: "A. Mensah", status: "On Hold", hearing: "—" },
  { id: "SKB-2026-043", client: "Accra Realty Ltd.", type: "Real Estate", attorney: "D. Owusu", status: "Active", hearing: "1 Oct 2026" },
  { id: "SKB-2026-042", client: "Yaa Asantewaa Trust", type: "Estate & Probate", attorney: "K. Asante", status: "Closed", hearing: "—" },
  { id: "SKB-2026-041", client: "TeleFlex Ghana", type: "Telecom & Tech", attorney: "E. Darko", status: "Active", hearing: "3 Oct 2026" },
  { id: "SKB-2026-040", client: "Kwame Osei", type: "Litigation", attorney: "D. Owusu", status: "Active", hearing: "7 Oct 2026" },
];

const DEADLINES = [
  { date: "18 Sep", label: "Hearing — SKB-2026-047", type: "hearing", urgency: "hot" },
  { date: "20 Sep", label: "Filing deadline — SKB-2026-039", type: "filing", urgency: "hot" },
  { date: "22 Sep", label: "Hearing — SKB-2026-046", type: "hearing", urgency: "medium" },
  { date: "25 Sep", label: "Client review — SKB-2026-045", type: "review", urgency: "medium" },
  { date: "30 Sep", label: "Invoice due — INV-2026-031", type: "billing", urgency: "low" },
  { date: "01 Oct", label: "Hearing — SKB-2026-043", type: "hearing", urgency: "low" },
];

const PRACTICE_AREAS = [
  { label: "Litigation & Arbitration", count: 14, color: "#0B2349" },
  { label: "Real Estate & Property", count: 10, color: "#C9A227" },
  { label: "Corporate & Secretarial", count: 9, color: "#059669" },
  { label: "Mining, Telecom & Energy", count: 7, color: "#D97706" },
  { label: "Estate & Probate", count: 5, color: "#7C3AED" },
  { label: "Employment & Labour", count: 2, color: "#DC2626" },
];

const CASE_STATUSES = [
  { label: "Active", count: 31, color: "#059669" },
  { label: "Pending", count: 9, color: "#D97706" },
  { label: "On Hold", count: 4, color: "#64748B" },
  { label: "Closed", count: 3, color: "#CBD5E1" },
];

const TEAM_SUMMARY = [
  { initials: "AM", name: "Abena Mensah", role: "Partner", cases: 14, color: "#C9A227" },
  { initials: "KA", name: "Kofi Asante", role: "Associate", cases: 11, color: "#059669" },
  { initials: "ED", name: "Esi Darko", role: "Associate", cases: 12, color: "#0B2349" },
  { initials: "DO", name: "Derick Owusu", role: "Associate", cases: 10, color: "#7C3AED" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Active: { bg: "#ECFDF5", text: "#059669" },
    Pending: { bg: "#FFFBEB", text: "#D97706" },
    "On Hold": { bg: "#F1F5F9", text: "#64748B" },
    Closed: { bg: "#F8FAFC", text: "#94A3B8" },
  };
  const s = map[status] ?? { bg: "#F1F5F9", text: "#64748B" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

// ─── Urgency dot ──────────────────────────────────────────────────────────────
function urgencyColor(u: string) {
  if (u === "hot") return "#DC2626";
  if (u === "medium") return "#D97706";
  return "#94A3B8";
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const maxCases = Math.max(...PRACTICE_AREAS.map((p) => p.count));
  const totalStatuses = CASE_STATUSES.reduce((a, s) => a + s.count, 0);

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
          <p className="text-white/60 text-sm">Good morning,</p>
          <h2 className="text-white text-xl font-semibold">S.K. Boafo & Company</h2>
          <p className="text-white/50 text-xs mt-0.5">Gye Nyame Chambers — Legal Practice Dashboard</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">47</p>
            <p className="text-white/50 text-xs">Active Cases</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">5</p>
            <p className="text-white/50 text-xs">Pending Approvals</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-[#C9A227] text-2xl font-bold">3</p>
            <p className="text-white/50 text-xs">Days to Next Hearing</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 flex flex-col gap-3"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <Icon name={stat.icon} className="w-5 h-5" strokeWidth={1.75} style={{ color: stat.color } as React.CSSProperties} />
              </div>
              <span
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: stat.trend === "up" ? "#ECFDF5" : stat.trend === "down" ? "#FFF5F5" : "#F1F5F9",
                  color: stat.trend === "up" ? "#059669" : stat.trend === "down" ? "#DC2626" : "#64748B",
                }}
              >
                {stat.trend === "up" && <Icon name="arrow-up" className="w-2.5 h-2.5" strokeWidth={3} />}
                {stat.trend === "down" && <Icon name="arrow-down" className="w-2.5 h-2.5" strokeWidth={3} />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2349]">{stat.value}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Cases table + Deadlines */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Cases */}
        <div
          className="xl:col-span-2 bg-white rounded-xl overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-semibold text-[#0B2349]">Recent Cases</h3>
              <p className="text-[11px] text-[#94A3B8]">Latest 8 active matters</p>
            </div>
            <a href="/cases" className="text-[12px] font-medium" style={{ color: "#C9A227" }}>
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ background: "#FAFBFC" }}>
                  {["Case ID", "Client", "Type", "Attorney", "Status", "Next Hearing"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: "#94A3B8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_CASES.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-medium text-[#0B2349] text-[11px]">{c.id}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1e293b] max-w-[140px] truncate">{c.client}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.type}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.attorney}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.hearing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div
          className="bg-white rounded-xl"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-semibold text-[#0B2349]">Deadlines & Hearings</h3>
              <p className="text-[11px] text-[#94A3B8]">Next 30 days</p>
            </div>
            <a href="/calendar" className="text-[12px] font-medium" style={{ color: "#C9A227" }}>
              Calendar →
            </a>
          </div>
          <div className="divide-y divide-[#F8FAFC]">
            {DEADLINES.map((d, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAFBFF] transition-colors">
                <div className="flex-shrink-0 text-center mt-0.5">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ background: urgencyColor(d.urgency) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1e293b] leading-tight truncate">{d.label}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 capitalize">{d.type}</p>
                </div>
                <div
                  className="text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0"
                  style={{ background: "#F5F7FA", color: "#0B2349" }}
                >
                  {d.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Practice Areas + Case Status + Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Practice Areas Bar Chart */}
        <div
          className="md:col-span-2 bg-white rounded-xl p-5"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
        >
          <h3 className="text-sm font-semibold text-[#0B2349] mb-1">Cases by Practice Area</h3>
          <p className="text-[11px] text-[#94A3B8] mb-5">Active matter distribution</p>
          <div className="space-y-3.5">
            {PRACTICE_AREAS.map((area) => (
              <div key={area.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[#374151]">{area.label}</span>
                  <span className="text-[12px] font-semibold text-[#0B2349]">{area.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(area.count / maxCases) * 100}%`,
                      background: area.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Status + Team */}
        <div className="flex flex-col gap-5">
          {/* Case Status */}
          <div
            className="bg-white rounded-xl p-5 flex-1"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
          >
            <h3 className="text-sm font-semibold text-[#0B2349] mb-1">Case Status</h3>
            <p className="text-[11px] text-[#94A3B8] mb-4">{totalStatuses} total matters</p>
            <div className="flex gap-1.5 h-3 rounded-full overflow-hidden mb-4">
              {CASE_STATUSES.map((s) => (
                <div
                  key={s.label}
                  style={{
                    width: `${(s.count / totalStatuses) * 100}%`,
                    background: s.color,
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CASE_STATUSES.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px] text-[#64748B]">{s.label}</span>
                  <span className="text-[11px] font-semibold text-[#0B2349] ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Summary */}
          <div
            className="bg-white rounded-xl p-5"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0B2349]">Attorneys</h3>
              <a href="/staff" className="text-[12px] font-medium" style={{ color: "#C9A227" }}>View all →</a>
            </div>
            <div className="space-y-3">
              {TEAM_SUMMARY.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: m.color + "20", color: m.color }}
                  >
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1e293b] truncate">{m.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{m.role}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0B2349]">{m.cases} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
