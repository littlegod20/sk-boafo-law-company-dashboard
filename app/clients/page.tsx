"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls, ConfirmDialog } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";

const INITIAL_CLIENTS = [
  { id: "CLT-001", name: "Ofori & Sons Ltd.", type: "Corporate", contact: "+233 20 811 4401", email: "info@oforiandson.gh", activeCases: 3, totalCases: 5, joined: "Mar 2022", attorney: "A. Mensah" },
  { id: "CLT-002", name: "Adwoa Boateng", type: "Individual", contact: "+233 24 552 7703", email: "adwoa.b@gmail.com", activeCases: 1, totalCases: 2, joined: "Jan 2024", attorney: "K. Asante" },
  { id: "CLT-003", name: "Ghana Mining Co.", type: "Corporate", contact: "+233 30 274 1100", email: "legal@ghanamining.com", activeCases: 2, totalCases: 4, joined: "Jun 2021", attorney: "E. Darko" },
  { id: "CLT-004", name: "Kofi Agyeman", type: "Individual", contact: "+233 27 315 8890", email: "k.agyeman@outlook.com", activeCases: 1, totalCases: 1, joined: "Aug 2026", attorney: "A. Mensah" },
  { id: "CLT-005", name: "Accra Realty Ltd.", type: "Corporate", contact: "+233 30 278 4450", email: "admin@accra-realty.gh", activeCases: 1, totalCases: 3, joined: "Sep 2020", attorney: "D. Owusu" },
  { id: "CLT-006", name: "Yaa Asantewaa Trust", type: "Trust", contact: "+233 32 204 7700", email: "trust@yaaasantewaa.org", activeCases: 0, totalCases: 2, joined: "Nov 2019", attorney: "K. Asante" },
  { id: "CLT-007", name: "TeleFlex Ghana", type: "Corporate", contact: "+233 30 291 2233", email: "legal@teleflex.gh", activeCases: 1, totalCases: 2, joined: "Feb 2023", attorney: "E. Darko" },
  { id: "CLT-008", name: "Kwame Osei", type: "Individual", contact: "+233 26 448 1122", email: "kwameosei.law@yahoo.com", activeCases: 1, totalCases: 1, joined: "Jul 2026", attorney: "D. Owusu" },
  { id: "CLT-009", name: "Goldfields Minerals", type: "Corporate", contact: "+233 30 299 5500", email: "compliance@goldfields.gh", activeCases: 1, totalCases: 3, joined: "Apr 2019", attorney: "E. Darko" },
  { id: "CLT-010", name: "Akua Twum", type: "Individual", contact: "+233 20 767 3344", email: "akuatwum1987@gmail.com", activeCases: 1, totalCases: 1, joined: "Jun 2026", attorney: "K. Asante" },
  { id: "CLT-011", name: "Adom Broadcasting", type: "Corporate", contact: "+233 30 281 7788", email: "legal@adom.com.gh", activeCases: 1, totalCases: 2, joined: "Jan 2022", attorney: "A. Mensah" },
  { id: "CLT-012", name: "Ama Sarpong", type: "Individual", contact: "+233 55 224 9910", email: "ama.sarpong@hotmail.com", activeCases: 0, totalCases: 1, joined: "Jun 2026", attorney: "D. Owusu" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Corporate:  { bg: "#EFF4FF", text: "#1d4ed8" },
  Individual: { bg: "#F0FDF4", text: "#15803d" },
  Trust:      { bg: "#FDF4FF", text: "#7e22ce" },
};

// Avatar color palette — cycles through a set of brand-adjacent colors
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

type Client = typeof INITIAL_CLIENTS[number];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);

  // Add Client modal
  const [showAdd, setShowAdd] = useState(false);
  const [added, setAdded] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Corporate", phone: "", email: "", address: "", attorney: "" });

  // Filters / search (placeholder for future use — kept so filter reset wires in)
  const [filterType] = useState<string>("All");

  // Pagination
  const [page, setPage] = useState(1);

  // Row selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Bulk action modals
  const [showAssign, setShowAssign] = useState(false);
  const [assignAttorney, setAssignAttorney] = useState(ATTORNEYS[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [filterType]);

  // Derived: filtered list (extend this when search/filter controls are added)
  const filtered = clients;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Select-all state for current page
  const pageIds = paginated.map((c) => c.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAssignAttorney() {
    setClients((prev) =>
      prev.map((c) => (selected.has(c.id) ? { ...c, attorney: assignAttorney } : c))
    );
    setSelected(new Set());
    setShowAssign(false);
  }

  function handleExport() {
    setSelected(new Set());
    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2500);
  }

  function handleDelete() {
    setClients((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setShowDeleteConfirm(false);
    // Snap page back if current page is now beyond range
    setPage((p) => {
      const newTotal = Math.max(1, Math.ceil((clients.length - selected.size) / PAGE_SIZE));
      return Math.min(p, newTotal);
    });
  }

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
          { label: "Total Clients", value: 124, icon: "users" as const, color: "#0B2349", bg: "#EFF4FF" },
          { label: "Corporate",     value: 71,  icon: "building" as const, color: "#1d4ed8", bg: "#EFF4FF" },
          { label: "Individual",    value: 53,  icon: "user" as const, color: "#059669", bg: "#ECFDF5" },
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
          <TBtn onClick={handleExport}>
            Export
          </TBtn>
          <TBtn variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </TBtn>
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
                const isSelected = selected.has(c.id);
                return (
                  <tr
                    key={c.id}
                    className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                    style={isSelected ? { background: "#F0F5FF" } : undefined}
                  >
                    <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(c.id)}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#94A3B8]">{c.id}</td>
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
            </tbody>
          </table>
        </div>

        {/* Table Footer — Pagination */}
        <div className="border-t border-[#F1F5F9] px-5 py-3">
          <Pagination
            page={page}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
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
                <select className={inputCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
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
                <input className={inputCls} placeholder="+233 ..." value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
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
              onConfirm={() => {
                if (form.name) {
                  const newId = `CLT-${String(clients.length + 1).padStart(3, "0")}`;
                  setClients((prev) => [
                    ...prev,
                    {
                      id: newId,
                      name: form.name,
                      type: form.type,
                      contact: form.phone || "—",
                      email: form.email || "—",
                      activeCases: 0,
                      totalCases: 0,
                      joined: new Date().toLocaleString("en-GB", { month: "short", year: "numeric" }),
                      attorney: form.attorney || "Unassigned",
                    },
                  ]);
                  setAdded(true);
                  setForm({ name: "", type: "Corporate", phone: "", email: "", address: "", attorney: "" });
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
            <select
              className={inputCls}
              value={assignAttorney}
              onChange={(e) => setAssignAttorney(e.target.value)}
            >
              {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </FormField>
          <ModalFooter
            onClose={() => setShowAssign(false)}
            confirmLabel="Apply"
            onConfirm={handleAssignAttorney}
          />
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
