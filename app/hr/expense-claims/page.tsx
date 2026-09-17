"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { BulkToolbar, TBtn, Checkbox, Pagination } from "@/components/TableControls";

const PAGE_SIZE = 6;

const CLAIMS = [
  { id: "EXP-2026-012", employee: "Kofi Mensah",   role: "Associate",   category: "Court Filing Fees",   amount: 320.00, date: "14 Sep 2026", submitted: "15 Sep 2026", status: "Pending",  receipt: true,  description: "Filing fees for Asante v. Mensah — Supreme Court" },
  { id: "EXP-2026-011", employee: "Ama Darko",     role: "Paralegal",   category: "Travel & Transport",  amount: 85.50,  date: "13 Sep 2026", submitted: "14 Sep 2026", status: "Pending",  receipt: true,  description: "Taxi to Land Commission — title search" },
  { id: "EXP-2026-010", employee: "Yaa Bonsu",     role: "HR Officer",  category: "Training & CPD",      amount: 450.00, date: "10 Sep 2026", submitted: "11 Sep 2026", status: "Pending",  receipt: false, description: "Employment Law CPD conference registration" },
  { id: "EXP-2026-009", employee: "Kwame Osei",    role: "Associate",   category: "Client Entertainment", amount: 210.00, date: "08 Sep 2026", submitted: "09 Sep 2026", status: "Approved", receipt: true,  description: "Client lunch — Mensah Corp matter" },
  { id: "EXP-2026-008", employee: "Abena Asante",  role: "Admin",       category: "Office Supplies",     amount: 67.30,  date: "05 Sep 2026", submitted: "06 Sep 2026", status: "Approved", receipt: true,  description: "Printing supplies and stationery" },
  { id: "EXP-2026-007", employee: "Kojo Frimpong", role: "Partner",     category: "Travel & Transport",  amount: 1240.00, date: "01 Sep 2026", submitted: "03 Sep 2026", status: "Approved", receipt: true, description: "Flight and hotel — GBAR conference, Accra" },
  { id: "EXP-2026-006", employee: "Kofi Mensah",   role: "Associate",   category: "Court Filing Fees",   amount: 180.00, date: "28 Aug 2026", submitted: "29 Aug 2026", status: "Approved", receipt: true,  description: "High Court filing fees — Boateng matter" },
  { id: "EXP-2026-005", employee: "Efua Agyeman",  role: "Associate",   category: "Research Resources",  amount: 95.00,  date: "25 Aug 2026", submitted: "26 Aug 2026", status: "Declined", receipt: true,  description: "Westlaw subscription supplement — not pre-approved" },
];

const CATEGORIES = ["Court Filing Fees", "Travel & Transport", "Client Entertainment", "Office Supplies", "Training & CPD", "Research Resources", "Other"];
const FILTERS    = ["All", "Pending", "Approved", "Declined"];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Court Filing Fees":    "#0B2349",
  "Travel & Transport":   "#1d4ed8",
  "Client Entertainment": "#7C3AED",
  "Office Supplies":      "#059669",
  "Training & CPD":       "#D97706",
  "Research Resources":   "#DC2626",
  "Other":                "#64748B",
};

type Claim = typeof CLAIMS[number];

export default function ExpenseClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(CLAIMS);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showNew, setShowNew] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [form, setForm] = useState({ employee: "", category: CATEGORIES[0], amount: "", date: "", description: "" });

  const filtered   = claims.filter((c) => filter === "All" || c.status === filter);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds    = paginated.map((c) => c.id);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
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
    setClaims((prev) => prev.map((c) => selected.has(c.id) ? { ...c, status: "Approved" } : c));
    setSelected(new Set()); setConfirmApprove(false);
  }

  function handleDecline() {
    setClaims((prev) => prev.map((c) => selected.has(c.id) ? { ...c, status: "Declined" } : c));
    setSelected(new Set()); setConfirmDecline(false);
  }

  const pendingCount   = claims.filter((c) => c.status === "Pending").length;
  const pendingAmount  = claims.filter((c) => c.status === "Pending").reduce((a, c) => a + c.amount, 0);
  const approvedAmount = claims.filter((c) => c.status === "Approved").reduce((a, c) => a + c.amount, 0);
  const totalClaims    = claims.length;

  function fmt(n: number) {
    return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Expense Claims</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Submit and manage staff expense reimbursements</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setSubmitted(false); }}
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
          { label: "Total Claims",      value: String(totalClaims),  icon: "receipt" as const,      color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pending Approval",  value: String(pendingCount), icon: "clock" as const,        color: "#D97706", bg: "#FFFBEB" },
          { label: "Pending Amount",    value: fmt(pendingAmount),   icon: "dollar-sign" as const,  color: "#DC2626", bg: "#FFF5F5" },
          { label: "Approved YTD",      value: fmt(approvedAmount),  icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
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
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                <th className="pl-5 pr-3 py-3.5 w-10">
                  <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleAll} />
                </th>
                {["Employee", "Category", "Description", "Date", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => {
                const ss   = STATUS_STYLE[c.status];
                const isSel = selected.has(c.id);
                const catColor = CATEGORY_COLORS[c.category] ?? "#64748B";
                return (
                  <tr key={c.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors" style={isSel ? { background: "#EFF4FF" } : {}}>
                    <td className="pl-5 pr-3 py-3.5 w-10">
                      <Checkbox checked={isSel} onChange={() => toggleRow(c.id)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                          {c.employee.split(" ").map((w) => w[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1e293b]">{c.employee}</p>
                          <p className="text-[10px] text-[#94A3B8] font-mono">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${catColor}15`, color: catColor }}>{c.category}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="text-[#64748B] truncate">{c.description}</p>
                      {!c.receipt && <span className="text-[10px] font-medium text-amber-600">No receipt attached</span>}
                    </td>
                    <td className="px-4 py-3.5 text-[#64748B]">{c.date}</td>
                    <td className="px-4 py-3.5 font-bold text-[#0B2349]">{fmt(c.amount)}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {c.status === "Pending" && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(new Set([c.id])); setConfirmApprove(true); }} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#ECFDF5", color: "#059669" }}>Approve</button>
                          <button onClick={() => { setSelected(new Set([c.id])); setConfirmDecline(true); }} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#FFF5F5", color: "#DC2626" }}>Decline</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      {/* Submit claim modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Submit Expense Claim">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">Claim submitted</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Your expense claim is pending approval.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowNew(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required>
                <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Amount (GH₵)" required>
                <input type="number" className={inputCls} placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="Date of Expense" required>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Description" required>
              <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Brief description of the expense…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <Icon name="alert-triangle" className="w-4 h-4 flex-shrink-0" style={{ color: "#D97706" }} />
              <p className="text-[12px] text-[#92400E]">Please attach your receipt before submitting. Claims without receipts may be declined.</p>
            </div>
            <ModalFooter onClose={() => setShowNew(false)} confirmLabel="Submit Claim" onConfirm={() => { if (form.category && form.amount && form.date && form.description) setSubmitted(true); }} />
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmApprove} onClose={() => setConfirmApprove(false)} onConfirm={handleApprove} title="Approve claims?" message={`Approve ${selected.size} expense claim${selected.size !== 1 ? "s" : ""}? The employee${selected.size !== 1 ? "s" : ""} will be notified.`} confirmLabel="Approve" variant="success" />
      <ConfirmDialog isOpen={confirmDecline} onClose={() => setConfirmDecline(false)} onConfirm={handleDecline} title="Decline claims?" message={`Decline ${selected.size} expense claim${selected.size !== 1 ? "s" : ""}? The employee${selected.size !== 1 ? "s" : ""} will be notified.`} confirmLabel="Decline" variant="danger" />
    </div>
  );
}
