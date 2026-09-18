"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Icon } from "@/components/Icons";

// ── colour helpers ─────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" }, { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" }, { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" }, { bg: "#F0FDF4", color: "#15803d" },
];

function scoreColor(s: number) {
  if (s >= 90) return "#059669";
  if (s >= 75) return "#1d4ed8";
  if (s >= 60) return "#D97706";
  return "#DC2626";
}

function scoreLabel(s: number) {
  if (s >= 90) return { label: "Excellent",    bg: "#ECFDF5", text: "#059669" };
  if (s >= 75) return { label: "Good",         bg: "#EFF4FF", text: "#1d4ed8" };
  if (s >= 60) return { label: "Satisfactory", bg: "#FFFBEB", text: "#D97706" };
  return          { label: "Needs Work",     bg: "#FFF5F5", text: "#DC2626" };
}

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner",
  partner:          "Partner",
  associate:        "Associate",
  paralegal:        "Paralegal",
  admin:            "Admin",
  hr_officer:       "HR Officer",
};

// ── Default KPI template ───────────────────────────────────────────────────────

const DEFAULT_KPIS = [
  { name: "Client Satisfaction", target: 90, actual: 0, unit: "%" },
  { name: "On-time Filings",     target: 95, actual: 0, unit: "%" },
];

// ── Employee drawer (review form) ──────────────────────────────────────────────

type Employee = {
  _id: Id<"users">;
  name?: string;
  email?: string;
  role?: string;
  dept?: string;
};

type ReviewDoc = {
  _id: Id<"performanceReviews">;
  billableHours?: number;
  billableHoursTarget?: number;
  casesHandled?: number;
  casesClosed?: number;
  overallScore?: number;
  kpis?: { name: string; target: number; actual: number; unit?: string }[];
  notes?: string;
  status: "Draft" | "Submitted";
  reviewerName?: string;
};

function EmployeeDrawer({
  employee,
  review,
  periodId,
  onClose,
}: {
  employee: Employee;
  review: ReviewDoc | null;
  periodId: Id<"performancePeriods">;
  onClose: () => void;
}) {
  const upsert = useMutation(api.performance.upsertReview);

  const [billableHours, setBillableHours]             = useState<string>(String(review?.billableHours       ?? ""));
  const [billableHoursTarget, setBillableHoursTarget] = useState<string>(String(review?.billableHoursTarget ?? "160"));
  const [casesHandled, setCasesHandled]               = useState<string>(String(review?.casesHandled        ?? ""));
  const [casesClosed, setCasesClosed]                 = useState<string>(String(review?.casesClosed         ?? ""));
  const [overallScore, setOverallScore]               = useState<string>(String(review?.overallScore        ?? ""));
  const [notes, setNotes]                             = useState<string>(review?.notes                      ?? "");
  const [kpis, setKpis] = useState<{ name: string; target: string; actual: string; unit: string }[]>(
    review?.kpis?.map((k) => ({
      name: k.name, target: String(k.target), actual: String(k.actual), unit: k.unit ?? "",
    })) ?? DEFAULT_KPIS.map((k) => ({ name: k.name, target: String(k.target), actual: String(k.actual), unit: k.unit }))
  );
  const [saving, setSaving] = useState(false);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleSave(status: "Draft" | "Submitted") {
    setSaving(true);
    try {
      await upsert({
        periodId,
        employeeId:          employee._id,
        billableHours:       billableHours       ? Number(billableHours)       : undefined,
        billableHoursTarget: billableHoursTarget ? Number(billableHoursTarget) : undefined,
        casesHandled:        casesHandled        ? Number(casesHandled)        : undefined,
        casesClosed:         casesClosed         ? Number(casesClosed)         : undefined,
        overallScore:        overallScore        ? Math.min(100, Math.max(0, Number(overallScore))) : undefined,
        kpis: kpis
          .filter((k) => k.name.trim())
          .map((k) => ({
            name:   k.name.trim(),
            target: Number(k.target) || 0,
            actual: Number(k.actual) || 0,
            unit:   k.unit || undefined,
          })),
        notes:  notes || undefined,
        status,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const displayName = employee.name ?? employee.email ?? "Unknown";
  const initials    = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const fieldCls = "w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349]";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(11,35,73,0.35)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white overflow-hidden"
        style={{ width: 440, boxShadow: "-8px 0 40px rgba(11,35,73,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F5F9] flex-shrink-0" style={{ background: "#0B2349" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold bg-white/20 text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-white/60">{ROLE_LABELS[employee.role ?? ""] ?? employee.role} · {employee.dept ?? "—"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0">
            <Icon name="x" className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Core metrics */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">Core Metrics</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">Billable Hours (actual)</label>
                <input type="number" min={0} className={fieldCls} value={billableHours} onChange={(e) => setBillableHours(e.target.value)} placeholder="e.g. 148" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">Billable Hours (target)</label>
                <input type="number" min={0} className={fieldCls} value={billableHoursTarget} onChange={(e) => setBillableHoursTarget(e.target.value)} placeholder="e.g. 160" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">Cases Handled</label>
                <input type="number" min={0} className={fieldCls} value={casesHandled} onChange={(e) => setCasesHandled(e.target.value)} placeholder="e.g. 12" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">Cases Closed</label>
                <input type="number" min={0} className={fieldCls} value={casesClosed} onChange={(e) => setCasesClosed(e.target.value)} placeholder="e.g. 9" />
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">Overall Score</p>
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} max={100} className={fieldCls + " flex-1"}
                value={overallScore} onChange={(e) => setOverallScore(e.target.value)}
                placeholder="0 – 100"
              />
              {overallScore && !isNaN(Number(overallScore)) && (
                <div>
                  {(() => {
                    const sl = scoreLabel(Number(overallScore));
                    return (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap" style={{ background: sl.bg, color: sl.text }}>
                        {sl.label}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
            {overallScore && !isNaN(Number(overallScore)) && (
              <div className="mt-2 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Number(overallScore))}%`, background: scoreColor(Number(overallScore)) }} />
              </div>
            )}
          </div>

          {/* KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">KPI Targets</p>
              <button
                onClick={() => setKpis((prev) => [...prev, { name: "", target: "100", actual: "0", unit: "%" }])}
                className="text-[11px] font-semibold text-[#0B2349] hover:underline"
              >
                + Add KPI
              </button>
            </div>
            <div className="space-y-3">
              {kpis.map((k, i) => (
                <div key={i} className="rounded-lg border border-[#E2E8F0] p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className={fieldCls + " flex-1"}
                      value={k.name}
                      onChange={(e) => setKpis((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      placeholder="KPI name"
                    />
                    <button
                      onClick={() => setKpis((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1.5 rounded hover:bg-[#FFF5F5] text-[#94A3B8] hover:text-[#DC2626] transition-colors flex-shrink-0"
                    >
                      <Icon name="x" className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-0.5">Target</label>
                      <input type="number" className={fieldCls} value={k.target} onChange={(e) => setKpis((prev) => prev.map((x, j) => j === i ? { ...x, target: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-0.5">Actual</label>
                      <input type="number" className={fieldCls} value={k.actual} onChange={(e) => setKpis((prev) => prev.map((x, j) => j === i ? { ...x, actual: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-0.5">Unit</label>
                      <input type="text" className={fieldCls} value={k.unit} onChange={(e) => setKpis((prev) => prev.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))} placeholder="%" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  {k.target && k.actual !== "" && (
                    <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((Number(k.actual) / (Number(k.target) || 1)) * 100))}%`,
                          background: Number(k.actual) >= Number(k.target) ? "#059669" : "#0B2349",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-3">Manager Notes</p>
            <textarea
              className={fieldCls}
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feedback, observations, development areas…"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-[#F1F5F9] bg-[#FAFBFC] flex-shrink-0 flex gap-3">
          <button
            onClick={() => handleSave("Draft")}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold border border-[#E2E8F0] text-[#0B2349] hover:bg-white transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("Submitted")}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#0B2349" }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </>
  );
}

// ── New Period modal ───────────────────────────────────────────────────────────

function NewPeriodModal({ onClose }: { onClose: () => void }) {
  const createPeriod = useMutation(api.performance.createPeriod);
  const [name, setName]           = useState("");
  const [type, setType]           = useState<"monthly" | "quarterly" | "annually">("quarterly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [saving, setSaving]       = useState(false);

  async function handleCreate() {
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);
    try {
      await createPeriod({ name: name.trim(), type, startDate, endDate });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const fieldCls = "w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349]";

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(11,35,73,0.4)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl w-full max-w-md pointer-events-auto overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(11,35,73,0.22)" }}
        >
          <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between" style={{ background: "#0B2349" }}>
            <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: '"Baskerville", Georgia, serif' }}>New Performance Period</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
              <Icon name="x" className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#64748B] mb-1">Period Name</label>
              <input type="text" className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q4 2026" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#64748B] mb-1">Type</label>
              <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annual</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">Start Date</label>
                <input type="date" className={fieldCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#64748B] mb-1">End Date</label>
                <input type="date" className={fieldCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Creating a new period will close any currently active period.</p>
          </div>
          <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F5F7FA] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim() || !startDate || !endDate}
              className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "#0B2349" }}
            >
              {saving ? "Creating…" : "Create Period"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function TeamPerformancePage() {
  const me        = useQuery(api.users.getCurrentUser);
  const periods   = useQuery(api.performance.listPeriods) ?? [];
  const allUsers  = useQuery(api.users.list) ?? [];

  const [selectedPeriodId, setSelectedPeriodId] = useState<Id<"performancePeriods"> | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showNewPeriod, setShowNewPeriod]        = useState(false);

  // Auto-select the active period or the first period when periods load
  useEffect(() => {
    if (!periods.length) return;
    if (selectedPeriodId && periods.some((p) => p._id === selectedPeriodId)) return;
    const active = periods.find((p) => p.status === "Active");
    setSelectedPeriodId(active?._id ?? periods[0]._id);
  }, [periods, selectedPeriodId]);

  const periodReviews = useQuery(
    api.performance.teamReviews,
    selectedPeriodId ? { periodId: selectedPeriodId } : "skip"
  ) ?? [];

  const canManage = me?.role === "managing_partner" || me?.role === "hr_officer" || me?.role === "partner";

  // Build employee roster (non-anonymous, has a role)
  const employees = allUsers.filter((u) => !u.isAnonymous && u.role);

  // Map reviews by employeeId for quick lookup
  const reviewMap = new Map(periodReviews.map((r) => [r.employeeId, r]));

  // Summary stats
  const reviewedEmployees = employees.filter((e) => reviewMap.has(e._id));
  const avgScore = reviewedEmployees.length
    ? Math.round(
        reviewedEmployees
          .map((e) => reviewMap.get(e._id)?.overallScore ?? 0)
          .filter(Boolean)
          .reduce((a, b) => a + b, 0) /
          (reviewedEmployees.filter((e) => reviewMap.get(e._id)?.overallScore !== undefined).length || 1)
      )
    : 0;
  const totalCases  = periodReviews.reduce((a, r) => a + (r.casesClosed ?? 0), 0);
  const totalHours  = periodReviews.reduce((a, r) => a + (r.billableHours ?? 0), 0);
  const reviewedCount = periodReviews.length;

  // Find the review for the selected employee
  const selectedReview = selectedEmployee
    ? (reviewMap.get(selectedEmployee._id) as ReviewDoc | undefined) ?? null
    : null;

  const selectedPeriod = periods.find((p) => p._id === selectedPeriodId);

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Team Performance</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            {selectedPeriod
              ? `${selectedPeriod.name} · ${selectedPeriod.startDate} – ${selectedPeriod.endDate}`
              : "Select a period"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          {periods.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-[#64748B] whitespace-nowrap">Period:</label>
              <select
                className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#1e293b] bg-white outline-none focus:ring-2 focus:ring-[#0B2349]/20 focus:border-[#0B2349] w-44"
                value={selectedPeriodId ?? ""}
                onChange={(e) => setSelectedPeriodId(e.target.value as Id<"performancePeriods">)}
              >
                {periods.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.status === "Active" ? "●" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          {canManage && (
            <button
              onClick={() => setShowNewPeriod(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-white transition-colors"
              style={{ background: "#0B2349" }}
            >
              <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
              New Period
            </button>
          )}
        </div>
      </div>

      {/* No periods state */}
      {periods.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F1F5F9" }}>
            <Icon name="calendar" className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-[14px] font-semibold text-[#64748B]">No review periods yet</p>
          {canManage && (
            <button
              onClick={() => setShowNewPeriod(true)}
              className="mt-1 rounded-lg px-4 py-2 text-[12px] font-semibold text-white"
              style={{ background: "#0B2349" }}
            >
              Create First Period
            </button>
          )}
        </div>
      )}

      {periods.length > 0 && selectedPeriodId && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Score",    value: avgScore || "—",        unit: avgScore ? "/100" : "", color: "#0B2349", bg: "#EFF4FF", icon: "star" },
              { label: "Reviews Done", value: `${reviewedCount}`,    unit: ` / ${employees.length}`, color: "#059669", bg: "#ECFDF5", icon: "check-circle" },
              { label: "Cases Closed", value: `${totalCases}`,       unit: " total",  color: "#7C3AED", bg: "#F5F3FF", icon: "briefcase" },
              { label: "Billable Hrs", value: `${totalHours}`,       unit: "h",       color: "#D97706", bg: "#FFFBEB", icon: "clock" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon name={s.icon as any} className="w-4 h-4" style={{ color: s.color } as React.CSSProperties} />
                  </div>
                </div>
                <p className="text-[26px] font-bold leading-none" style={{ color: s.color }}>
                  {s.value}<span className="text-[13px] font-medium text-[#94A3B8]">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Employee table */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 border-b border-[#F1F5F9]">
              <h3 className="text-[14px] font-bold text-[#0B2349]">Individual Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: "#FAFBFC" }}>
                    {["Employee", "Dept", "Cases Handled", "Cases Closed", "Billable Hrs", "Overall Score", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => {
                    const av      = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                    const r       = reviewMap.get(emp._id);
                    const name    = emp.name ?? emp.email ?? "Unknown";
                    const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                    const sl      = r?.overallScore !== undefined && r?.overallScore !== null
                      ? scoreLabel(r.overallScore) : null;

                    return (
                      <tr
                        key={emp._id}
                        className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-[#1e293b] leading-tight">{name}</p>
                              <p className="text-[10px] text-[#94A3B8]">{ROLE_LABELS[emp.role ?? ""] ?? emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{emp.dept ?? "—"}</td>
                        <td className="px-5 py-3.5 text-[#64748B]">{r?.casesHandled ?? "—"}</td>
                        <td className="px-5 py-3.5 text-[#64748B]">{r?.casesClosed ?? "—"}</td>
                        <td className="px-5 py-3.5 text-[#64748B]">
                          {r?.billableHours !== undefined && r.billableHours !== null
                            ? `${r.billableHours}${r.billableHoursTarget ? ` / ${r.billableHoursTarget}h` : "h"}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {r?.overallScore !== undefined && r.overallScore !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden flex-shrink-0">
                                <div className="h-full rounded-full" style={{ width: `${r.overallScore}%`, background: scoreColor(r.overallScore) }} />
                              </div>
                              <span className="text-[12px] font-bold" style={{ color: scoreColor(r.overallScore) }}>{r.overallScore}</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          {!r ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                              Pending
                            </span>
                          ) : sl ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: sl.bg, color: sl.text }}>
                              {sl.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "#FFFBEB", color: "#D97706" }}>
                              {r.status}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}
                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors"
                          >
                            <Icon name="edit" className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Employee drawer */}
      {selectedEmployee && selectedPeriodId && (
        <EmployeeDrawer
          employee={selectedEmployee}
          review={selectedReview}
          periodId={selectedPeriodId}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* New period modal */}
      {showNewPeriod && (
        <NewPeriodModal onClose={() => setShowNewPeriod(false)} />
      )}
    </div>
  );
}
