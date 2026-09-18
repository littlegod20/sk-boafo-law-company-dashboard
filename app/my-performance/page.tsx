"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icon } from "@/components/Icons";

// ── helpers ────────────────────────────────────────────────────────────────────

function scoreLabel(s: number): { label: string; bg: string; text: string } {
  if (s >= 90) return { label: "Excellent",    bg: "#ECFDF5", text: "#059669" };
  if (s >= 75) return { label: "Good",         bg: "#EFF4FF", text: "#1d4ed8" };
  if (s >= 60) return { label: "Satisfactory", bg: "#FFFBEB", text: "#D97706" };
  return          { label: "Needs Work",     bg: "#FFF5F5", text: "#DC2626" };
}

function pct(actual: number, target: number) {
  if (!target) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
}

// ── sub-component: KPI card ────────────────────────────────────────────────────

function KpiCard({
  label, value, target, unit, color, bg, icon,
}: {
  label: string; value: number | null; target: number | null;
  unit: string; color: string; bg: string; icon: string;
}) {
  const hasData = value !== null && value !== undefined;
  const p = hasData && target ? pct(value!, target) : 0;
  return (
    <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon name={icon as any} className="w-4 h-4" style={{ color } as React.CSSProperties} />
        </div>
      </div>
      {hasData ? (
        <>
          <p className="text-[28px] font-bold leading-none" style={{ color }}>
            {value}{unit}
          </p>
          {target !== null && (
            <p className="text-[11px] text-[#94A3B8] mt-1">Target: {target}{unit}</p>
          )}
          {target !== null && (
            <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${p}%`, background: color, opacity: 0.65 }} />
            </div>
          )}
        </>
      ) : (
        <p className="text-[13px] text-[#94A3B8] mt-2 italic">Not yet reviewed</p>
      )}
    </div>
  );
}

// ── NoActivePeriod ─────────────────────────────────────────────────────────────

function NoActivePeriod() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F1F5F9" }}>
        <Icon name="calendar" className="w-6 h-6 text-[#94A3B8]" />
      </div>
      <p className="text-[14px] font-semibold text-[#64748B]">No active review period</p>
      <p className="text-[12px] text-[#94A3B8] max-w-xs">
        HR or a managing partner will open a performance review period. Check back soon.
      </p>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function MyPerformancePage() {
  const period  = useQuery(api.performance.activePeriod);
  const history = useQuery(api.performance.allMyReviews) ?? [];

  // myReview requires a period ID — only call when we have one
  const review = useQuery(
    api.performance.myReview,
    period ? { periodId: period._id } : "skip"
  );

  const loading = period === undefined || history === undefined;

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">My Performance</h2>
        {period ? (
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            {period.name} · {period.startDate} – {period.endDate}
          </p>
        ) : (
          <p className="text-[12px] text-[#94A3B8] mt-0.5">No active period</p>
        )}
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-[13px] text-[#94A3B8]">Loading…</p>
        </div>
      ) : !period ? (
        <NoActivePeriod />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Billable Hours"
              value={review?.billableHours ?? null}
              target={review?.billableHoursTarget ?? null}
              unit="h"
              color="#059669"
              bg="#ECFDF5"
              icon="clock"
            />
            <KpiCard
              label="Cases Handled"
              value={review?.casesHandled ?? null}
              target={null}
              unit=""
              color="#0B2349"
              bg="#EFF4FF"
              icon="briefcase"
            />
            <KpiCard
              label="Cases Closed"
              value={review?.casesClosed ?? null}
              target={null}
              unit=""
              color="#7C3AED"
              bg="#F5F3FF"
              icon="check-circle"
            />
            <KpiCard
              label="Overall Score"
              value={review?.overallScore ?? null}
              target={100}
              unit=""
              color="#D97706"
              bg="#FFFBEB"
              icon="star"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* KPI targets */}
            {review?.kpis && review.kpis.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="px-5 py-4 border-b border-[#F1F5F9]">
                  <h3 className="text-[14px] font-bold text-[#0B2349]">KPI Targets</h3>
                </div>
                <div className="divide-y divide-[#F8FAFC]">
                  {review.kpis.map((k, i) => {
                    const p2 = pct(k.actual, k.target);
                    const col = p2 >= 100 ? "#059669" : p2 >= 70 ? "#0B2349" : "#D97706";
                    return (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[13px] font-medium text-[#1e293b]">{k.name}</p>
                          <span className="text-[12px] font-bold" style={{ color: col }}>
                            {k.actual}{k.unit ?? ""} / {k.target}{k.unit ?? ""}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p2}%`, background: col, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manager notes */}
            {review?.notes && (
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-[#0B2349]">Manager Notes</h3>
                  {review.status === "Submitted" && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "#ECFDF5", color: "#059669" }}>
                      Submitted
                    </span>
                  )}
                </div>
                <div className="px-5 py-4">
                  <p className="text-[13px] text-[#1e293b] leading-relaxed whitespace-pre-wrap">{review.notes}</p>
                  {review.reviewerName && (
                    <p className="text-[11px] text-[#94A3B8] mt-3">— {review.reviewerName}</p>
                  )}
                </div>
              </div>
            )}

            {/* No review yet */}
            {!review && (
              <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Icon name="clock" className="w-8 h-8 text-[#C4C9D4]" />
                <p className="text-[13px] font-medium text-[#64748B]">Review pending</p>
                <p className="text-[11px] text-[#94A3B8]">Your manager has not yet submitted a review for {period.name}.</p>
              </div>
            )}
          </div>

          {/* Review history */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4 border-b border-[#F1F5F9]">
                <h3 className="text-[14px] font-bold text-[#0B2349]">Review History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ background: "#FAFBFC" }}>
                      {["Period", "Score", "Rating", "Billable Hrs", "Cases Closed", "Reviewer", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => {
                      const sl = r.overallScore !== undefined && r.overallScore !== null
                        ? scoreLabel(r.overallScore)
                        : null;
                      return (
                        <tr key={r._id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors">
                          <td className="px-5 py-3.5 font-medium text-[#1e293b] whitespace-nowrap">{r.periodName}</td>
                          <td className="px-5 py-3.5 font-bold text-[#0B2349]">
                            {r.overallScore !== undefined && r.overallScore !== null ? r.overallScore : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            {sl ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: sl.bg, color: sl.text }}>
                                {sl.label}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-[#64748B]">
                            {r.billableHours !== undefined && r.billableHours !== null
                              ? `${r.billableHours}${r.billableHoursTarget ? ` / ${r.billableHoursTarget}h` : "h"}`
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-[#64748B]">
                            {r.casesClosed !== undefined && r.casesClosed !== null ? r.casesClosed : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-[#64748B]">{r.reviewerName ?? "—"}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                              style={r.status === "Submitted"
                                ? { background: "#ECFDF5", color: "#059669" }
                                : { background: "#F1F5F9", color: "#64748B" }}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
