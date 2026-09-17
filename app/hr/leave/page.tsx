"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ConfirmDialog } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";

const PAGE_SIZE = 8;

const REQUESTS = [
  { id: "LV-2026-015", employee: "Yaa Bonsu",     role: "HR Officer",    type: "Annual Leave",    from: "22 Sep 2026", to: "26 Sep 2026", days: 5, status: "Pending",  applied: "15 Sep 2026" },
  { id: "LV-2026-014", employee: "Kofi Mensah",   role: "Associate",     type: "Sick Leave",      from: "17 Sep 2026", to: "17 Sep 2026", days: 1, status: "Pending",  applied: "16 Sep 2026" },
  { id: "LV-2026-013", employee: "Ama Darko",     role: "Paralegal",     type: "Emergency Leave", from: "18 Sep 2026", to: "19 Sep 2026", days: 2, status: "Pending",  applied: "16 Sep 2026" },
  { id: "LV-2026-012", employee: "Kwame Osei",    role: "Associate",     type: "Annual Leave",    from: "02 Sep 2026", to: "04 Sep 2026", days: 3, status: "Approved", applied: "28 Aug 2026" },
  { id: "LV-2026-011", employee: "Abena Asante",  role: "Admin",         type: "Annual Leave",    from: "25 Aug 2026", to: "29 Aug 2026", days: 5, status: "Approved", applied: "20 Aug 2026" },
  { id: "LV-2026-010", employee: "Kojo Frimpong", role: "Partner",       type: "Study Leave",     from: "18 Aug 2026", to: "22 Aug 2026", days: 5, status: "Approved", applied: "12 Aug 2026" },
  { id: "LV-2026-009", employee: "Efua Agyeman",  role: "Associate",     type: "Maternity Leave", from: "01 Aug 2026", to: "31 Oct 2026", days: 91, status: "Approved",applied: "15 Jul 2026" },
  { id: "LV-2026-008", employee: "Yaa Bonsu",     role: "HR Officer",    type: "Sick Leave",      from: "20 Aug 2026", to: "20 Aug 2026", days: 1, status: "Approved", applied: "19 Aug 2026" },
  { id: "LV-2026-007", employee: "Kofi Mensah",   role: "Associate",     type: "Annual Leave",    from: "05 Aug 2026", to: "07 Aug 2026", days: 3, status: "Declined", applied: "01 Aug 2026" },
  { id: "LV-2026-006", employee: "Ama Darko",     role: "Paralegal",     type: "Annual Leave",    from: "28 Jul 2026", to: "01 Aug 2026", days: 5, status: "Approved", applied: "22 Jul 2026" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

const FILTER_OPTIONS = ["All", "Pending", "Approved", "Declined"];

export default function HRLeavePage() {
  const [requests, setRequests] = useState(REQUESTS);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  const filtered = requests.filter((r) => filter === "All" || r.status === filter);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = paginated.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) { pageIds.forEach((id) => next.delete(id)); }
      else { pageIds.forEach((id) => next.add(id)); }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleApprove() {
    setRequests((prev) => prev.map((r) => selected.has(r.id) ? { ...r, status: "Approved" } : r));
    setSelected(new Set()); setConfirmApprove(false);
  }

  function handleDecline() {
    setRequests((prev) => prev.map((r) => selected.has(r.id) ? { ...r, status: "Declined" } : r));
    setSelected(new Set()); setConfirmDecline(false);
  }

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Leave Register</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">All leave requests across the firm</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "#FFFBEB", color: "#D97706" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); setSelected(new Set()); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={filter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn variant="success" onClick={() => setConfirmApprove(true)}>
            <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} /> Approve
          </TBtn>
          <TBtn variant="danger" onClick={() => setConfirmDecline(true)}>
            <Icon name="x" className="w-3.5 h-3.5" strokeWidth={2.5} /> Decline
          </TBtn>
        </BulkToolbar>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              <th className="pl-5 pr-3 py-3">
                <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleAll} />
              </th>
              {["Employee", "Type", "Duration", "Days", "Applied", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r) => (
              <tr key={r.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={selected.has(r.id) ? { background: "#EFF4FF" } : {}}>
                <td className="pl-5 pr-3 py-3.5">
                  <Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                      {r.employee.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-[#1e293b] leading-tight">{r.employee}</p>
                      <p className="text-[10px] text-[#94A3B8]">{r.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-[#1e293b]">{r.type}</td>
                <td className="px-3 py-3.5 text-[#64748B] text-[12px]">{r.from} – {r.to}</td>
                <td className="px-3 py-3.5 font-semibold text-[#0B2349]">{r.days}d</td>
                <td className="px-3 py-3.5 text-[#64748B] text-[12px]">{r.applied}</td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].text }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  {r.status === "Pending" && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(new Set([r.id])); setConfirmApprove(true); }} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#ECFDF5", color: "#059669" }}>Approve</button>
                      <button onClick={() => { setSelected(new Set([r.id])); setConfirmDecline(true); }} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#FFF5F5", color: "#DC2626" }}>Decline</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      <ConfirmDialog isOpen={confirmApprove} onClose={() => setConfirmApprove(false)} onConfirm={handleApprove} title="Approve leave?" message={`Approve leave for ${selected.size} request${selected.size !== 1 ? "s" : ""}?`} confirmLabel="Approve" variant="default" />
      <ConfirmDialog isOpen={confirmDecline} onClose={() => setConfirmDecline(false)} onConfirm={handleDecline} title="Decline leave?" message={`Decline leave for ${selected.size} request${selected.size !== 1 ? "s" : ""}?`} confirmLabel="Decline" variant="danger" />
    </div>
  );
}
