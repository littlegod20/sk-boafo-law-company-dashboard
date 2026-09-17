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

const FILTERS = ["All", "Pending", "Approved", "Declined"];

export default function ExpenseClaimsPage() {
  const claims      = useQuery(api.expenseClaims.list) ?? [];
  const me          = useQuery(api.users.getCurrentUser);
  const submitClaim = useMutation(api.expenseClaims.create);
  const approveFn   = useMutation(api.expenseClaims.approve);
  const declineFn   = useMutation(api.expenseClaims.decline);

  const [filter,         setFilter]         = useState("All");
  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [showNew,        setShowNew]        = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [actioning,      setActioning]      = useState(false);
  const [form,           setForm]           = useState({ category: "", amount: "", date: "", description: "", receipt: false });

  const filtered   = claims.filter((c) => filter === "All" || c.status === filter);
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
          { label: "Total Claims",    value: String(claims.length),                    icon: "list" as const,         color: "#0B2349", bg: "#EFF4FF" },
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

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); setSelected(new Set()); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={filter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {f}
          </button>
        ))}
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
                <td colSpan={8} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">No expense claims found.</td>
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
            {/* Auto-filled employee info */}
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
