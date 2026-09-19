"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ConfirmDialog } from "@/components/Modal";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending:  { bg: "#FFFBEB", text: "#D97706" },
  Approved: { bg: "#ECFDF5", text: "#059669" },
  Declined: { bg: "#FFF5F5", text: "#DC2626" },
};

const FILTERS = ["Pending", "All", "Approved", "Declined"] as const;

export default function ApprovalsPage() {
  const requests  = useQuery(api.leave.listAll) ?? [];
  const approveFn = useMutation(api.leave.approve);
  const declineFn = useMutation(api.leave.decline);

  const [statusFilter, setStatusFilter] = useState<(typeof FILTERS)[number]>("Pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [singleAction, setSingleAction] = useState<{
    id: Id<"leaveRequests">;
    action: "approve" | "decline";
  } | null>(null);

  const filtered =
    statusFilter === "All"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const pending = requests.filter((r) => r.status === "Pending");
  const approved = requests.filter((r) => r.status === "Approved");
  const declined = requests.filter((r) => r.status === "Declined");

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = paged.map((r) => r._id as string);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function resetPage() {
    setPage(1);
    setSelected(new Set());
  }

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectedIds(): Id<"leaveRequests">[] {
    return requests.filter((r) => selected.has(r._id as string)).map((r) => r._id);
  }

  async function handleBulkApprove() {
    await approveFn({ ids: selectedIds() });
    setSelected(new Set());
    setConfirmApprove(false);
  }

  async function handleBulkDecline() {
    await declineFn({ ids: selectedIds() });
    setSelected(new Set());
    setConfirmDecline(false);
  }

  async function handleSingle() {
    if (!singleAction) return;
    if (singleAction.action === "approve") {
      await approveFn({ ids: [singleAction.id] });
    } else {
      await declineFn({ ids: [singleAction.id] });
    }
    setSingleAction(null);
  }

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Leave Approvals</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Review and decide on staff leave requests
          </p>
        </div>
        {pending.length > 0 && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{ background: "#FFFBEB", color: "#D97706" }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: pending.length, color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved", value: approved.length, color: "#059669", bg: "#ECFDF5" },
          { label: "Declined", value: declined.length, color: "#DC2626", bg: "#FFF5F5" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3"
          >
            <p className="text-[11px] text-[#94A3B8] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-0.5" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setStatusFilter(f);
              resetPage();
            }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={
              statusFilter === f
                ? { background: "#0B2349", color: "white" }
                : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }
            }
          >
            {f}
          </button>
        ))}
      </div>

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

      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allPageSelected} onChange={toggleAll} />
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Employee
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Type
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Dates
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Days
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Applied
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Status
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#94A3B8]">
                  {statusFilter === "Pending"
                    ? "No leave requests awaiting approval."
                    : "No leave requests in this view."}
                </td>
              </tr>
            ) : (
              paged.map((r) => {
                const style = STATUS_STYLE[r.status] ?? STATUS_STYLE.Pending;
                const isPending = r.status === "Pending";
                return (
                  <tr key={r._id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]/60">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(r._id as string)}
                        onChange={() => {
                          if (isPending) toggleRow(r._id as string);
                        }}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[13px] font-medium text-[#0B2349]">{r.employeeName}</p>
                      <p className="text-[11px] text-[#94A3B8] capitalize">
                        {(r.role ?? "").replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#334155]">{r.type}</td>
                    <td className="px-3 py-3 text-[12px] text-[#334155]">
                      {r.from} – {r.to}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-[#334155]">{r.days}</td>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">{r.appliedDate}</td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: style.bg, color: style.text }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {isPending ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setSingleAction({ id: r._id, action: "approve" })
                            }
                            className="rounded-md px-2 py-1 text-[11px] font-semibold"
                            style={{ background: "#ECFDF5", color: "#059669" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setSingleAction({ id: r._id, action: "decline" })
                            }
                            className="rounded-md px-2 py-1 text-[11px] font-semibold"
                            style={{ background: "#FFF5F5", color: "#DC2626" }}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">
                          {r.approvedByName ?? "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-[#E2E8F0]">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmApprove}
        title="Approve leave requests?"
        message={`Approve ${selected.size} selected leave request${selected.size !== 1 ? "s" : ""}?`}
        confirmLabel="Approve"
        variant="success"
        onConfirm={handleBulkApprove}
        onClose={() => setConfirmApprove(false)}
      />
      <ConfirmDialog
        isOpen={confirmDecline}
        title="Decline leave requests?"
        message={`Decline ${selected.size} selected leave request${selected.size !== 1 ? "s" : ""}?`}
        confirmLabel="Decline"
        variant="danger"
        onConfirm={handleBulkDecline}
        onClose={() => setConfirmDecline(false)}
      />
      <ConfirmDialog
        isOpen={!!singleAction}
        title={singleAction?.action === "approve" ? "Approve leave?" : "Decline leave?"}
        message={
          singleAction?.action === "approve"
            ? "This leave request will be marked as approved."
            : "This leave request will be declined."
        }
        confirmLabel={singleAction?.action === "approve" ? "Approve" : "Decline"}
        variant={singleAction?.action === "decline" ? "danger" : "success"}
        onConfirm={handleSingle}
        onClose={() => setSingleAction(null)}
      />
    </div>
  );
}
