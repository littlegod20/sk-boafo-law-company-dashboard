"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ConfirmDialog } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Declined"];

const DURATION_OPTIONS = [
  { label: "Any Duration", min: 0,  max: Infinity },
  { label: "1–3 days",     min: 1,  max: 3        },
  { label: "4–7 days",     min: 4,  max: 7        },
  { label: "8–14 days",    min: 8,  max: 14       },
  { label: "15+ days",     min: 15, max: Infinity },
];

// Parse "18 Sep 2026" → Date
function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const inputCls = "w-full rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349]";

export default function HRLeavePage() {
  // ── Convex ──────────────────────────────────────────────────────────────────
  const requests  = useQuery(api.leave.listAll) ?? [];
  const approveFn = useMutation(api.leave.approve);
  const declineFn = useMutation(api.leave.decline);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [nameSearch,     setNameSearch]     = useState("");
  const [durationFilter, setDurationFilter] = useState(0); // index into DURATION_OPTIONS
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");

  // ── Bulk / pagination ─────────────────────────────────────────────────────────
  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  // ── Filtering logic ───────────────────────────────────────────────────────────
  const dur = DURATION_OPTIONS[durationFilter];
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate   = dateTo   ? new Date(dateTo)   : null;

  const filtered = requests.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (nameSearch && !r.employeeName.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (durationFilter !== 0) {
      if (r.days < dur.min || r.days > dur.max) return false;
    }
    if (fromDate || toDate) {
      const applied = parseDate(r.appliedDate);
      if (applied) {
        if (fromDate && applied < fromDate) return false;
        if (toDate) {
          // include the full "to" day
          const toEnd = new Date(toDate);
          toEnd.setHours(23, 59, 59, 999);
          if (applied > toEnd) return false;
        }
      }
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds   = paginated.map((r) => r._id as string);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const hasExtraFilters = nameSearch || durationFilter !== 0 || dateFrom || dateTo;

  function resetFilters() {
    setStatusFilter("All");
    setNameSearch("");
    setDurationFilter(0);
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setSelected(new Set());
  }

  function resetPagination() { setPage(1); setSelected(new Set()); }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) { pageIds.forEach((id) => next.delete(id)); }
      else                  { pageIds.forEach((id) => next.add(id)); }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function getSelectedIds(): Id<"leaveRequests">[] {
    return requests.filter((r) => selected.has(r._id as string)).map((r) => r._id);
  }

  async function handleApprove() {
    await approveFn({ ids: getSelectedIds() });
    setSelected(new Set());
    setConfirmApprove(false);
  }

  async function handleDecline() {
    await declineFn({ ids: getSelectedIds() });
    setSelected(new Set());
    setConfirmDecline(false);
  }

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Leave Register</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">All leave requests across the firm · sorted by date applied</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "#FFFBEB", color: "#D97706" }}>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTIONS.map((f) => (
          <button key={f}
            onClick={() => { setStatusFilter(f); resetPagination(); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={statusFilter === f
              ? { background: "#0B2349", color: "white" }
              : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Advanced filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Name search */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-white border border-[#E2E8F0] w-52">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name…"
            className="flex-1 bg-transparent text-[12px] text-[#1e293b] placeholder-[#94A3B8] outline-none min-w-0"
            value={nameSearch}
            onChange={(e) => { setNameSearch(e.target.value); resetPagination(); }}
          />
          {nameSearch && (
            <button onClick={() => { setNameSearch(""); resetPagination(); }}>
              <Icon name="x" className="w-3 h-3 text-[#94A3B8]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Duration */}
        <select
          value={durationFilter}
          onChange={(e) => { setDurationFilter(Number(e.target.value)); resetPagination(); }}
          className={"rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349] w-32"}
        >
          {DURATION_OPTIONS.map((opt, i) => (
            <option key={i} value={i}>{opt.label}</option>
          ))}
        </select>

        {/* Date applied from */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">Applied from</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPagination(); }}
            className={inputCls + " w-32"}
          />
        </div>

        {/* Date applied to */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => { setDateTo(e.target.value); resetPagination(); }}
            className={inputCls + " w-32"}
          />
        </div>

        {/* Clear all */}
        {hasExtraFilters && (
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
            style={{ color: "#64748B" }}>
            <Icon name="x" className="w-3 h-3" strokeWidth={2.5} /> Clear filters
          </button>
        )}

        {/* Result count when filtered */}
        {(hasExtraFilters || statusFilter !== "All") && (
          <span className="text-[11px] text-[#94A3B8] ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
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
            {paginated.map((r) => {
              const rid = r._id as string;
              const ss  = STATUS_STYLE[r.status] ?? STATUS_STYLE.Pending;
              return (
                <tr key={rid} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={selected.has(rid) ? { background: "#EFF4FF" } : {}}>
                  <td className="pl-5 pr-3 py-3.5">
                    <Checkbox checked={selected.has(rid)} onChange={() => toggleRow(rid)} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                        {r.employeeName.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-[#1e293b] leading-tight">{r.employeeName}</p>
                        <p className="text-[10px] text-[#94A3B8]">{r.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-[#1e293b]">{r.type}</td>
                  <td className="px-3 py-3.5 text-[#64748B] text-[12px]">{r.from} – {r.to}</td>
                  <td className="px-3 py-3.5 font-semibold text-[#0B2349]">{r.days}d</td>
                  <td className="px-3 py-3.5 text-[#64748B] text-[12px]">{r.appliedDate}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    {r.status === "Pending" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(new Set([rid])); setConfirmApprove(true); }}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: "#ECFDF5", color: "#059669" }}>
                          Approve
                        </button>
                        <button
                          onClick={() => { setSelected(new Set([rid])); setConfirmDecline(true); }}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: "#FFF5F5", color: "#DC2626" }}>
                          Decline
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">
                  No leave requests match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      <ConfirmDialog isOpen={confirmApprove} onClose={() => setConfirmApprove(false)} onConfirm={handleApprove}
        title="Approve leave?" message={`Approve leave for ${selected.size} request${selected.size !== 1 ? "s" : ""}?`}
        confirmLabel="Approve" variant="success" />
      <ConfirmDialog isOpen={confirmDecline} onClose={() => setConfirmDecline(false)} onConfirm={handleDecline}
        title="Decline leave?" message={`Decline leave for ${selected.size} request${selected.size !== 1 ? "s" : ""}?`}
        confirmLabel="Decline" variant="danger" />
    </div>
  );
}
