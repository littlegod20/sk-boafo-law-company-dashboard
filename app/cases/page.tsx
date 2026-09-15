"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

const ALL_CASES = [
  { id: "SKB-2026-047", client: "Ofori & Sons Ltd.", clientType: "Corporate", type: "Corporate", attorney: "A. Mensah", status: "Active", filed: "01 Sep 2026", hearing: "18 Sep 2026", priority: "High" },
  { id: "SKB-2026-046", client: "Adwoa Boateng", clientType: "Individual", type: "Estate & Probate", attorney: "K. Asante", status: "Pending", filed: "28 Aug 2026", hearing: "22 Sep 2026", priority: "Medium" },
  { id: "SKB-2026-045", client: "Ghana Mining Co.", clientType: "Corporate", type: "Mining & Energy", attorney: "E. Darko", status: "Active", filed: "20 Aug 2026", hearing: "25 Sep 2026", priority: "High" },
  { id: "SKB-2026-044", client: "Kofi Agyeman", clientType: "Individual", type: "Employment", attorney: "A. Mensah", status: "On Hold", filed: "15 Aug 2026", hearing: "—", priority: "Low" },
  { id: "SKB-2026-043", client: "Accra Realty Ltd.", clientType: "Corporate", type: "Real Estate", attorney: "D. Owusu", status: "Active", filed: "10 Aug 2026", hearing: "01 Oct 2026", priority: "Medium" },
  { id: "SKB-2026-042", client: "Yaa Asantewaa Trust", clientType: "Trust", type: "Estate & Probate", attorney: "K. Asante", status: "Closed", filed: "01 Jul 2026", hearing: "—", priority: "Low" },
  { id: "SKB-2026-041", client: "TeleFlex Ghana", clientType: "Corporate", type: "Telecom & Tech", attorney: "E. Darko", status: "Active", filed: "15 Jul 2026", hearing: "03 Oct 2026", priority: "High" },
  { id: "SKB-2026-040", client: "Kwame Osei", clientType: "Individual", type: "Litigation", attorney: "D. Owusu", status: "Active", filed: "08 Jul 2026", hearing: "07 Oct 2026", priority: "Medium" },
  { id: "SKB-2026-039", client: "Goldfields Minerals", clientType: "Corporate", type: "Mining & Energy", attorney: "E. Darko", status: "Active", filed: "01 Jul 2026", hearing: "20 Sep 2026", priority: "High" },
  { id: "SKB-2026-038", client: "Akua Twum", clientType: "Individual", type: "Land & Chieftaincy", attorney: "K. Asante", status: "Pending", filed: "20 Jun 2026", hearing: "12 Oct 2026", priority: "Medium" },
  { id: "SKB-2026-037", client: "Adom Broadcasting", clientType: "Corporate", type: "Telecom & Tech", attorney: "A. Mensah", status: "Active", filed: "10 Jun 2026", hearing: "15 Oct 2026", priority: "Medium" },
  { id: "SKB-2026-036", client: "Ama Sarpong", clientType: "Individual", type: "Employment", attorney: "D. Owusu", status: "Closed", filed: "01 Jun 2026", hearing: "—", priority: "Low" },
];

const STATUSES = ["All", "Active", "Pending", "On Hold", "Closed"];
const TYPES = ["All Types", "Corporate", "Estate & Probate", "Mining & Energy", "Real Estate", "Employment", "Telecom & Tech", "Litigation", "Land & Chieftaincy"];
const ATTORNEYS = ["All Attorneys", "A. Mensah", "K. Asante", "E. Darko", "D. Owusu"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Active: { bg: "#ECFDF5", text: "#059669" },
    Pending: { bg: "#FFFBEB", text: "#D97706" },
    "On Hold": { bg: "#F1F5F9", text: "#64748B" },
    Closed: { bg: "#F8FAFC", text: "#94A3B8" },
  };
  const s = map[status] ?? { bg: "#F1F5F9", text: "#64748B" };
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = { High: "#DC2626", Medium: "#D97706", Low: "#94A3B8" };
  return (
    <span className="flex items-center gap-1 text-[11px]" style={{ color: map[p] ?? "#94A3B8" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map[p] }} />
      {p}
    </span>
  );
}

export default function CasesPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [attyFilter, setAttyFilter] = useState("All Attorneys");
  const [search, setSearch] = useState("");

  const filtered = ALL_CASES.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (typeFilter !== "All Types" && c.type !== typeFilter) return false;
    if (attyFilter !== "All Attorneys" && c.attorney !== attyFilter) return false;
    if (search && !c.client.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">All Cases</h2>
          <p className="text-sm text-[#94A3B8]">{filtered.length} matters found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
          >
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            New Case
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]">
            <Icon name="download" className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center"
        style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] flex-1 min-w-[180px]">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by case ID or client..."
            className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={
                statusFilter === s
                  ? { background: "#0B2349", color: "white" }
                  : { background: "#F5F7FA", color: "#64748B" }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#64748B] bg-white outline-none"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Attorney filter */}
        <select
          className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#64748B] bg-white outline-none"
          value={attyFilter}
          onChange={(e) => setAttyFilter(e.target.value)}
        >
          {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Case ID", "Client", "Practice Area", "Assigned Attorney", "Priority", "Status", "Filed", "Next Hearing", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 font-mono font-medium text-[#0B2349] text-[11px] whitespace-nowrap">{c.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#1e293b]">{c.client}</p>
                    <p className="text-[10px] text-[#94A3B8]">{c.clientType}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.type}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.attorney}</td>
                  <td className="px-5 py-3.5"><PriorityBadge p={c.priority} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.filed}</td>
                  <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.hearing}</td>
                  <td className="px-5 py-3.5">
                    <button className="rounded-lg p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                      <Icon name="eye" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#94A3B8]">
            <Icon name="briefcase" className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No cases match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
