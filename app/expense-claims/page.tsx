"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { Pagination } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

export default function MyExpensesPage() {
  const claims      = useQuery(api.expenseClaims.listMine) ?? [];
  const me          = useQuery(api.users.getCurrentUser);
  const submitClaim = useMutation(api.expenseClaims.create);

  const [statusFilter, setStatusFilter] = useState("All");
  const [page,         setPage]         = useState(1);
  const [showNew,      setShowNew]      = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [form, setForm] = useState({ category: "", amount: "", date: "", description: "", receipt: false });

  const filtered = claims.filter((c) =>
    statusFilter === "All" || c.status === statusFilter
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingClaims  = claims.filter((c) => c.status === "Pending");
  const approvedClaims = claims.filter((c) => c.status === "Approved");
  const totalApproved  = approvedClaims.reduce((a, c) => a + c.amount, 0);
  const pendingAmount  = pendingClaims.reduce((a, c) => a + c.amount, 0);

  function openNew() {
    setShowNew(true);
    setSubmitted(false);
    setForm({ category: "", amount: "", date: "", description: "", receipt: false });
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

  return (
    <div className="space-y-5 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">My Expenses</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Submit and track your expense reimbursements</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Submit Claim
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Claims",    value: String(claims.length),                   icon: "layers" as const,       color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pending",         value: String(pendingClaims.length),             icon: "clock" as const,        color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved Total",  value: `GH₵ ${totalApproved.toLocaleString()}`, icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Pending Amount",  value: `GH₵ ${pendingAmount.toLocaleString()}`, icon: "briefcase" as const,    color: "#DC2626", bg: "#FFF5F5" },
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
        {["All", "Pending", "Approved", "Declined"].map((f) => (
          <button
            key={f}
            onClick={() => { setStatusFilter(f); setPage(1); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={statusFilter === f
              ? { background: "#0B2349", color: "white" }
              : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Ref", "Category", "Amount", "Date", "Receipt", "Status", "Submitted", "Decision"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => {
              const ss = STATUS_STYLE[c.status] ?? STATUS_STYLE.Pending;
              return (
                <tr key={c._id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#1e293b] text-[12px]">{c.claimRef}</p>
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
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-[11px]">{c.submittedDate}</td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-[11px]">
                    {c.status !== "Pending" && c.approvedByName ? (
                      <span className="text-[11px] text-[#64748B]">by {c.approvedByName}</span>
                    ) : c.status === "Pending" ? (
                      <span className="text-[11px] italic text-[#C4C9D4]">Awaiting review</span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#F1F5F9" }}>
                      <Icon name="receipt" className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                    <p className="text-[13px] font-medium text-[#64748B]">
                      {statusFilter === "All" ? "No expense claims yet" : `No ${statusFilter.toLowerCase()} claims`}
                    </p>
                    {statusFilter === "All" && (
                      <p className="text-[11px] text-[#94A3B8]">Submit your first claim using the button above.</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => setPage(p)} />
      </div>

      {/* Submit Claim modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Submit Expense Claim">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">Claim submitted</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Your expense claim is pending review by HR.</p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                onClick={() => { openNew(); }}
              >
                Submit another
              </button>
              <button
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-white"
                style={{ background: "#0B2349" }}
                onClick={() => setShowNew(false)}
              >
                Done
              </button>
            </div>
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
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputCls}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </FormField>
              <FormField label="Date of Expense" required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
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
              <textarea
                className={inputCls}
                rows={3}
                placeholder="Brief description of the expense..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </FormField>
            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel={submitting ? "Submitting…" : "Submit Claim"}
              onConfirm={handleSubmit}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
