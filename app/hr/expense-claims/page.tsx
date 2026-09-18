"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { BulkToolbar, TBtn, Checkbox, Pagination } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

const CATEGORIES = [
  "Transportation",
  "Client Entertainment",
  "Office Supplies",
  "Training & Development",
  "Accommodation",
  "Meals",
  "Other",
];

const STATUS_FILTERS = ["All", "Pending", "Approved", "Declined"];

export default function ExpenseClaimsPage() {
  const claims      = useQuery(api.expenseClaims.list) ?? [];
  const me          = useQuery(api.users.getCurrentUser);
  const submitClaim = useMutation(api.expenseClaims.create);
  const approveFn   = useMutation(api.expenseClaims.approve);
  const declineFn   = useMutation(api.expenseClaims.decline);

  // ── Status filter ──────────────────────────────────────────────────────────
  const [statusFilter,   setStatusFilter]   = useState("All");

  // ── Extra filters ──────────────────────────────────────────────────────────
  const [nameSearch,     setNameSearch]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");
  const [amountMin,      setAmountMin]      = useState("");
  const [amountMax,      setAmountMax]      = useState("");

  // ── Bulk / pagination ──────────────────────────────────────────────────────
  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [showNew,        setShowNew]        = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [actioning,      setActioning]      = useState(false);
  const [form,           setForm]           = useState({ category: "", amount: "", date: "", description: "", receipt: false });

  const hasExtraFilters = nameSearch || categoryFilter || dateFrom || dateTo || amountMin || amountMax;

  function resetFilters() {
    setStatusFilter("All");
    setNameSearch("");
    setCategoryFilter("");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
    setPage(1);
    setSelected(new Set());
  }

  function resetPagination() { setPage(1); setSelected(new Set()); }

  // ── Filtering logic ────────────────────────────────────────────────────────
  const filtered = claims.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (nameSearch && !c.employeeName.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (amountMin && c.amount < parseFloat(amountMin)) return false;
    if (amountMax && c.amount > parseFloat(amountMax)) return false;
    if (dateFrom && c.date < dateFrom) return false;
    if (dateTo && c.date > dateTo) return false;
    return true;
  });

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds    = paginated.map((c) => c._id);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const pendingClaims  = claims.filter((c) => c.status === "Pending");
  const approvedClaims = claims.filter((c) => c.status === "Approved");
  const totalApproved  = approvedClaims.reduce((a, c) => a + c.amount, 0);
  const pendingAmount  = pendingClaims.reduce((a, c) => a + c.amount, 0);

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function handleSubmit() {
    if (!form.category || !form.amount || !form.date || !form.description) return;
    setSubmitting(true);
    try {
      await submitClaim({
        category:    form.category,
        amount:      parseFloat(form.amount),
        date:        form.date,
        description: form.description,
        receipt:     form.receipt,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    setActioning(true);
    try {
      await approveFn({ ids: Array.from(selected) as Id<"expenseClaims">[] });
      setSelected(new Set());
      setConfirmApprove(false);
    } finally {
      setActioning(false);
    }
  }

  async function handleDecline() {
    setActioning(true);
    try {
      await declineFn({ ids: Array.from(selected) as Id<"expenseClaims">[] });
      setSelected(new Set());
      setConfirmDecline(false);
    } finally {
      setActioning(false);
    }
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Expense Claims</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Submit and manage staff expense reimbursements</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setSubmitted(false); setForm({ category: "", amount: "", date: "", description: "", receipt: false }); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Submit Claim
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Claims",    value: String(claims.length),                    icon: "layers" as const,       color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pending",         value: String(pendingClaims.length),              icon: "clock" as const,        color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved Amount", value: `GH₵ ${totalApproved.toLocaleString()}`,  icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Pending Amount",  value: `GH₵ ${pendingAmount.toLocaleString()}`,  icon: "briefcase" as const,    color: "#DC2626", bg: "#FFF5F5" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{k.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <Icon name={k.icon} className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[22px] font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => { setStatusFilter(f); resetPagination(); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={statusFilter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
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

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); resetPagination(); }}
          className={"rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349] w-32"}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Amount range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">Amount</span>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={amountMin}
            onChange={(e) => { setAmountMin(e.target.value); resetPagination(); }}
            className={inputCls + " w-24"}
          />
          <span className="text-[11px] text-[#94A3B8]">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={amountMax}
            onChange={(e) => { setAmountMax(e.target.value); resetPagination(); }}
            className={inputCls + " w-24"}
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">Date from</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); resetPagination(); }}
            className={inputCls + " w-32"}
          />
        </div>
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

        {/* Result count */}
        {(hasExtraFilters || statusFilter !== "All") && (
          <span className="text-[11px] text-[#94A3B8] ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn onClick={() => setConfirmApprove(true)}>
            <Icon name="check-circle" className="w-3.5 h-3.5" strokeWidth={2} /> Approve
          </TBtn>
          <TBtn variant="danger" onClick={() => setConfirmDecline(true)}>
            <Icon name="x" className="w-3.5 h-3.5" strokeWidth={2} /> Decline
          </TBtn>
        </BulkToolbar>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              <th className="pl-5 pr-3 py-3.5 w-10">
                <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleAll} />
              </th>
              {["Employee", "Category", "Amount", "Date", "Receipt", "Status", "Submitted"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => {
              const ss         = STATUS_STYLE[c.status] ?? STATUS_STYLE.Pending;
              const isSelected = selected.has(c._id);
              return (
                <tr key={c._id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={isSelected ? { background: "#EFF4FF" } : {}}>
                  <td className="pl-5 pr-3 py-3.5 w-10">
                    <Checkbox checked={isSelected} onChange={() => {
                      setSelected((prev) => { const next = new Set(prev); if (next.has(c._id)) next.delete(c._id); else next.add(c._id); return next; });
                    }} />
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#1e293b]">{c.employeeName}</p>
                    <p className="text-[10px] text-[#94A3B8]">{c.role} · {c.claimRef}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.category}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0B2349]">GH₵ {c.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-[#64748B] text-[12px]">{c.date}</td>
                  <td className="px-5 py-3.5">
                    {c.receipt ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#059669" }}>
                        <Icon name="check-circle" className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8]">No</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-[11px]">{c.submittedDate}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">No expense claims match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      {/* Submit Claim modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Submit Expense Claim">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">Claim submitted</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Your expense claim is pending review.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowNew(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            {me && (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-[#F8FAFC]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                  {(me.name ?? me.email ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1e293b]">{me.name ?? me.email}</p>
                  <p className="text-[11px] text-[#94A3B8]">Submitting as you · auto-attributed on save</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required>
                <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Amount (GH₵)" required>
                <input type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </FormField>
              <FormField label="Date of Expense" required>
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </FormField>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.receipt}
                    onChange={(e) => setForm((f) => ({ ...f, receipt: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#0B2349]"
                  />
                  <span className="text-[13px] text-[#1e293b]">Receipt attached</span>
                </label>
              </div>
            </div>
            <FormField label="Description" required>
              <textarea className={inputCls} rows={3} placeholder="Brief description of the expense..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>
            <ModalFooter onClose={() => setShowNew(false)} confirmLabel={submitting ? "Submitting…" : "Submit Claim"} onConfirm={handleSubmit} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={handleApprove}
        title="Approve claims?"
        message={`Approve ${selected.size} expense claim${selected.size !== 1 ? "s" : ""}?`}
        confirmLabel={actioning ? "Approving…" : "Approve"}
        variant="success"
      />

      <ConfirmDialog
        isOpen={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        onConfirm={handleDecline}
        title="Decline claims?"
        message={`Decline ${selected.size} expense claim${selected.size !== 1 ? "s" : ""}? This can be reversed by approving later.`}
        confirmLabel={actioning ? "Declining…" : "Decline"}
        variant="danger"
      />
    </div>
  );
}
