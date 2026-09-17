"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { BulkToolbar, TBtn, Checkbox, Pagination } from "@/components/TableControls";

const PAGE_SIZE = 6;

const EXITS = [
  {
    id: "EX-2026-006",
    name: "Kofi Asante",
    role: "Associate — Litigation",
    dept: "Litigation",
    lastDay: "30 Sep 2026",
    reason: "Resignation",
    status: "In Progress",
    clearanceItems: [
      { item: "Resignation letter received",  done: true,  owner: "HR" },
      { item: "Notice period acknowledged",    done: true,  owner: "HR" },
      { item: "Handover document prepared",    done: true,  owner: "Employee" },
      { item: "Active matters reassigned",     done: false, owner: "Line Manager" },
      { item: "IT equipment returned",         done: false, owner: "IT" },
      { item: "System access revoked",         done: false, owner: "IT" },
      { item: "Access card returned",          done: false, owner: "Admin" },
      { item: "Final payroll processed",       done: false, owner: "Finance" },
      { item: "Leave balance settled",         done: false, owner: "HR" },
      { item: "Exit interview conducted",      done: false, owner: "HR" },
    ],
  },
  {
    id: "EX-2026-005",
    name: "Abena Owusu",
    role: "Paralegal",
    dept: "Corporate Law",
    lastDay: "15 Sep 2026",
    reason: "End of Contract",
    status: "In Progress",
    clearanceItems: [
      { item: "Resignation letter received",  done: true,  owner: "HR" },
      { item: "Notice period acknowledged",    done: true,  owner: "HR" },
      { item: "Handover document prepared",    done: true,  owner: "Employee" },
      { item: "Active matters reassigned",     done: true,  owner: "Line Manager" },
      { item: "IT equipment returned",         done: true,  owner: "IT" },
      { item: "System access revoked",         done: true,  owner: "IT" },
      { item: "Access card returned",          done: false, owner: "Admin" },
      { item: "Final payroll processed",       done: false, owner: "Finance" },
      { item: "Leave balance settled",         done: false, owner: "HR" },
      { item: "Exit interview conducted",      done: false, owner: "HR" },
    ],
  },
  {
    id: "EX-2026-004",
    name: "Kweku Mensah",
    role: "Legal Secretary",
    dept: "Administration",
    lastDay: "31 Aug 2026",
    reason: "Resignation",
    status: "Cleared",
    clearanceItems: [
      { item: "Resignation letter received",  done: true, owner: "HR" },
      { item: "Notice period acknowledged",    done: true, owner: "HR" },
      { item: "Handover document prepared",    done: true, owner: "Employee" },
      { item: "Active matters reassigned",     done: true, owner: "Line Manager" },
      { item: "IT equipment returned",         done: true, owner: "IT" },
      { item: "System access revoked",         done: true, owner: "IT" },
      { item: "Access card returned",          done: true, owner: "Admin" },
      { item: "Final payroll processed",       done: true, owner: "Finance" },
      { item: "Leave balance settled",         done: true, owner: "HR" },
      { item: "Exit interview conducted",      done: true, owner: "HR" },
    ],
  },
  {
    id: "EX-2026-003",
    name: "Yaa Sarpong",
    role: "IT Support Specialist",
    dept: "IT",
    lastDay: "15 Aug 2026",
    reason: "Resignation",
    status: "Cleared",
    clearanceItems: [
      { item: "Resignation letter received",  done: true, owner: "HR" },
      { item: "Notice period acknowledged",    done: true, owner: "HR" },
      { item: "Handover document prepared",    done: true, owner: "Employee" },
      { item: "Active matters reassigned",     done: true, owner: "Line Manager" },
      { item: "IT equipment returned",         done: true, owner: "IT" },
      { item: "System access revoked",         done: true, owner: "IT" },
      { item: "Access card returned",          done: true, owner: "Admin" },
      { item: "Final payroll processed",       done: true, owner: "Finance" },
      { item: "Leave balance settled",         done: true, owner: "HR" },
      { item: "Exit interview conducted",      done: true, owner: "HR" },
    ],
  },
  {
    id: "EX-2026-002",
    name: "Nana Asare",
    role: "Corporate Law Associate",
    dept: "Corporate Law",
    lastDay: "31 Jul 2026",
    reason: "Redundancy",
    status: "Cleared",
    clearanceItems: [
      { item: "Resignation letter received",  done: true, owner: "HR" },
      { item: "Notice period acknowledged",    done: true, owner: "HR" },
      { item: "Handover document prepared",    done: true, owner: "Employee" },
      { item: "Active matters reassigned",     done: true, owner: "Line Manager" },
      { item: "IT equipment returned",         done: true, owner: "IT" },
      { item: "System access revoked",         done: true, owner: "IT" },
      { item: "Access card returned",          done: true, owner: "Admin" },
      { item: "Final payroll processed",       done: true, owner: "Finance" },
      { item: "Leave balance settled",         done: true, owner: "HR" },
      { item: "Exit interview conducted",      done: true, owner: "HR" },
    ],
  },
  {
    id: "EX-2026-001",
    name: "Ama Frimpong",
    role: "HR Administrator",
    dept: "Human Resources",
    lastDay: "30 Jun 2026",
    reason: "Retirement",
    status: "Cleared",
    clearanceItems: [
      { item: "Resignation letter received",  done: true, owner: "HR" },
      { item: "Notice period acknowledged",    done: true, owner: "HR" },
      { item: "Handover document prepared",    done: true, owner: "Employee" },
      { item: "Active matters reassigned",     done: true, owner: "Line Manager" },
      { item: "IT equipment returned",         done: true, owner: "IT" },
      { item: "System access revoked",         done: true, owner: "IT" },
      { item: "Access card returned",          done: true, owner: "Admin" },
      { item: "Final payroll processed",       done: true, owner: "Finance" },
      { item: "Leave balance settled",         done: true, owner: "HR" },
      { item: "Exit interview conducted",      done: true, owner: "HR" },
    ],
  },
];

const REASON_OPTIONS = ["Resignation", "End of Contract", "Redundancy", "Retirement", "Dismissal"];
const FILTERS = ["All", "In Progress", "Cleared"];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#FFFBEB", text: "#D97706" },
  "Cleared":     { bg: "#ECFDF5", text: "#059669" },
};

type Exit = typeof EXITS[number];

export default function ExitClearancePage() {
  const [exits] = useState<Exit[]>(EXITS);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<Exit | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [addedNew, setAddedNew] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", dept: "", lastDay: "", reason: REASON_OPTIONS[0] });

  const filtered   = exits.filter((e) => filter === "All" || e.status === filter);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds    = paginated.map((e) => e.id);
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

  const inProgress = exits.filter((e) => e.status === "In Progress").length;
  const cleared    = exits.filter((e) => e.status === "Cleared").length;
  const total      = exits.length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Exit Clearance</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Manage employee exit processes and clearance</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setAddedNew(false); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Initiate Exit
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exits",    value: String(total),       icon: "log-out" as const,      color: "#0B2349", bg: "#EFF4FF" },
          { label: "In Progress",    value: String(inProgress),  icon: "clock" as const,        color: "#D97706", bg: "#FFFBEB" },
          { label: "Cleared",        value: String(cleared),     icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "This Quarter",   value: String(exits.filter((e) => e.lastDay.includes("Sep 2026") || e.lastDay.includes("Aug 2026") || e.lastDay.includes("Jul 2026")).length), icon: "calendar" as const, color: "#7C3AED", bg: "#F5F3FF" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{k.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <Icon name={k.icon} className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[28px] font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
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
          <TBtn variant="success" onClick={() => setConfirmClear(true)}>
            <Icon name="check-circle" className="w-3.5 h-3.5" /> Mark Cleared
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
                {["Employee", "Department", "Last Day", "Reason", "Progress", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => {
                const ss = STATUS_STYLE[e.status];
                const done = e.clearanceItems.filter((c) => c.done).length;
                const pct  = Math.round((done / e.clearanceItems.length) * 100);
                const isSel = selected.has(e.id);
                return (
                  <tr key={e.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors" style={isSel ? { background: "#EFF4FF" } : {}}>
                    <td className="pl-5 pr-3 py-3.5 w-10">
                      <Checkbox checked={isSel} onChange={() => toggleRow(e.id)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                          {e.name.split(" ").map((w) => w[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1e293b]">{e.name}</p>
                          <p className="text-[10px] text-[#94A3B8] font-mono">{e.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{e.dept}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1e293b]">{e.lastDay}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{e.reason}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden min-w-[60px]">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#059669" : "#0B2349" }} />
                        </div>
                        <span className="text-[11px] font-semibold text-[#64748B]">{done}/{e.clearanceItems.length}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{e.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setDetailItem(e)} className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                        <Icon name="eye" className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem ? `${detailItem.name} — Exit Clearance` : ""} maxWidth="540px">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#F1F5F9]">
              {[
                { label: "Role",      value: detailItem.role },
                { label: "Last Day",  value: detailItem.lastDay },
                { label: "Reason",   value: detailItem.reason },
                { label: "Status",   value: detailItem.status },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">{r.label}</p>
                  <p className="text-[13px] font-medium text-[#1e293b] mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">Clearance Checklist</p>
              <div className="space-y-1.5">
                {detailItem.clearanceItems.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: c.done ? "#ECFDF5" : "#F8FAFC" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: c.done ? "#059669" : "#E2E8F0" }}>
                      {c.done && <Icon name="check" className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="flex-1 text-[12px]" style={{ color: c.done ? "#059669" : "#64748B" }}>{c.item}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#94A3B8" }}>{c.owner}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Initiate exit modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Initiate Exit Process">
        {addedNew ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">Exit process initiated</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The clearance checklist has been created.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowNew(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Employee Name" required>
              <input className={inputCls} placeholder="e.g. Kofi Owusu" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role" required>
                <input className={inputCls} placeholder="e.g. Associate" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </FormField>
              <FormField label="Department" required>
                <select className={inputCls} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Human Resources", "IT"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Last Working Day" required>
                <input type="date" className={inputCls} value={form.lastDay} onChange={(e) => setForm((f) => ({ ...f, lastDay: e.target.value }))} />
              </FormField>
              <FormField label="Exit Reason">
                <select className={inputCls} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}>
                  {REASON_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onClose={() => setShowNew(false)} confirmLabel="Initiate Exit" onConfirm={() => { if (form.name && form.role && form.dept && form.lastDay) setAddedNew(true); }} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { setSelected(new Set()); setConfirmClear(false); }}
        title="Mark as cleared?"
        message={`Mark ${selected.size} exit record${selected.size !== 1 ? "s" : ""} as fully cleared?`}
        confirmLabel="Mark Cleared"
        variant="success"
      />
    </div>
  );
}
