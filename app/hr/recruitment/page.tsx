"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { BulkToolbar, TBtn, Checkbox, Pagination } from "@/components/TableControls";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 6;

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Open:              { bg: "#ECFDF5", text: "#059669" },
  Interviewing:      { bg: "#EFF4FF", text: "#1d4ed8" },
  "Offer Extended":  { bg: "#FFFBEB", text: "#D97706" },
  Filled:            { bg: "#F1F5F9", text: "#64748B" },
  Closed:            { bg: "#F8FAFC", text: "#94A3B8" },
};

const APPLICANT_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Pending:     { bg: "#F1F5F9", text: "#64748B" },
  Shortlisted: { bg: "#EFF4FF", text: "#1d4ed8" },
  Interview:   { bg: "#FFFBEB", text: "#D97706" },
  Offered:     { bg: "#ECFDF5", text: "#059669" },
  Rejected:    { bg: "#FFF5F5", text: "#DC2626" },
};

const PRIORITY_STYLE: Record<string, string> = {
  High:   "#DC2626",
  Medium: "#D97706",
  Low:    "#94A3B8",
};

const STATUS_FILTERS = ["All", "Open", "Interviewing", "Offer Extended", "Filled"];
const DEPARTMENTS    = ["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Intellectual Prop", "HR / Admin", "IT"];
const PRIORITIES     = ["High", "Medium", "Low"];

type Job = NonNullable<ReturnType<typeof useQuery<typeof api.jobPostings.list>>>[number];

export default function RecruitmentPage() {
  const jobs        = useQuery(api.jobPostings.list) ?? [];
  const createJob   = useMutation(api.jobPostings.create);
  const closeJobs   = useMutation(api.jobPostings.closePostings);
  const updateApplicantStatus = useMutation(api.jobApplicants.updateStatus);

  // ── Status filter pills ────────────────────────────────────────────────────
  const [statusFilter,   setStatusFilter]   = useState("All");

  // ── Extra filters ──────────────────────────────────────────────────────────
  const [titleSearch,    setTitleSearch]    = useState("");
  const [deptFilter,     setDeptFilter]     = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // ── Table / modal state ────────────────────────────────────────────────────
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [showNew,      setShowNew]      = useState(false);
  const [created,      setCreated]      = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [detailJob,    setDetailJob]    = useState<Job | null>(null);
  const [posting,      setPosting]      = useState(false);
  const [form,         setForm]         = useState({ title: "", dept: "", hiringManager: "", closing: "", priority: "Medium" });

  const hasExtraFilters = titleSearch || deptFilter || priorityFilter;

  function resetFilters() {
    setStatusFilter("All");
    setTitleSearch("");
    setDeptFilter("");
    setPriorityFilter("");
    setPage(1);
    setSelected(new Set());
  }

  function resetPagination() { setPage(1); setSelected(new Set()); }

  // Load applicants for the selected job
  const applicants = useQuery(
    api.jobApplicants.listByJob,
    detailJob ? { jobId: detailJob._id } : "skip"
  ) ?? [];

  // ── Filtering logic ────────────────────────────────────────────────────────
  const filtered = jobs.filter((j) => {
    if (statusFilter !== "All" && j.status !== statusFilter) return false;
    if (titleSearch && !j.title.toLowerCase().includes(titleSearch.toLowerCase()) && !j.dept.toLowerCase().includes(titleSearch.toLowerCase())) return false;
    if (deptFilter && j.dept !== deptFilter) return false;
    if (priorityFilter && j.priority !== priorityFilter) return false;
    return true;
  });

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds    = paginated.map((j) => j._id);
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

  async function doBulkClose() {
    await closeJobs({ ids: Array.from(selected) as Id<"jobPostings">[] });
    setSelected(new Set());
    setConfirmClose(false);
  }

  async function handlePostJob() {
    if (!form.title || !form.dept) return;
    setPosting(true);
    try {
      await createJob({
        title:            form.title,
        dept:             form.dept,
        hiringManagerName: form.hiringManager || "TBD",
        closingDate:      form.closing || "TBD",
        priority:         form.priority as "High" | "Medium" | "Low",
      });
      setCreated(true);
    } finally {
      setPosting(false);
    }
  }

  const openCount      = jobs.filter((j) => j.status === "Open" || j.status === "Interviewing").length;
  const totalApps      = jobs.reduce((a, j) => a + j.applications, 0);
  const offersExtended = jobs.filter((j) => j.status === "Offer Extended").length;
  const filledThisYear = jobs.filter((j) => j.status === "Filled").length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Recruitment</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Active job openings and hiring pipeline</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setCreated(false); setForm({ title: "", dept: "", hiringManager: "", closing: "", priority: "Medium" }); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Post Job
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Positions",    value: String(openCount),      icon: "briefcase" as const,    color: "#DC2626", bg: "#FFF5F5" },
          { label: "Total Applications",value: String(totalApps),      icon: "users" as const,        color: "#0B2349", bg: "#EFF4FF" },
          { label: "Offers Extended",   value: String(offersExtended), icon: "mail" as const,         color: "#D97706", bg: "#FFFBEB" },
          { label: "Filled This Year",  value: String(filledThisYear), icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
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

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => { setStatusFilter(f); resetPagination(); }}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={statusFilter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Advanced filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Title / dept search */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-white border border-[#E2E8F0] w-56">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by title or dept…"
            className="flex-1 bg-transparent text-[12px] text-[#1e293b] placeholder-[#94A3B8] outline-none min-w-0"
            value={titleSearch}
            onChange={(e) => { setTitleSearch(e.target.value); resetPagination(); }}
          />
          {titleSearch && (
            <button onClick={() => { setTitleSearch(""); resetPagination(); }}>
              <Icon name="x" className="w-3 h-3 text-[#94A3B8]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Department */}
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); resetPagination(); }}
          className={"rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349] w-32"}
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); resetPagination(); }}
          className={"rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349] w-32"}
        >
          <option value="">Any Priority</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>

        {/* Clear all */}
        {hasExtraFilters && (
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
            style={{ color: "#64748B" }}>
            <Icon name="x" className="w-3 h-3" strokeWidth={2.5} /> Clear filters
          </button>
        )}

        {/* Result count */}
        {(hasExtraFilters || statusFilter !== "All") && (
          <span className="text-[11px] text-[#94A3B8] ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn variant="danger" onClick={() => setConfirmClose(true)}>
            <Icon name="x" className="w-3.5 h-3.5" /> Close Postings
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
                {["Job Title", "Department", "Status", "Applications", "Priority", "Hiring Manager", "Closing Date", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((j) => {
                const ss = STATUS_STYLE[j.status] ?? STATUS_STYLE.Open;
                const isSelected = selected.has(j._id);
                return (
                  <tr key={j._id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors" style={isSelected ? { background: "#EFF4FF" } : {}}>
                    <td className="pl-5 pr-3 py-3.5 w-10">
                      <Checkbox checked={isSelected} onChange={() => {
                        setSelected((prev) => { const next = new Set(prev); if (next.has(j._id)) next.delete(j._id); else next.add(j._id); return next; });
                      }} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1e293b]">{j.title}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">{j.jobRef}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{j.dept}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{j.status}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#0B2349]">{j.applications}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: PRIORITY_STYLE[j.priority] }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_STYLE[j.priority] }} />
                        {j.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{j.hiringManagerName}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{j.closingDate}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailJob(j)}
                        className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors"
                      >
                        <Icon name="eye" className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">No job postings match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>

      {/* Job Detail Modal */}
      <Modal isOpen={!!detailJob} onClose={() => setDetailJob(null)} title={detailJob?.title ?? ""} maxWidth="580px">
        {detailJob && (
          <div className="space-y-5">
            {/* Job meta */}
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                { label: "Department",      value: detailJob.dept },
                { label: "Status",          value: detailJob.status },
                { label: "Priority",        value: detailJob.priority },
                { label: "Hiring Manager",  value: detailJob.hiringManagerName },
                { label: "Posted",          value: detailJob.postedDate },
                { label: "Closing Date",    value: detailJob.closingDate },
                { label: "Applications",    value: String(detailJob.applications) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg px-3 py-2 bg-[#F8FAFC]">
                  <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-[#1e293b] font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {detailJob.description && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1.5">Description</p>
                <p className="text-[13px] text-[#64748B] leading-relaxed">{detailJob.description}</p>
              </div>
            )}

            {/* Applicants */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">
                Applicants ({applicants.length})
              </p>
              {applicants.length === 0 ? (
                <p className="text-[12px] text-[#94A3B8] py-4 text-center">No applicants yet.</p>
              ) : (
                <div className="space-y-2">
                  {applicants.map((a) => {
                    const ast = APPLICANT_STATUS_STYLE[a.status] ?? APPLICANT_STATUS_STYLE.Pending;
                    return (
                      <div key={a._id} className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-[#F8FAFC]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-medium text-[#1e293b]">{a.name}</p>
                            {a.cvUrl ? (
                              <a
                                href={a.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View CV"
                                className="rounded p-0.5 hover:bg-[#E2E8F0] transition-colors"
                                style={{ color: "#0B2349" }}
                              >
                                <Icon name="file-text" className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span title="No CV attached" style={{ color: "#CBD5E1" }}>
                                <Icon name="file-text" className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          {a.email && <p className="text-[11px] text-[#94A3B8]">{a.email}</p>}
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">Applied {a.appliedDate}</p>
                        </div>
                        <select
                          value={a.status}
                          onChange={(e) => updateApplicantStatus({ id: a._id, status: e.target.value as any })}
                          className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-0 cursor-pointer focus:outline-none"
                          style={{ background: ast.bg, color: ast.text }}
                        >
                          {["Pending", "Shortlisted", "Interview", "Offered", "Rejected"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Post Job modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Post New Job">
        {created ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">Job posted</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The position is now live and accepting applications.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowNew(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Job Title" required>
              <input className={inputCls} placeholder="e.g. Senior Associate — Litigation" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Department" required>
                <select className={inputCls} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
                  <option value="">Select...</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Priority">
                <select className={inputCls} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
                </select>
              </FormField>
              <FormField label="Hiring Manager">
                <select className={inputCls} value={form.hiringManager} onChange={(e) => setForm((f) => ({ ...f, hiringManager: e.target.value }))}>
                  <option value="">Select...</option>
                  {["S.K. Boafo", "Kwabena Asare", "Kojo Frimpong", "Yaa Bonsu", "Nana Acheampong"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Closing Date" required>
                <input type="date" className={inputCls} value={form.closing} onChange={(e) => setForm((f) => ({ ...f, closing: e.target.value }))} />
              </FormField>
            </div>
            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel={posting ? "Posting…" : "Post Job"}
              onConfirm={handlePostJob}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={doBulkClose}
        title="Close postings?"
        message={`Close ${selected.size} job posting${selected.size !== 1 ? "s" : ""}? They will no longer accept applications.`}
        confirmLabel="Close Postings"
        variant="danger"
      />
    </div>
  );
}
