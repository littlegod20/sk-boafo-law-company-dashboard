"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ConfirmDialog, Modal } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";

const PAGE_SIZE = 5;

const INITIAL_APPROVALS = [
  { id: "APR-2026-031", type: "Document Approval", title: "Amended Settlement Agreement — SKB-2026-047", submittedBy: "A. Mensah", date: "14 Sep 2026", case: "SKB-2026-047", client: "Ofori & Sons Ltd.", priority: "Urgent", status: "Pending" },
  { id: "APR-2026-030", type: "Invoice Approval", title: "Invoice INV-2026-041 — GHS 12,500", submittedBy: "Admin", date: "13 Sep 2026", case: "SKB-2026-045", client: "Ghana Mining Co.", priority: "High", status: "Pending" },
  { id: "APR-2026-029", type: "Retainer Agreement", title: "New Retainer — TeleFlex Ghana", submittedBy: "E. Darko", date: "12 Sep 2026", case: "SKB-2026-041", client: "TeleFlex Ghana", priority: "Medium", status: "Pending" },
  { id: "APR-2026-028", type: "Court Filing", title: "Writ of Summons — Adwoa Boateng v. Estate", submittedBy: "K. Asante", date: "11 Sep 2026", case: "SKB-2026-046", client: "Adwoa Boateng", priority: "High", status: "Pending" },
  { id: "APR-2026-027", type: "Letter to Court", title: "Application for Adjournment — SKB-2026-040", submittedBy: "D. Owusu", date: "10 Sep 2026", case: "SKB-2026-040", client: "Kwame Osei", priority: "Medium", status: "Pending" },
  { id: "APR-2026-026", type: "Invoice Approval", title: "Invoice INV-2026-039 — GHS 8,200", submittedBy: "Admin", date: "08 Sep 2026", case: "SKB-2026-039", client: "Goldfields Minerals", priority: "Low", status: "Approved" },
  { id: "APR-2026-025", type: "Document Approval", title: "Power of Attorney — Akua Twum", submittedBy: "K. Asante", date: "07 Sep 2026", case: "SKB-2026-038", client: "Akua Twum", priority: "Low", status: "Approved" },
  { id: "APR-2026-024", type: "Court Filing", title: "Statement of Case — Ama Sarpong", submittedBy: "D. Owusu", date: "05 Sep 2026", case: "SKB-2026-036", client: "Ama Sarpong", priority: "Low", status: "Rejected" },
];

type ApprovalStatus = "Pending" | "Approved" | "Rejected";

const TYPE_ICONS: Record<string, "file-text" | "receipt" | "gavel" | "mail" | "shield"> = {
  "Document Approval": "file-text",
  "Invoice Approval": "receipt",
  "Court Filing": "gavel",
  "Letter to Court": "mail",
  "Retainer Agreement": "shield",
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  Urgent: { bg: "#FFF5F5", text: "#DC2626" },
  High:   { bg: "#FFFBEB", text: "#D97706" },
  Medium: { bg: "#EFF4FF", text: "#2563eb" },
  Low:    { bg: "#F1F5F9", text: "#64748B" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Rejected: { bg: "#FFF5F5", text: "#DC2626" },
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Row selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Bulk confirm dialogs
  const [confirmBulkApprove, setConfirmBulkApprove] = useState(false);
  const [confirmBulkReject, setConfirmBulkReject] = useState(false);

  const pending = approvals.filter((a) => a.status === "Pending");
  const approvedToday = approvals.filter((a) => a.status === "Approved").length;
  const rejected = approvals.filter((a) => a.status === "Rejected").length;

  // Paged slice from full approvals array
  const paged = approvals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedIds = paged.map((a) => a.id);

  // Select-all state for current page
  const allPageSelected = pagedIds.length > 0 && pagedIds.every((id) => selected.has(id));
  const somePageSelected = pagedIds.some((id) => selected.has(id));

  const setStatus = (id: string, status: ApprovalStatus) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setExpanded(null);
  };

  const handleSelectAll = () => {
    if (allPageSelected) {
      // Deselect all on page
      setSelected((prev) => {
        const next = new Set(prev);
        pagedIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all on page
      setSelected((prev) => {
        const next = new Set(prev);
        pagedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleToggleRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkApprove = () => {
    setApprovals((prev) =>
      prev.map((a) =>
        selected.has(a.id) && a.status === "Pending" ? { ...a, status: "Approved" } : a
      )
    );
    setSelected(new Set());
    setConfirmBulkApprove(false);
  };

  const handleBulkReject = () => {
    setApprovals((prev) =>
      prev.map((a) =>
        selected.has(a.id) && a.status === "Pending" ? { ...a, status: "Rejected" } : a
      )
    );
    setSelected(new Set());
    setConfirmBulkReject(false);
  };

  const viewItem = approvals.find((a) => a.id === viewDoc);

  const selectedCount = selected.size;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Approval Queue</h2>
          <p className="text-sm text-[#94A3B8]">{pending.length} items awaiting your review</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending",        count: pending.length, color: "#D97706", bg: "#FFFBEB", icon: "hourglass"    as const },
          { label: "Approved Today", count: approvedToday,  color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
          { label: "Rejected",       count: rejected,       color: "#DC2626", bg: "#FFF5F5", icon: "xmark-circle" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk toolbar — visible when any items are selected */}
      {selectedCount > 0 && (
        <BulkToolbar count={selectedCount} onClear={() => setSelected(new Set())}>
          <TBtn variant="success" onClick={() => setConfirmBulkApprove(true)}>
            <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
            Approve All
          </TBtn>
          <TBtn variant="danger" onClick={() => setConfirmBulkReject(true)}>
            <Icon name="x" className="w-3.5 h-3.5" strokeWidth={2.5} />
            Reject All
          </TBtn>
        </BulkToolbar>
      )}

      {/* Select-all bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
        style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
      >
        <Checkbox
          checked={allPageSelected}
          indeterminate={!allPageSelected && somePageSelected}
          onChange={handleSelectAll}
        />
        <span className="text-[12px] text-[#94A3B8] select-none">Select all on this page</span>
      </div>

      {/* Approval List */}
      <div className="space-y-3">
        {paged.map((item) => {
          const ps = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.Low;
          const ss = STATUS_STYLES[item.status] ?? STATUS_STYLES.Pending;
          const iconName = TYPE_ICONS[item.type] ?? "file-text";
          const isExpanded = expanded === item.id;
          const isChecked = selected.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden transition-all"
              style={{
                border: `1px solid ${isExpanded ? "#0B2349" : "#F1F5F9"}`,
                boxShadow: isExpanded ? "0 4px 16px rgba(11,35,73,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : item.id)}
              >
                {/* Row checkbox — stopPropagation so it doesn't expand/collapse */}
                <div className="flex items-center mt-1 flex-shrink-0" onClick={(e) => handleToggleRow(e, item.id)}>
                  <Checkbox
                    checked={isChecked}
                    onChange={() => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      item.status === "Pending"  ? "#EFF4FF"
                      : item.status === "Approved" ? "#ECFDF5"
                      : "#FFF5F5",
                  }}
                >
                  <Icon
                    name={iconName}
                    className="w-5 h-5"
                    style={{
                      color:
                        item.status === "Pending"  ? "#0B2349"
                        : item.status === "Approved" ? "#059669"
                        : "#DC2626",
                    } as React.CSSProperties}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#1e293b] text-[13px]">{item.title}</p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        {item.type} · {item.case} · Submitted by {item.submittedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: ps.bg, color: ps.text }}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                        {item.status}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">{item.date}</span>
                    </div>
                  </div>
                </div>

                <Icon
                  name="chevron-down"
                  className={`w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-[#F1F5F9] px-4 py-4" style={{ background: "#FAFBFC" }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] mb-4">
                    <div><p className="text-[#94A3B8] mb-1">Client</p><p className="font-medium text-[#1e293b]">{item.client}</p></div>
                    <div><p className="text-[#94A3B8] mb-1">Case</p><p className="font-medium font-mono text-[#0B2349]">{item.case}</p></div>
                    <div><p className="text-[#94A3B8] mb-1">Submitted By</p><p className="font-medium text-[#1e293b]">{item.submittedBy}</p></div>
                    <div><p className="text-[#94A3B8] mb-1">Date Submitted</p><p className="font-medium text-[#1e293b]">{item.date}</p></div>
                  </div>

                  {item.status === "Pending" && (
                    <div className="flex gap-3">
                      <button
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
                        style={{ background: "#059669" }}
                        onClick={(e) => { e.stopPropagation(); setConfirmApprove(item.id); }}
                      >
                        <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                        Approve
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-medium"
                        style={{ borderColor: "#DC2626", color: "#DC2626" }}
                        onClick={(e) => { e.stopPropagation(); setConfirmReject(item.id); }}
                      >
                        <Icon name="x" className="w-4 h-4" strokeWidth={2.5} />
                        Reject
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA] transition-colors"
                        onClick={(e) => { e.stopPropagation(); setViewDoc(item.id); }}
                      >
                        <Icon name="eye" className="w-4 h-4" />
                        View Document
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <Pagination
          page={page}
          total={approvals.length}
          pageSize={PAGE_SIZE}
          onChange={(p) => {
            setPage(p);
            setExpanded(null);
          }}
        />
      </div>

      {/* Per-item Approve confirm */}
      <ConfirmDialog
        isOpen={!!confirmApprove}
        onClose={() => setConfirmApprove(null)}
        onConfirm={() => confirmApprove && setStatus(confirmApprove, "Approved")}
        title="Approve this item?"
        message="This will mark the item as Approved and notify the submitting attorney."
        confirmLabel="Approve"
        variant="success"
      />

      {/* Per-item Reject confirm */}
      <ConfirmDialog
        isOpen={!!confirmReject}
        onClose={() => setConfirmReject(null)}
        onConfirm={() => confirmReject && setStatus(confirmReject, "Rejected")}
        title="Reject this item?"
        message="This will mark the item as Rejected. The submitting attorney will be notified to revise and resubmit."
        confirmLabel="Reject"
        variant="danger"
      />

      {/* Bulk Approve confirm */}
      <ConfirmDialog
        isOpen={confirmBulkApprove}
        onClose={() => setConfirmBulkApprove(false)}
        onConfirm={handleBulkApprove}
        title={`Approve ${selectedCount} item${selectedCount !== 1 ? "s" : ""}?`}
        message="All selected pending items will be marked as Approved. Submitting attorneys will be notified."
        confirmLabel="Approve All"
        variant="success"
      />

      {/* Bulk Reject confirm */}
      <ConfirmDialog
        isOpen={confirmBulkReject}
        onClose={() => setConfirmBulkReject(false)}
        onConfirm={handleBulkReject}
        title={`Reject ${selectedCount} item${selectedCount !== 1 ? "s" : ""}?`}
        message="All selected pending items will be marked as Rejected. Submitting attorneys will be notified to revise and resubmit."
        confirmLabel="Reject All"
        variant="danger"
      />

      {/* View Document modal */}
      {viewItem && (
        <Modal
          isOpen={!!viewDoc}
          onClose={() => setViewDoc(null)}
          title="Document Preview"
        >
          <div className="space-y-4">
            <div
              className="rounded-xl p-5 flex items-center gap-4"
              style={{ background: "#F5F7FA", border: "1px solid #E2E8F0" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF4FF" }}>
                <Icon name={TYPE_ICONS[viewItem.type] ?? "file-text"} className="w-6 h-6 text-[#0B2349]" />
              </div>
              <div>
                <p className="font-semibold text-[#1e293b] text-[14px]">{viewItem.title}</p>
                <p className="text-[12px] text-[#94A3B8] font-mono mt-0.5">{viewItem.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              {[
                ["Type", viewItem.type],
                ["Case", viewItem.case],
                ["Client", viewItem.client],
                ["Submitted By", viewItem.submittedBy],
                ["Date", viewItem.date],
                ["Status", viewItem.status],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[#94A3B8] mb-0.5 text-[10px] uppercase tracking-wide font-semibold">{k}</p>
                  <p className="font-medium text-[#1e293b]">{v}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-4 text-center text-[13px] text-[#94A3B8]"
              style={{ background: "#FAFBFC", border: "2px dashed #E2E8F0" }}
            >
              <Icon name="file-text" className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Document viewer not available in demo mode.
              <br />
              <span className="text-[11px]">In production, the PDF would render here.</span>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors"
                onClick={() => setViewDoc(null)}
              >
                <Icon name="download" className="w-4 h-4" />
                Download
              </button>
              <button
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F5F7FA] transition-colors border border-[#E2E8F0]"
                onClick={() => setViewDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
