"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// Data shape for display (mapped from Convex doc)
// ---------------------------------------------------------------------------

type CaseRow = {
  id: string;
  _id: Id<"cases">;
  client: string;
  clientType: string;
  type: string;
  attorney: string;
  status: string;
  filed: string;
  hearing: string;
  priority: string;
};

const STATUSES    = ["All", "Active", "Pending", "On Hold", "Closed"];
const TYPES       = ["All Types", "Corporate", "Estate & Probate", "Mining & Energy", "Real Estate", "Employment", "Telecom & Tech", "Litigation", "Land & Chieftaincy"];
const ATTORNEYS   = ["All Attorneys", "A. Mensah", "K. Asante", "E. Darko", "D. Owusu"];
const PAGE_SIZE   = 6;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Active:   { bg: "#ECFDF5", text: "#059669" },
    Pending:  { bg: "#FFFBEB", text: "#D97706" },
    "On Hold":{ bg: "#F1F5F9", text: "#64748B" },
    Closed:   { bg: "#F8FAFC", text: "#94A3B8" },
  };
  const s = map[status] ?? { bg: "#F1F5F9", text: "#64748B" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = { High: "#DC2626", Medium: "#D97706", Low: "#94A3B8" };
  return (
    <span className="flex items-center gap-1 text-[11px]" style={{ color: map[p] ?? "#94A3B8" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map[p] }} />
      {p}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CasesPage() {
  // ── Convex data ────────────────────────────────────────────────────────────
  const rawCases = useQuery(api.cases.list);
  const bulkUpdateStatus = useMutation(api.cases.bulkUpdateStatus);
  const bulkReassign     = useMutation(api.cases.bulkReassign);
  const removeCases      = useMutation(api.cases.remove);
  const createCase       = useMutation(api.cases.create);

  // ── Flatten to display shape ───────────────────────────────────────────────
  const cases: CaseRow[] = (rawCases ?? []).map((c) => ({
    id:         c.caseNumber,
    _id:        c._id,
    client:     c.clientName,
    clientType: c.clientType,
    type:       c.type,
    attorney:   c.attorney,
    status:     c.status,
    filed:      c.openedDate,
    hearing:    c.nextHearing ?? "—",
    priority:   c.priority,
  }));

  // ── filters ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [attyFilter,   setAttyFilter]   = useState("All Attorneys");
  const [search,       setSearch]       = useState("");

  // ── pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [statusFilter, typeFilter, attyFilter, search]);

  // ── selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── new-case modal ────────────────────────────────────────────────────────
  const allClients = useQuery(api.clients.list);
  const [showNewCase, setShowNewCase] = useState(false);
  const [newCase, setNewCase] = useState({
    title: "", clientId: "" as Id<"clients"> | "", practiceArea: "", attorney: "", priority: "Medium", description: "",
  });
  const [caseAdded, setCaseAdded] = useState(false);

  // ── bulk-action modals ────────────────────────────────────────────────────
  const [showStatusModal,  setShowStatusModal]  = useState(false);
  const [showReassign,     setShowReassign]     = useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm]= useState(false);
  const [bulkStatus,       setBulkStatus]       = useState("Active");
  const [bulkAttorney,     setBulkAttorney]     = useState("A. Mensah");

  // ── export flash ──────────────────────────────────────────────────────────
  const [exportMsg, setExportMsg] = useState("");

  // ── derived: filtered + paged ─────────────────────────────────────────────
  const filtered = cases.filter((c) => {
    if (statusFilter !== "All"         && c.status   !== statusFilter) return false;
    if (typeFilter   !== "All Types"   && c.type     !== typeFilter)   return false;
    if (attyFilter   !== "All Attorneys" && c.attorney !== attyFilter) return false;
    if (
      search &&
      !c.client.toLowerCase().includes(search.toLowerCase()) &&
      !c.id.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── select-all logic ──────────────────────────────────────────────────────
  const pagedIds        = paged.map((c) => c.id);
  const selectedOnPage  = pagedIds.filter((id) => selected.has(id));
  const allPageSelected = pagedIds.length > 0 && selectedOnPage.length === pagedIds.length;
  const somePageSelected= selectedOnPage.length > 0 && !allPageSelected;

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pagedIds.forEach((id) => next.delete(id));
      } else {
        pagedIds.forEach((id) => next.add(id));
      }
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

  function clearSelection() { setSelected(new Set()); }

  // ── bulk actions ──────────────────────────────────────────────────────────
  function getSelectedIds(): Id<"cases">[] {
    return cases.filter((c) => selected.has(c.id)).map((c) => c._id);
  }

  async function applyBulkStatus() {
    const status = bulkStatus as "Active" | "Pending" | "On Hold" | "Closed" | "Settled";
    await bulkUpdateStatus({ ids: getSelectedIds(), status });
    clearSelection();
    setShowStatusModal(false);
  }

  async function applyBulkReassign() {
    await bulkReassign({ ids: getSelectedIds(), attorney: bulkAttorney });
    clearSelection();
    setShowReassign(false);
  }

  function handleExport() {
    const count = selected.size;
    clearSelection();
    setExportMsg(`Exported ${count} ${count === 1 ? "case" : "cases"}`);
    setTimeout(() => setExportMsg(""), 2000);
  }

  async function applyBulkDelete() {
    await removeCases({ ids: getSelectedIds() });
    clearSelection();
    setShowDeleteConfirm(false);
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">All Cases</h2>
          <p className="text-sm text-[#94A3B8]">{filtered.length} matters found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => setShowNewCase(true)}
          >
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            New Case
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]">
            <Icon name="download" className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Export flash */}
      {exportMsg && (
        <div
          className="rounded-xl px-5 py-3 text-[13px] font-medium text-white flex items-center gap-2"
          style={{ background: "#059669" }}
        >
          <Icon name="check-circle" className="w-4 h-4" />
          {exportMsg}
        </div>
      )}

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={clearSelection}>
          <TBtn variant="default" onClick={() => { setBulkStatus("Active"); setShowStatusModal(true); }}>
            <Icon name="refresh" className="w-3.5 h-3.5" />
            Change Status
          </TBtn>
          <TBtn variant="default" onClick={() => { setBulkAttorney("A. Mensah"); setShowReassign(true); }}>
            <Icon name="user" className="w-3.5 h-3.5" />
            Reassign
          </TBtn>
          <TBtn variant="default" onClick={handleExport}>
            <Icon name="download" className="w-3.5 h-3.5" />
            Export
          </TBtn>
          <TBtn variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <Icon name="trash" className="w-3.5 h-3.5" />
            Delete
          </TBtn>
        </BulkToolbar>
      )}

      {/* Filters */}
      <div
        className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center"
        style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] flex-1 min-w-[180px]">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by case ID or client..."
            className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={
                statusFilter === s
                  ? { background: "#0B2349", color: "white" }
                  : { background: "#F5F7FA", color: "#64748B" }
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#64748B] bg-white outline-none"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Attorney filter */}
        <select
          className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#64748B] bg-white outline-none"
          value={attyFilter}
          onChange={(e) => setAttyFilter(e.target.value)}
        >
          {ATTORNEYS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Table card */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {/* Select-all checkbox */}
                <th className="pl-5 pr-2 py-3.5 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                {["Case ID", "Client", "Practice Area", "Assigned Attorney", "Priority", "Status", "Filed", "Next Hearing", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "#94A3B8" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => {
                const isSelected = selected.has(c.id);
                return (
                  <tr
                    key={c.id}
                    className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                    style={isSelected ? { background: "#F0F4FF" } : undefined}
                  >
                    {/* Row checkbox */}
                    <td className="pl-5 pr-2 py-3.5 w-10">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(c.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-[#0B2349] text-[11px] whitespace-nowrap">{c.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: "#EFF4FF", color: "#0B2349" }}
                        >
                          {c.client.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[#1e293b]">{c.client}</p>
                          <p className="text-[10px] text-[#94A3B8]">{c.clientType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.type}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ background: "#F5F3FF", color: "#7C3AED" }}
                        >
                          {c.attorney.replace(".", "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-[#64748B]">{c.attorney}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><PriorityBadge p={c.priority} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.filed}</td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.hearing}</td>
                    <td className="px-5 py-3.5">
                      <button className="rounded-lg p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                        <Icon name="eye" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#94A3B8]">
            <Icon name="briefcase" className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No cases match your filters</p>
          </div>
        )}

        {/* Pagination in card footer */}
        {filtered.length > 0 && (
          <Pagination
            page={page}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}
      </div>

      {/* ── New Case Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={showNewCase}
        onClose={() => { setShowNewCase(false); setCaseAdded(false); }}
        title="Open New Case"
      >
        {caseAdded ? (
          <div className="text-center py-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "#ECFDF5" }}
            >
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" } as React.CSSProperties} />
            </div>
            <p className="font-semibold text-[#1e293b]">Case opened successfully</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The new matter has been added to the case list.</p>
            <button
              className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
              style={{ background: "#0B2349" }}
              onClick={() => { setShowNewCase(false); setCaseAdded(false); }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Case Title" required>
                <input
                  className={inputCls}
                  placeholder="e.g. Ofori & Sons — Contract Dispute"
                  value={newCase.title}
                  onChange={(e) => setNewCase((p) => ({ ...p, title: e.target.value }))}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Client" required>
                  <select
                    className={inputCls}
                    value={newCase.clientId}
                    onChange={(e) => setNewCase((p) => ({ ...p, clientId: e.target.value as Id<"clients"> }))}
                  >
                    <option value="">Select client...</option>
                    {(allClients ?? []).map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Practice Area" required>
                  <select
                    className={inputCls}
                    value={newCase.practiceArea}
                    onChange={(e) => setNewCase((p) => ({ ...p, practiceArea: e.target.value }))}
                  >
                    <option value="">Select area...</option>
                    {["Corporate", "Litigation", "Estate & Probate", "Mining & Energy", "Real Estate", "Telecom & Tech", "Employment", "Land & Chieftaincy"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assigned Attorney" required>
                  <select
                    className={inputCls}
                    value={newCase.attorney}
                    onChange={(e) => setNewCase((p) => ({ ...p, attorney: e.target.value }))}
                  >
                    <option value="">Select attorney...</option>
                    {["A. Mensah", "K. Asante", "E. Darko", "D. Owusu"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Priority">
                  <select
                    className={inputCls}
                    value={newCase.priority}
                    onChange={(e) => setNewCase((p) => ({ ...p, priority: e.target.value }))}
                  >
                    {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Description">
                <textarea
                  className={inputCls + " resize-none"}
                  rows={3}
                  placeholder="Brief description of the matter..."
                  value={newCase.description}
                  onChange={(e) => setNewCase((p) => ({ ...p, description: e.target.value }))}
                />
              </FormField>
            </div>
            <ModalFooter
              onClose={() => setShowNewCase(false)}
              confirmLabel="Open Case"
              onConfirm={async () => {
                if (newCase.title && newCase.clientId) {
                  await createCase({
                    title: newCase.title,
                    clientId: newCase.clientId as Id<"clients">,
                    type: newCase.practiceArea || "Corporate",
                    attorney: newCase.attorney || "Unassigned",
                    priority: (newCase.priority as "High" | "Medium" | "Low") || "Medium",
                    description: newCase.description || undefined,
                  });
                  setCaseAdded(true);
                  setNewCase({ title: "", clientId: "", practiceArea: "", attorney: "", priority: "Medium", description: "" });
                }
              }}
            />
          </div>
        )}
      </Modal>

      {/* ── Change Status Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Status"
      >
        <div className="space-y-4">
          <FormField label="New Status">
            <select
              className={inputCls}
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              {["Active", "Pending", "On Hold", "Closed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </FormField>
          <p className="text-[12px] text-[#94A3B8]">
            This will update the status of{" "}
            <span className="font-semibold text-[#1e293b]">{selected.size}</span>{" "}
            {selected.size === 1 ? "case" : "cases"}.
          </p>
          <ModalFooter
            onClose={() => setShowStatusModal(false)}
            confirmLabel="Apply"
            onConfirm={applyBulkStatus}
          />
        </div>
      </Modal>

      {/* ── Reassign Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={showReassign}
        onClose={() => setShowReassign(false)}
        title="Reassign Attorney"
      >
        <div className="space-y-4">
          <FormField label="Assign To">
            <select
              className={inputCls}
              value={bulkAttorney}
              onChange={(e) => setBulkAttorney(e.target.value)}
            >
              {["A. Mensah", "K. Asante", "E. Darko", "D. Owusu"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </FormField>
          <p className="text-[12px] text-[#94A3B8]">
            This will reassign{" "}
            <span className="font-semibold text-[#1e293b]">{selected.size}</span>{" "}
            {selected.size === 1 ? "case" : "cases"} to the selected attorney.
          </p>
          <ModalFooter
            onClose={() => setShowReassign(false)}
            confirmLabel="Apply"
            onConfirm={applyBulkReassign}
          />
        </div>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={applyBulkDelete}
        title="Delete Cases"
        message={`Are you sure you want to permanently delete ${selected.size} ${selected.size === 1 ? "case" : "cases"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
