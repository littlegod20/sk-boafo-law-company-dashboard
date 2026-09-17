"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Emergency Leave", "Study Leave", "Maternity/Paternity"];

const BALANCE_META = [
  { label: "Annual Leave",  type: "Annual Leave",             total: 21, color: "#0B2349", bg: "#EFF4FF" },
  { label: "Sick Leave",    type: "Sick Leave",               total: 10, color: "#059669", bg: "#ECFDF5" },
  { label: "Study Leave",   type: "Study Leave",              total: 5,  color: "#7C3AED", bg: "#F5F3FF" },
  { label: "Emergency",     type: "Emergency Leave",          total: 3,  color: "#D97706", bg: "#FFFBEB" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

export default function MyLeavePage() {
  // ── Convex ──────────────────────────────────────────────────────────────────
  const history   = useQuery(api.leave.listMine) ?? [];
  const createFn  = useMutation(api.leave.create);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [showRequest, setShowRequest] = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [form,        setForm]        = useState({ type: LEAVE_TYPES[0], from: "", to: "", reason: "" });

  // ── Compute used days from live data ─────────────────────────────────────────
  function usedDays(leaveType: string) {
    return history
      .filter((r) => r.type === leaveType && r.status === "Approved")
      .reduce((sum, r) => sum + r.days, 0);
  }

  function calcDays(from: string, to: string): number {
    if (!from || !to) return 0;
    const diff = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(1, Math.round(diff / 86400000) + 1);
  }

  async function handleSubmit() {
    if (!form.from || !form.to) return;
    await createFn({
      type:   form.type,
      from:   new Date(form.from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      to:     new Date(form.to).toLocaleDateString("en-GB",   { day: "2-digit", month: "short", year: "numeric" }),
      days:   calcDays(form.from, form.to),
      reason: form.reason || undefined,
    });
    setSubmitted(true);
    setTimeout(() => { setShowRequest(false); setSubmitted(false); setForm({ type: LEAVE_TYPES[0], from: "", to: "", reason: "" }); }, 1400);
  }

  return (
    <div className="space-y-5 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">My Leave</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Track your leave balances and requests</p>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Request Leave
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BALANCE_META.map((b) => {
          const used      = usedDays(b.type);
          const remaining = b.total - used;
          const pct       = Math.min(100, Math.round((used / b.total) * 100));
          return (
            <div key={b.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">{b.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: b.bg }}>
                  <Icon name="umbrella" className="w-4 h-4" style={{ color: b.color }} />
                </div>
              </div>
              <p className="text-[28px] font-bold leading-none" style={{ color: b.color }}>{remaining}</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">{used} used of {b.total} days</p>
              <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: b.color, opacity: 0.5 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <h3 className="text-[14px] font-bold text-[#0B2349]">Leave History</h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Type", "From", "To", "Days", "Approved by", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[12px] text-[#94A3B8]">
                  No leave requests yet.
                </td>
              </tr>
            )}
            {history.map((r, i) => (
              <tr key={r._id as string} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={i % 2 === 1 ? { background: "#FAFBFC" } : {}}>
                <td className="px-5 py-3.5 font-medium text-[#1e293b]">{r.type}</td>
                <td className="px-5 py-3.5 text-[#64748B]">{r.from}</td>
                <td className="px-5 py-3.5 text-[#64748B]">{r.to}</td>
                <td className="px-5 py-3.5 font-semibold text-[#0B2349]">{r.days}d</td>
                <td className="px-5 py-3.5 text-[#64748B]">{r.approvedByName ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].text }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request leave modal */}
      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Request Leave">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="text-[15px] font-semibold text-[#0B2349]">Request submitted</p>
            <p className="text-[12px] text-[#64748B]">Your leave request is pending approval.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <FormField label="Leave Type">
                <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="From">
                  <input type="date" className={inputCls} value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
                </FormField>
                <FormField label="To">
                  <input type="date" className={inputCls} value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
                </FormField>
              </div>
              {form.from && form.to && (
                <p className="text-[12px] text-[#64748B]">
                  Duration: <span className="font-semibold text-[#0B2349]">{calcDays(form.from, form.to)} day{calcDays(form.from, form.to) !== 1 ? "s" : ""}</span>
                </p>
              )}
              <FormField label="Reason (optional)">
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Brief reason for leave…" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
              </FormField>
            </div>
            <ModalFooter onClose={() => setShowRequest(false)} confirmLabel="Submit Request" onConfirm={handleSubmit} />
          </>
        )}
      </Modal>
    </div>
  );
}
