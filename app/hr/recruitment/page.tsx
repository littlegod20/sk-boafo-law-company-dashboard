"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { BulkToolbar, TBtn, Checkbox, Pagination } from "@/components/TableControls";

const PAGE_SIZE = 6;

const INITIAL_JOBS = [
  { id: "REC-2026-009", title: "Senior Associate — Litigation",    dept: "Litigation",        status: "Interviewing", applications: 14, posted: "01 Sep 2026", closing: "30 Sep 2026", hiringManager: "S.K. Boafo",    priority: "High" },
  { id: "REC-2026-008", title: "Corporate Law Associate",          dept: "Corporate Law",     status: "Open",         applications: 9,  posted: "10 Sep 2026", closing: "10 Oct 2026", hiringManager: "Kwabena Asare", priority: "High" },
  { id: "REC-2026-007", title: "Paralegal — Conveyancing",         dept: "Conveyancing",      status: "Open",         applications: 7,  posted: "12 Sep 2026", closing: "12 Oct 2026", hiringManager: "Kojo Frimpong", priority: "Medium" },
  { id: "REC-2026-006", title: "HR Administrator",                 dept: "Human Resources",   status: "Offer Extended", applications: 3, posted: "20 Aug 2026", closing: "20 Sep 2026", hiringManager: "Yaa Bonsu",    priority: "High" },
  { id: "REC-2026-005", title: "Legal Secretary",                  dept: "Administration",    status: "Interviewing", applications: 11, posted: "15 Aug 2026", closing: "15 Sep 2026", hiringManager: "Nana Acheampong", priority: "Medium" },
  { id: "REC-2026-004", title: "Associate — Family Law",           dept: "Family Law",        status: "Filled",       applications: 18, posted: "01 Jul 2026", closing: "31 Jul 2026", hiringManager: "S.K. Boafo",    priority: "High" },
  { id: "REC-2026-003", title: "IT Support Specialist",            dept: "IT",                status: "Closed",       applications: 22, posted: "15 Jun 2026", closing: "15 Jul 2026", hiringManager: "Nana Acheampong", priority: "Low" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Open:            { bg: "#ECFDF5", text: "#059669" },
  Interviewing:    { bg: "#EFF4FF", text: "#1d4ed8" },
  "Offer Extended":{ bg: "#FFFBEB", text: "#D97706" },
  Filled:          { bg: "#F1F5F9", text: "#64748B" },
  Closed:          { bg: "#F8FAFC", text: "#94A3B8" },
};

const PRIORITY_STYLE: Record<string, string> = {
  High:   "#DC2626",
  Medium: "#D97706",
  Low:    "#94A3B8",
};

const FILTERS = ["All", "Open", "Interviewing", "Offer Extended", "Filled"];

type Job = typeof INITIAL_JOBS[number];

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showNew, setShowNew] = useState(false);
  const [created, setCreated] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [form, setForm] = useState({ title: "", dept: "", hiringManager: "", closing: "", priority: "Medium" });

  const filtered = jobs.filter((j) => filter === "All" || j.status === filter);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds = paginated.map((j) => j.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
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

  function doBulkClose() {
    setJobs((prev) => prev.map((j) => selected.has(j.id) ? { ...j, status: "Closed" } : j));
    setSelected(new Set());
    setConfirmClose(false);
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
          onClick={() => { setShowNew(true); setCreated(false); }}
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
          { label: "Open Positions",    value: String(openCount),      icon: "briefcase" as const, color: "#DC2626", bg: "#FFF5F5" },
          { label: "Total Applications",value: String(totalApps),      icon: "users" as const,     color: "#0B2349", bg: "#EFF4FF" },
          { label: "Offers Extended",   value: String(offersExtended), icon: "mail" as const,      color: "#D97706", bg: "#FFFBEB" },
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

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
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
                const isSelected = selected.has(j.id);
                return (
                  <tr key={j.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors" style={isSelected ? { background: "#EFF4FF" } : {}}>
                    <td className="pl-5 pr-3 py-3.5 w-10">
                      <Checkbox checked={isSelected} onChange={() => toggleRow(j.id)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1e293b]">{j.title}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">{j.id}</p>
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
                    <td className="px-5 py-3.5 text-[#64748B]">{j.hiringManager}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{j.closing}</td>
                    <td className="px-5 py-3.5">
                      <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
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
                  {["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Intellectual Prop", "HR / Admin", "IT"].map((d) => <option key={d}>{d}</option>)}
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
            <ModalFooter onClose={() => setShowNew(false)} confirmLabel="Post Job" onConfirm={() => { if (form.title && form.dept) setCreated(true); }} />
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
