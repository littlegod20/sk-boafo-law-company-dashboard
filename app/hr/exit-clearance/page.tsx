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
  "In Progress": { bg: "#FFFBEB", text: "#D97706" },
  "Cleared":     { bg: "#ECFDF5", text: "#059669" },
};

type ExitClearance = NonNullable<ReturnType<typeof useQuery<typeof api.exitClearances.list>>>[number];

export default function ExitClearancePage() {
  const clearances    = useQuery(api.exitClearances.list) ?? [];
  const createExit    = useMutation(api.exitClearances.create);
  const toggleItem    = useMutation(api.exitClearances.toggleItem);
  const markCleared   = useMutation(api.exitClearances.markCleared);

  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [detailRecord,   setDetailRecord]   = useState<ExitClearance | null>(null);
  const [showNew,        setShowNew]        = useState(false);
  const [created,        setCreated]        = useState(false);
  const [creating,       setCreating]       = useState(false);
  const [confirmClear,   setConfirmClear]   = useState(false);
  const [clearing,       setClearing]       = useState(false);
  const [togglingIdx,    setTogglingIdx]    = useState<number | null>(null);
  const [form,           setForm]           = useState({ name: "", role: "", dept: "", lastDay: "", reason: "" });

  const paginated = clearances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds   = paginated.map((c) => c._id);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  // Keep detail in sync with live query
  const liveDetail = detailRecord
    ? (clearances.find((c) => c._id === detailRecord._id) ?? detailRecord)
    : null;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function handleCreate() {
    if (!form.name || !form.role || !form.dept || !form.lastDay || !form.reason) return;
    setCreating(true);
    try {
      await createExit({
        name:    form.name,
        role:    form.role,
        dept:    form.dept,
        lastDay: form.lastDay,
        reason:  form.reason,
      });
      setCreated(true);
    } finally {
      setCreating(false);
    }
  }

  async function handleMarkCleared() {
    setClearing(true);
    try {
      await markCleared({ ids: Array.from(selected) as Id<"exitClearances">[] });
      setSelected(new Set());
      setConfirmClear(false);
    } finally {
      setClearing(false);
    }
  }

  async function handleToggleItem(id: Id<"exitClearances">, itemIndex: number) {
    setTogglingIdx(itemIndex);
    try {
      await toggleItem({ id, itemIndex });
    } finally {
      setTogglingIdx(null);
    }
  }

  const inProgress = clearances.filter((c) => c.status === "In Progress").length;
  const cleared    = clearances.filter((c) => c.status === "Cleared").length;
  const pendingItems = clearances.reduce((a, c) => a + c.clearanceItems.filter((i) => !i.done).length, 0);

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Exit Clearance</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Manage employee offboarding and clearance items</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setCreated(false); setForm({ name: "", role: "", dept: "", lastDay: "", reason: "" }); }}
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
          { label: "Total Exits",    value: String(clearances.length), icon: "users" as const,        color: "#0B2349", bg: "#EFF4FF" },
          { label: "In Progress",   value: String(inProgress),         icon: "clock" as const,        color: "#D97706", bg: "#FFFBEB" },
          { label: "Cleared",       value: String(cleared),            icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Pending Items", value: String(pendingItems),        icon: "list" as const,         color: "#DC2626", bg: "#FFF5F5" },
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

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn onClick={() => setConfirmClear(true)}>
            <Icon name="check-circle" className="w-3.5 h-3.5" strokeWidth={2} /> Mark Cleared
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
              {["Employee", "Department", "Last Day", "Reason", "Clearance", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => {
              const ss        = STATUS_STYLE[c.status] ?? STATUS_STYLE["In Progress"];
              const doneItems = c.clearanceItems.filter((i) => i.done).length;
              const isSelected = selected.has(c._id);
              return (
                <tr key={c._id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={isSelected ? { background: "#EFF4FF" } : {}}>
                  <td className="pl-5 pr-3 py-3.5 w-10">
                    <Checkbox checked={isSelected} onChange={() => {
                      setSelected((prev) => { const next = new Set(prev); if (next.has(c._id)) next.delete(c._id); else next.add(c._id); return next; });
                    }} />
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#1e293b]">{c.name}</p>
                    <p className="text-[10px] text-[#94A3B8]">{c.role} · {c.exitRef}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.dept}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.lastDay}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.reason}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.round((doneItems / c.clearanceItems.length) * 100)}%`, background: c.status === "Cleared" ? "#059669" : "#0B2349" }} />
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">{doneItems}/{c.clearanceItems.length}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDetailRecord(c)}
                      className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors"
                    >
                      <Icon name="eye" className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {clearances.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">No exit clearances found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} total={clearances.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!liveDetail} onClose={() => setDetailRecord(null)} title={liveDetail ? `${liveDetail.name} — Exit Clearance` : ""} maxWidth="520px">
        {liveDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                { label: "Role",     value: liveDetail.role },
                { label: "Dept",     value: liveDetail.dept },
                { label: "Last Day", value: liveDetail.lastDay },
                { label: "Reason",   value: liveDetail.reason },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg px-3 py-2 bg-[#F8FAFC]">
                  <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-[#1e293b] font-medium">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">Clearance Items</p>
              <div className="space-y-1.5">
                {liveDetail.clearanceItems.map((item, idx) => {
                  const isToggling = togglingIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleItem(liveDetail._id as Id<"exitClearances">, idx)}
                      disabled={isToggling}
                      className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:opacity-80"
                      style={{ background: item.done ? "#ECFDF5" : "#F8FAFC" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: item.done ? "#059669" : "#E2E8F0" }}>
                          {item.done && <Icon name="check" className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[12px]" style={{ color: item.done ? "#059669" : "#64748B" }}>{item.item}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] ml-3 flex-shrink-0">{item.owner}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-[#F8FAFC]">
              <span className="text-[12px] text-[#64748B]">Overall status</span>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[liveDetail.status].bg, color: STATUS_STYLE[liveDetail.status].text }}>
                {liveDetail.status}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Initiate Exit modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Initiate Exit Clearance">
        {created ? (
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
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Employee Name" required>
                <input className={inputCls} placeholder="e.g. Kofi Agyeman" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </FormField>
              <FormField label="Role" required>
                <input className={inputCls} placeholder="e.g. Associate" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </FormField>
              <FormField label="Department" required>
                <select className={inputCls} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Human Resources", "Administration", "IT"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Last Day" required>
                <input type="date" className={inputCls} value={form.lastDay} onChange={(e) => setForm((f) => ({ ...f, lastDay: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="Reason for Leaving" required>
              <select className={inputCls} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}>
                <option value="">Select...</option>
                {["Resignation", "Contract End", "Retirement", "Redundancy", "Termination"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <ModalFooter onClose={() => setShowNew(false)} confirmLabel={creating ? "Creating…" : "Initiate Exit"} onConfirm={handleCreate} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleMarkCleared}
        title="Mark as cleared?"
        message={`Mark ${selected.size} record${selected.size !== 1 ? "s" : ""} as fully cleared? All checklist items will be marked done.`}
        confirmLabel={clearing ? "Clearing…" : "Mark Cleared"}
        variant="success"
      />
    </div>
  );
}
