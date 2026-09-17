"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";

const INITIAL_DOCUMENTS = [
  { id: "DOC-2026-089", name: "Amended Settlement Agreement.pdf", type: "Settlement Agreement", case: "SKB-2026-047", client: "Ofori & Sons Ltd.", uploadedBy: "A. Mensah", date: "14 Sep 2026", size: "248 KB", status: "Pending Approval" },
  { id: "DOC-2026-088", name: "Retainer Agreement — TeleFlex.pdf", type: "Retainer Agreement", case: "SKB-2026-041", client: "TeleFlex Ghana", uploadedBy: "E. Darko", date: "12 Sep 2026", size: "182 KB", status: "Pending Approval" },
  { id: "DOC-2026-087", name: "Writ of Summons — Boateng v Estate.pdf", type: "Court Filing", case: "SKB-2026-046", client: "Adwoa Boateng", uploadedBy: "K. Asante", date: "11 Sep 2026", size: "94 KB", status: "Approved" },
  { id: "DOC-2026-086", name: "Power of Attorney — Akua Twum.pdf", type: "Power of Attorney", case: "SKB-2026-038", client: "Akua Twum", uploadedBy: "K. Asante", date: "07 Sep 2026", size: "71 KB", status: "Approved" },
  { id: "DOC-2026-085", name: "Mineral Rights Application.docx", type: "Application", case: "SKB-2026-045", client: "Ghana Mining Co.", uploadedBy: "E. Darko", date: "05 Sep 2026", size: "335 KB", status: "Approved" },
  { id: "DOC-2026-084", name: "Statement of Case — Osei.pdf", type: "Court Filing", case: "SKB-2026-040", client: "Kwame Osei", uploadedBy: "D. Owusu", date: "02 Sep 2026", size: "128 KB", status: "Pending Approval" },
  { id: "DOC-2026-083", name: "Conveyancing Deed — Accra Realty.pdf", type: "Deed", case: "SKB-2026-043", client: "Accra Realty Ltd.", uploadedBy: "D. Owusu", date: "28 Aug 2026", size: "412 KB", status: "Approved" },
  { id: "DOC-2026-082", name: "Employment Contract — Ama Sarpong.pdf", type: "Contract", case: "SKB-2026-036", client: "Ama Sarpong", uploadedBy: "D. Owusu", date: "22 Aug 2026", size: "156 KB", status: "Rejected" },
  { id: "DOC-2026-081", name: "Will & Testament — YAT.pdf", type: "Will", case: "SKB-2026-042", client: "Yaa Asantewaa Trust", uploadedBy: "K. Asante", date: "18 Aug 2026", size: "89 KB", status: "Approved" },
  { id: "DOC-2026-080", name: "NCA Licence Application.pdf", type: "Application", case: "SKB-2026-037", client: "Adom Broadcasting", uploadedBy: "A. Mensah", date: "10 Aug 2026", size: "520 KB", status: "Approved" },
];

const PAGE_SIZE = 6;

const TYPE_ICON_MAP: Record<string, { icon: string; color: string; bg: string }> = {
  "Settlement Agreement": { icon: "scale", color: "#0B2349", bg: "#EFF4FF" },
  "Retainer Agreement": { icon: "shield", color: "#7C3AED", bg: "#F5F3FF" },
  "Court Filing": { icon: "gavel", color: "#D97706", bg: "#FFFBEB" },
  "Power of Attorney": { icon: "file-text", color: "#059669", bg: "#ECFDF5" },
  Application: { icon: "file-text", color: "#64748B", bg: "#F1F5F9" },
  Deed: { icon: "building", color: "#C9A227", bg: "#FFFBEB" },
  Contract: { icon: "file-text", color: "#0B2349", bg: "#EFF4FF" },
  Will: { icon: "file-text", color: "#7C3AED", bg: "#F5F3FF" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  "Pending Approval": { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Rejected: { bg: "#FFF5F5", text: "#DC2626" },
};

const STATUS_FILTERS = ["All", "Pending Approval", "Approved", "Rejected"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [form, setForm] = useState({ name: "", caseId: "", docType: "", attorney: "" });

  // Bulk action confirm dialogs
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Download feedback
  const [downloadMsg, setDownloadMsg] = useState("");

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [statusFilter]);

  const filtered = documents.filter((d) =>
    statusFilter === "All" ? true : d.status === statusFilter
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageDocs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Selection helpers
  const pageIds = pageDocs.map((d) => d.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Bulk actions
  function handleBulkApprove() {
    setDocuments((prev) =>
      prev.map((d) => (selected.has(d.id) ? { ...d, status: "Approved" } : d))
    );
    setSelected(new Set());
    setConfirmApprove(false);
  }

  function handleBulkReject() {
    setDocuments((prev) =>
      prev.map((d) => (selected.has(d.id) ? { ...d, status: "Rejected" } : d))
    );
    setSelected(new Set());
    setConfirmReject(false);
  }

  function handleBulkDownload() {
    const count = selected.size;
    setSelected(new Set());
    setDownloadMsg(`Downloading ${count} file${count !== 1 ? "s" : ""}…`);
    setTimeout(() => setDownloadMsg(""), 3000);
  }

  function handleBulkDelete() {
    setDocuments((prev) => prev.filter((d) => !selected.has(d.id)));
    setSelected(new Set());
    setConfirmDelete(false);
    // If we deleted everything on the current page, go back one page
    setPage((p) => Math.max(1, p));
  }

  const selCount = selected.size;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Document Repository</h2>
          <p className="text-sm text-[#94A3B8]">{documents.length} documents — all matters</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => { setShowUpload(true); setUploaded(false); }}
          >
            <Icon name="upload" className="w-4 h-4" strokeWidth={2} />
            Upload Document
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]">
            <Icon name="folder" className="w-4 h-4" />
            Folders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Documents", value: String(documents.length), icon: "file-text" as const, color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pending Approval", value: String(documents.filter((d) => d.status === "Pending Approval").length), icon: "hourglass" as const, color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved This Month", value: "24", icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0B2349]">{s.value}</p>
              <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] flex-1 min-w-[200px]">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
          <input type="text" placeholder="Search documents..." className="flex-1 bg-transparent text-[13px] placeholder-[#94A3B8] outline-none text-[#1e293b]" />
        </div>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={statusFilter === s ? { background: "#0B2349", color: "white" } : { background: "#F5F7FA", color: "#64748B" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Download feedback */}
      {downloadMsg && (
        <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#059669]" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
          <Icon name="download" className="w-4 h-4" />
          {downloadMsg}
        </div>
      )}

      {/* Bulk Toolbar */}
      {selCount > 0 && (
        <BulkToolbar count={selCount} onClear={() => setSelected(new Set())}>
          <TBtn variant="success" onClick={() => setConfirmApprove(true)}>
            <Icon name="check-circle" className="w-3.5 h-3.5" />
            Approve
          </TBtn>
          <TBtn variant="danger" onClick={() => setConfirmReject(true)}>
            <Icon name="x" className="w-3.5 h-3.5" />
            Reject
          </TBtn>
          <TBtn variant="default" onClick={handleBulkDownload}>
            <Icon name="download" className="w-3.5 h-3.5" />
            Download
          </TBtn>
          <TBtn variant="danger" onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" className="w-3.5 h-3.5" />
            Delete
          </TBtn>
        </BulkToolbar>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                <th className="px-4 py-3.5 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={!allPageSelected && somePageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                {["Document", "Type", "Case", "Client", "Uploaded By", "Date", "Size", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageDocs.map((doc) => {
                const t = TYPE_ICON_MAP[doc.type] ?? TYPE_ICON_MAP.Application;
                const ss = STATUS_STYLES[doc.status] ?? STATUS_STYLES.Approved;
                const isSelected = selected.has(doc.id);
                return (
                  <tr
                    key={doc.id}
                    className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer"
                    style={isSelected ? { background: "#F0F4FF" } : undefined}
                  >
                    <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(doc.id)}
                        aria-label={`Select ${doc.name}`}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                          <Icon name={t.icon as any} className="w-4 h-4" style={{ color: t.color } as React.CSSProperties} />
                        </div>
                        <div>
                          <p className="font-medium text-[#1e293b] max-w-[200px] truncate">{doc.name}</p>
                          <p className="text-[10px] text-[#94A3B8] font-mono">{doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{doc.type}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#94A3B8]">{doc.case}</td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{doc.client}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{doc.uploadedBy}</td>
                    <td className="px-5 py-3.5 text-[#94A3B8] whitespace-nowrap">{doc.date}</td>
                    <td className="px-5 py-3.5 text-[#94A3B8]">{doc.size}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap" style={{ background: ss.bg, color: ss.text }}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors"><Icon name="download" className="w-3.5 h-3.5" /></button>
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors"><Icon name="eye" className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageDocs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">
                    No documents match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer — Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="border-t border-[#F1F5F9] px-5 py-3">
            <Pagination
              page={page}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        {uploaded ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" } as React.CSSProperties} />
            </div>
            <p className="font-semibold text-[#1e293b]">Document uploaded</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The document has been queued for approval.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowUpload(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl p-6 text-center border-2 border-dashed border-[#E2E8F0] hover:border-[#0B2349] transition-colors cursor-pointer"
              style={{ background: "#FAFBFC" }}
            >
              <Icon name="upload" className="w-8 h-8 mx-auto mb-2 text-[#94A3B8]" />
              <p className="text-[13px] font-medium text-[#374151]">Click to select a file or drag and drop</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">PDF, DOCX, XLSX — max 50 MB</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Document Name" required>
                <input className={inputCls} placeholder="e.g. Settlement Agreement.pdf" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </FormField>
              <FormField label="Case ID" required>
                <select className={inputCls} value={form.caseId} onChange={(e) => setForm((p) => ({ ...p, caseId: e.target.value }))}>
                  <option value="">Select case...</option>
                  {["SKB-2026-047", "SKB-2026-046", "SKB-2026-045", "SKB-2026-043", "SKB-2026-041", "SKB-2026-040", "SKB-2026-039"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Document Type" required>
                <select className={inputCls} value={form.docType} onChange={(e) => setForm((p) => ({ ...p, docType: e.target.value }))}>
                  <option value="">Select type...</option>
                  {["Settlement Agreement", "Retainer Agreement", "Court Filing", "Power of Attorney", "Application", "Deed", "Contract", "Will"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Uploaded By">
                <select className={inputCls} value={form.attorney} onChange={(e) => setForm((p) => ({ ...p, attorney: e.target.value }))}>
                  <option value="">Select attorney...</option>
                  {["A. Mensah", "K. Asante", "E. Darko", "D. Owusu"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter
              onClose={() => setShowUpload(false)}
              confirmLabel="Upload Document"
              onConfirm={() => { if (form.name && form.caseId) { setUploaded(true); setForm({ name: "", caseId: "", docType: "", attorney: "" }); } }}
            />
          </div>
        )}
      </Modal>

      {/* Confirm: Approve */}
      <ConfirmDialog
        isOpen={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={handleBulkApprove}
        title="Approve Documents"
        message={`Approve ${selCount} selected document${selCount !== 1 ? "s" : ""}? Their status will be updated to Approved.`}
        confirmLabel="Approve"
        variant="success"
      />

      {/* Confirm: Reject */}
      <ConfirmDialog
        isOpen={confirmReject}
        onClose={() => setConfirmReject(false)}
        onConfirm={handleBulkReject}
        title="Reject Documents"
        message={`Reject ${selCount} selected document${selCount !== 1 ? "s" : ""}? Their status will be updated to Rejected.`}
        confirmLabel="Reject"
        variant="danger"
      />

      {/* Confirm: Delete */}
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Documents"
        message={`Permanently delete ${selCount} selected document${selCount !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
