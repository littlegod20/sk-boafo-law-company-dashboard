"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls, ConfirmDialog } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Corporate:  { bg: "#EFF4FF", text: "#1d4ed8" },
  Individual: { bg: "#F0FDF4", text: "#15803d" },
  Trust:      { bg: "#FDF4FF", text: "#7e22ce" },
};

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" },
  { bg: "#F0FDF4", color: "#15803d" },
  { bg: "#FDF4FF", color: "#7e22ce" },
  { bg: "#EFF4FF", color: "#0B2349" },
];

function avatarStyle(index: number) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

const ATTORNEYS = ["A. Mensah", "K. Asante", "E. Darko", "D. Owusu"];
const PAGE_SIZE = 6;

export default function ClientsPage() {
  // ── Convex data ─────────────────────────────────────────────────────────────
  const rawClients = useQuery(api.clients.list);
  const createClient     = useMutation(api.clients.create);
  const assignAttorneyFn = useMutation(api.clients.assignAttorney);
  const removeClients    = useMutation(api.clients.remove);

  const clients = rawClients ?? [];

  // Add Client modal
  const [showAdd, setShowAdd] = useState(false);
  const [added, setAdded] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Corporate" as "Corporate" | "Individual" | "Trust", contact: "", email: "", address: "", attorney: "" });

  // Pagination
  const [page, setPage] = useState(1);

  // Row selection — uses clientRef as key
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Bulk action modals
  const [showAssign, setShowAssign] = useState(false);
  const [assignAttorney, setAssignAttorney] = useState(ATTORNEYS[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);

  // Reset page when data length changes
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [rawClients?.length]);

  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const paginated  = clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Select-all logic — keyed by clientRef
  const pageRefs = paginated.map((c) => c.clientRef);
  const allPageSelected  = pageRefs.length > 0 && pageRefs.every((r) => selected.has(r));
  const somePageSelected = pageRefs.some((r) => selected.has(r));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) { pageRefs.forEach((r) => next.delete(r)); }
      else                 { pageRefs.forEach((r) => next.add(r)); }
      return next;
    });
  }

  function toggleRow(ref: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });
  }

  function getSelectedIds(): Id<"clients">[] {
    return clients.filter((c) => selected.has(c.clientRef)).map((c) => c._id);
  }

  async function handleAssignAttorney() {
    await assignAttorneyFn({ ids: getSelectedIds(), attorney: assignAttorney });
    setSelected(new Set());
    setShowAssign(false);
  }

  function handleExport() {
    setSelected(new Set());
    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2500);
  }

  async function handleDelete() {
    await removeClients({ ids: getSelectedIds() });
    setSelected(new Set());
    setShowDeleteConfirm(false);
    setPage((p) => Math.min(p, Math.max(1, Math.ceil((clients.length - selected.size) / PAGE_SIZE))));
  }

  // Summary stats from live data
  const corporate  = clients.filter((c) => c.type === "Corporate").length;
  const individual = clients.filter((c) => c.type === "Individual").length;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Client Records</h2>
          <p className="text-sm text-[#94A3B8]">{clients.length} clients on file</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => { setShowAdd(true); setAdded(false); }}
          >
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            Add Client
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]"
            onClick={handleExport}
          >
            <Icon name="download" className="w-4 h-4" />
            {exportFeedback ? "Exported!" : "Export"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: clients.length, icon: "users" as const,    color: "#0B2349", bg: "#EFF4FF" },
          { label: "Corporate",     value: corporate,       icon: "building" as const, color: "#1d4ed8", bg: "#EFF4FF" },
          { label: "Individual",    value: individual,      icon: "user" as const,     color: "#059669", bg: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0B2349]">{s.value}</p>
              <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn onClick={() => { setAssignAttorney(ATTORNEYS[0]); setShowAssign(true); }}>
            Assign Attorney
          </TBtn>
          <TBtn onClick={handleExport}>Export</TBtn>
          <TBtn variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete</TBtn>
        </BulkToolbar>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                <th className="px-4 py-3.5 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={!allPageSelected && somePageSelected}
                    onChange={toggleAll}
                  />
                </th>
                {["Client ID", "Name", "Type", "Contact", "Active Cases", "Total Cases", "Lead Attorney", "Since", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, rowIdx) => {
                const tc = TYPE_COLORS[c.type] ?? { bg: "#F1F5F9", text: "#64748B" };
                const av = avatarStyle(rowIdx);
                const isSelected = selected.has(c.clientRef);
                return (
                  <tr
                    key={c._id}
                    className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                    style={isSelected ? { background: "#F0F5FF" } : undefined}
                  >
                    <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={() => toggleRow(c.clientRef)} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#94A3B8]">{c.clientRef}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[#1e293b]">{c.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: tc.bg, color: tc.text }}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.contact}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${c.activeCases > 0 ? "text-[#059669]" : "text-[#94A3B8]"}`}>
                        {c.activeCases}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.totalCases}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.attorney}</td>
                    <td className="px-5 py-3.5 text-[#94A3B8]">{c.joined}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                          <Icon name="eye" className="w-3.5 h-3.5" />
                        </button>
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                          <Icon name="edit" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#F1F5F9] px-5 py-3">
          <Pagination page={page} total={clients.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Client">
        {added ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" } as React.CSSProperties} />
            </div>
            <p className="font-semibold text-[#1e293b]">Client added</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The new client record has been created.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowAdd(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Full Name / Company Name" required>
                  <input className={inputCls} placeholder="e.g. Ofori & Sons Ltd." value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Client Type" required>
                <select className={inputCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "Corporate" | "Individual" | "Trust" }))}>
                  {["Corporate", "Individual", "Trust"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Lead Attorney">
                <select className={inputCls} value={form.attorney} onChange={(e) => setForm((p) => ({ ...p, attorney: e.target.value }))}>
                  <option value="">Assign attorney...</option>
                  {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </FormField>
              <FormField label="Phone Number">
                <input className={inputCls} placeholder="+233 ..." value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} />
              </FormField>
              <FormField label="Email Address">
                <input className={inputCls} type="email" placeholder="client@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </FormField>
              <div className="col-span-2">
                <FormField label="Address">
                  <input className={inputCls} placeholder="Physical address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </FormField>
              </div>
            </div>
            <ModalFooter
              onClose={() => setShowAdd(false)}
              confirmLabel="Add Client"
              onConfirm={async () => {
                if (form.name) {
                  await createClient({
                    name: form.name,
                    type: form.type,
                    contact: form.contact || "—",
                    email: form.email || "—",
                    address: form.address || undefined,
                    attorney: form.attorney || "Unassigned",
                  });
                  setAdded(true);
                  setForm({ name: "", type: "Corporate", contact: "", email: "", address: "", attorney: "" });
                }
              }}
            />
          </div>
        )}
      </Modal>

      {/* Assign Attorney Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Attorney">
        <div className="space-y-4">
          <p className="text-[13px] text-[#64748B]">
            Assign a lead attorney to <span className="font-semibold text-[#1e293b]">{selected.size}</span> selected client{selected.size !== 1 ? "s" : ""}.
          </p>
          <FormField label="Lead Attorney" required>
            <select className={inputCls} value={assignAttorney} onChange={(e) => setAssignAttorney(e.target.value)}>
              {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </FormField>
          <ModalFooter onClose={() => setShowAssign(false)} confirmLabel="Apply" onConfirm={handleAssignAttorney} />
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Clients"
        message={`Are you sure you want to delete ${selected.size} selected client${selected.size !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
