"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 6;

// "Sent" in DB displays with same amber style as "Pending" in old mock
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Paid:     { bg: "#ECFDF5", text: "#059669" },
  Sent:     { bg: "#FFFBEB", text: "#D97706" },
  Draft:    { bg: "#F1F5F9", text: "#64748B" },
  Overdue:  { bg: "#FFF5F5", text: "#DC2626" },
  Disputed: { bg: "#FFF5F5", text: "#DC2626" },
  Voided:   { bg: "#F1F5F9", text: "#94A3B8" },
};

// Display label: map "Sent" → "Pending" for user-facing label
function statusLabel(s: string) {
  return s === "Sent" ? "Pending" : s;
}

function fmt(n: number) { return `GHS ${n.toLocaleString()}`; }

export default function BillingPage() {
  // ── Convex ──────────────────────────────────────────────────────────────────
  const rawInvoices  = useQuery(api.billing.list);
  const allClients   = useQuery(api.clients.list);
  const allCases     = useQuery(api.cases.list);
  const markPaidFn   = useMutation(api.billing.markPaid);
  const voidFn       = useMutation(api.billing.voidInvoices);
  const createInv    = useMutation(api.billing.create);

  const invoices = rawInvoices ?? [];

  // ── Selection — keyed by invoiceNumber ──────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage]         = useState(1);

  // New Invoice modal
  const [showNew, setShowNew] = useState(false);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({
    clientId: "" as Id<"clients"> | "",
    caseId:   "" as Id<"cases">   | "",
    description: "",
    amount: "",
    dueDate: "",
    attorney: "",
    type: "Retainer",
  });

  // Confirm dialogs
  const [confirmMarkPaid, setConfirmMarkPaid] = useState(false);
  const [confirmReminder, setConfirmReminder] = useState(false);
  const [confirmVoid,     setConfirmVoid]     = useState(false);

  // Brief feedback
  const [feedback, setFeedback] = useState<string | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((a, i) => a + i.amount, 0);
  const outstanding  = invoices.filter((i) => i.status !== "Paid").reduce((a, i) => a + i.amount, 0);
  const overdue      = invoices.filter((i) => i.status === "Overdue").reduce((a, i) => a + i.amount, 0);
  const sentAmt      = invoices.filter((i) => i.status === "Sent" || i.status === "Draft").reduce((a, i) => a + i.amount, 0);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const pageInvoices = invoices.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Selection helpers ────────────────────────────────────────────────────────
  const pageNums = pageInvoices.map((i) => i.invoiceNumber);
  const allPageSelected  = pageNums.length > 0 && pageNums.every((n) => selected.has(n));
  const somePageSelected = pageNums.some((n) => selected.has(n));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) { pageNums.forEach((n) => next.delete(n)); }
      else                  { pageNums.forEach((n) => next.add(n)); }
      return next;
    });
  }

  function toggleRow(num: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  }

  function getSelectedIds(): Id<"invoices">[] {
    return invoices.filter((i) => selected.has(i.invoiceNumber)).map((i) => i._id);
  }

  // ── Bulk actions ─────────────────────────────────────────────────────────────
  async function doMarkPaid() {
    await markPaidFn({ ids: getSelectedIds() });
    setSelected(new Set());
    setConfirmMarkPaid(false);
  }

  function doSendReminder() {
    setSelected(new Set());
    setConfirmReminder(false);
    setFeedback("Reminders sent");
  }

  function doExport() {
    setSelected(new Set());
    setFeedback("Exported");
  }

  async function doVoid() {
    await voidFn({ ids: getSelectedIds() });
    setSelected(new Set());
    setConfirmVoid(false);
    setPage(1);
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Billing &amp; Invoices</h2>
          <p className="text-sm text-[#94A3B8]">Financial summary — {new Date().toLocaleString("en-GB", { month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => { setShowNew(true); setCreated(false); }}
          >
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            New Invoice
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]">
            <Icon name="download" className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Brief feedback toast */}
      {feedback && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium text-white shadow-lg"
          style={{ background: "#059669" }}
        >
          <Icon name="check-circle" className="w-4 h-4" style={{ color: "#fff" } as React.CSSProperties} />
          {feedback}
        </div>
      )}

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Revenue Collected", value: fmt(totalRevenue), icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Outstanding",       value: fmt(outstanding),  icon: "hourglass"   as const, color: "#D97706", bg: "#FFFBEB" },
          { label: "Overdue",           value: fmt(overdue),      icon: "alert"       as const, color: "#DC2626", bg: "#FFF5F5" },
          { label: "Pending / Sent",    value: fmt(sentAmt),      icon: "clock"       as const, color: "#64748B", bg: "#F1F5F9" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 flex flex-col gap-3" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0B2349]">{s.value}</p>
              <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Attorney + Invoices Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue by Attorney */}
        <div className="md:col-span-1 bg-white rounded-xl p-5" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 className="text-sm font-semibold text-[#0B2349] mb-1">Revenue by Attorney</h3>
          <p className="text-[11px] text-[#94A3B8] mb-4">{new Date().toLocaleString("en-GB", { month: "short", year: "numeric" })}</p>
          {(() => {
            const attyRevenue: Record<string, number> = {};
            invoices.filter((i) => i.status === "Paid").forEach((i) => {
              attyRevenue[i.attorney] = (attyRevenue[i.attorney] ?? 0) + i.amount;
            });
            const sorted = Object.entries(attyRevenue).sort((a, b) => b[1] - a[1]);
            const max = sorted[0]?.[1] ?? 1;
            const COLORS = ["#0B2349", "#C9A227", "#7C3AED", "#059669", "#D97706", "#DC2626"];
            return sorted.slice(0, 5).map(([name, amount], i) => (
              <div key={name} className="mb-3.5">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#374151] font-medium">{name}</span>
                  <span className="text-[#0B2349] font-semibold">GHS {(amount / 1000).toFixed(1)}k</span>
                </div>
                <div className="h-2 rounded-full bg-[#F1F5F9]">
                  <div className="h-2 rounded-full" style={{ width: `${(amount / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Invoices Panel */}
        <div className="md:col-span-2 bg-white rounded-xl overflow-hidden flex flex-col" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0B2349]">All Invoices</h3>
            {selected.size > 0 && <span className="text-[11px] text-[#64748B]">{selected.size} selected</span>}
          </div>

          {selected.size > 0 && (
            <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
              <TBtn variant="success" onClick={() => setConfirmMarkPaid(true)}>
                <Icon name="check-circle" className="w-3.5 h-3.5" /> Mark Paid
              </TBtn>
              <TBtn variant="default" onClick={() => setConfirmReminder(true)}>
                <Icon name="mail" className="w-3.5 h-3.5" /> Send Reminder
              </TBtn>
              <TBtn variant="default" onClick={doExport}>
                <Icon name="download" className="w-3.5 h-3.5" /> Export
              </TBtn>
              <TBtn variant="danger" onClick={() => setConfirmVoid(true)}>
                <Icon name="trash" className="w-3.5 h-3.5" /> Void
              </TBtn>
            </BulkToolbar>
          )}

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ background: "#FAFBFC" }}>
                  <th className="px-5 py-3 text-left">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={!allPageSelected && somePageSelected}
                      onChange={toggleAll}
                      aria-label="Select all on page"
                    />
                  </th>
                  {["Invoice", "Client", "Case", "Amount", "Status", "Due", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageInvoices.map((inv) => {
                  const ss = STATUS_STYLES[inv.status] ?? STATUS_STYLES.Sent;
                  const isSelected = selected.has(inv.invoiceNumber);
                  return (
                    <tr
                      key={inv._id}
                      className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                      style={isSelected ? { background: "#F0F4FF" } : undefined}
                    >
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleRow(inv.invoiceNumber)} aria-label={`Select ${inv.invoiceNumber}`} />
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium text-[#0B2349] text-[11px] whitespace-nowrap">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#1e293b]">{inv.clientName}</p>
                        <p className="text-[10px] text-[#94A3B8]">{inv.description}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#94A3B8]">{inv.caseNumber}</td>
                      <td className="px-5 py-3.5 font-semibold text-[#0B2349] whitespace-nowrap">{fmt(inv.amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: ss.bg, color: ss.text }}>
                          {statusLabel(inv.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{inv.dueDate}</td>
                      <td className="px-5 py-3.5">
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                          <Icon name="eye" className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pageInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-[12px] text-[#94A3B8]">
                      No invoices to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#F1F5F9] px-5 py-3 flex items-center justify-between">
            <p className="text-[11px] text-[#94A3B8]">
              Showing {invoices.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, invoices.length)} of {invoices.length} invoices
            </p>
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={invoices.length}
              onChange={(p) => { setPage(p); setSelected(new Set()); }}
            />
          </div>
        </div>
      </div>

      {/* New Invoice Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create New Invoice">
        {created ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" } as React.CSSProperties} />
            </div>
            <p className="font-semibold text-[#1e293b]">Invoice created</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The invoice has been sent to the client.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowNew(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Client" required>
                <select className={inputCls} value={form.clientId} onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value as Id<"clients"> }))}>
                  <option value="">Select client...</option>
                  {(allClients ?? []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Case">
                <select className={inputCls} value={form.caseId} onChange={(e) => setForm((p) => ({ ...p, caseId: e.target.value as Id<"cases"> }))}>
                  <option value="">Select case (optional)...</option>
                  {(allCases ?? [])
                    .filter((c) => !form.clientId || c.clientId === form.clientId)
                    .map((c) => <option key={c._id} value={c._id}>{c.caseNumber} — {c.clientName}</option>)}
                </select>
              </FormField>
              <div className="col-span-2">
                <FormField label="Service Type" required>
                  <select className={inputCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    {["Retainer", "Consultation", "Legal Services", "Conveyancing", "Court Appearances", "Document Preparation"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Description">
                  <input className={inputCls} placeholder="e.g. Legal services — Oct 2026" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Amount (GHS)" required>
                <input type="number" className={inputCls} placeholder="0.00" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              </FormField>
              <FormField label="Due Date" required>
                <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
              </FormField>
              <div className="col-span-2">
                <FormField label="Attorney">
                  <select className={inputCls} value={form.attorney} onChange={(e) => setForm((p) => ({ ...p, attorney: e.target.value }))}>
                    <option value="">Select attorney...</option>
                    {["A. Mensah", "K. Asante", "E. Darko", "D. Owusu"].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </FormField>
              </div>
            </div>
            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel="Create Invoice"
              onConfirm={async () => {
                if (form.clientId && form.amount && form.dueDate) {
                  await createInv({
                    clientId: form.clientId as Id<"clients">,
                    caseId: form.caseId ? (form.caseId as Id<"cases">) : undefined,
                    type: form.type,
                    amount: parseFloat(form.amount),
                    attorney: form.attorney || "Unassigned",
                    description: form.description || undefined,
                    dueDate: new Date(form.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                  });
                  setCreated(true);
                  setForm({ clientId: "", caseId: "", description: "", amount: "", dueDate: "", attorney: "", type: "Retainer" });
                }
              }}
            />
          </div>
        )}
      </Modal>

      {/* Confirm: Mark Paid */}
      <ConfirmDialog isOpen={confirmMarkPaid} onClose={() => setConfirmMarkPaid(false)} onConfirm={doMarkPaid} title="Mark as Paid" message={`Mark ${selected.size} invoice${selected.size !== 1 ? "s" : ""} as Paid?`} confirmLabel="Mark Paid" variant="success" />

      {/* Confirm: Send Reminder */}
      <ConfirmDialog isOpen={confirmReminder} onClose={() => setConfirmReminder(false)} onConfirm={doSendReminder} title="Send Reminders" message={`Send payment reminders for ${selected.size} invoice${selected.size !== 1 ? "s" : ""}?`} confirmLabel="Send Reminder" />

      {/* Confirm: Void */}
      <ConfirmDialog isOpen={confirmVoid} onClose={() => setConfirmVoid(false)} onConfirm={doVoid} title="Void Invoices" message={`Void and remove ${selected.size} invoice${selected.size !== 1 ? "s" : ""}? This cannot be undone.`} confirmLabel="Void" variant="danger" />
    </div>
  );
}
