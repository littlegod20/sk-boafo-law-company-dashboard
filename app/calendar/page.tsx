import { Icon } from "@/components/Icons";

const HEARINGS = [
  { date: "18 Sep 2026", day: "Thu", caseId: "SKB-2026-047", client: "Ofori & Sons Ltd.", type: "Corporate", court: "High Court — Accra", time: "9:00 AM", attorney: "A. Mensah", status: "Confirmed", urgency: "hot" },
  { date: "20 Sep 2026", day: "Sat", caseId: "SKB-2026-039", client: "Goldfields Minerals", type: "Mining & Energy", court: "Commercial Court — Accra", time: "10:30 AM", attorney: "E. Darko", status: "Confirmed", urgency: "hot" },
  { date: "22 Sep 2026", day: "Mon", caseId: "SKB-2026-046", client: "Adwoa Boateng", type: "Estate & Probate", court: "Circuit Court — Kumasi", time: "2:00 PM", attorney: "K. Asante", status: "Confirmed", urgency: "medium" },
  { date: "25 Sep 2026", day: "Thu", caseId: "SKB-2026-045", client: "Ghana Mining Co.", type: "Mining & Energy", court: "High Court — Accra", time: "9:30 AM", attorney: "E. Darko", status: "Tentative", urgency: "medium" },
  { date: "01 Oct 2026", day: "Thu", caseId: "SKB-2026-043", client: "Accra Realty Ltd.", type: "Real Estate", court: "Land Court — Accra", time: "11:00 AM", attorney: "D. Owusu", status: "Confirmed", urgency: "low" },
  { date: "03 Oct 2026", day: "Sat", caseId: "SKB-2026-041", client: "TeleFlex Ghana", type: "Telecom & Tech", court: "Commercial Court — Accra", time: "9:00 AM", attorney: "E. Darko", status: "Confirmed", urgency: "low" },
  { date: "07 Oct 2026", day: "Wed", caseId: "SKB-2026-040", client: "Kwame Osei", type: "Litigation", court: "High Court — Accra", time: "10:00 AM", attorney: "D. Owusu", status: "Confirmed", urgency: "low" },
  { date: "12 Oct 2026", day: "Mon", caseId: "SKB-2026-038", client: "Akua Twum", type: "Land & Chieftaincy", court: "Customary Land Secretariat", time: "3:00 PM", attorney: "K. Asante", status: "Tentative", urgency: "low" },
  { date: "15 Oct 2026", day: "Thu", caseId: "SKB-2026-037", client: "Adom Broadcasting", type: "Telecom & Tech", court: "NCA Dispute Panel", time: "2:30 PM", attorney: "A. Mensah", status: "Confirmed", urgency: "low" },
];

const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const HEARING_DATES = new Set([18, 20, 22, 25]);
const FILING_DATES = new Set([20, 30]);

function daysUntil(dateStr: string) {
  const today = new Date("2026-09-15");
  const target = new Date(dateStr);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `In ${diff} days`;
}

function urgencyStyle(u: string) {
  if (u === "hot") return { border: "#FCA5A5", bg: "#FFF5F5", dot: "#DC2626" };
  if (u === "medium") return { border: "#FCD34D", bg: "#FFFBEB", dot: "#D97706" };
  return { border: "#E2E8F0", bg: "#FAFBFC", dot: "#94A3B8" };
}

export default function CalendarPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Court Calendar</h2>
          <p className="text-sm text-[#94A3B8]">Hearings, filings & deadlines — Sep–Oct 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA] flex items-center gap-2">
            <Icon name="chevron-down" className="w-4 h-4" />
            September 2026
          </button>
          <button className="rounded-lg px-4 py-2 text-[13px] font-medium text-white flex items-center gap-2" style={{ background: "#0B2349" }}>
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            Add Hearing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Mini Calendar */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0B2349]">September 2026</h3>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-[#F5F7FA] rounded-lg text-[#94A3B8]"><Icon name="chevron-down" className="w-4 h-4 -rotate-90" /></button>
              <button className="p-1.5 hover:bg-[#F5F7FA] rounded-lg text-[#94A3B8]"><Icon name="chevron-right" className="w-4 h-4" /></button>
            </div>
          </div>
          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[#94A3B8] py-1">{d}</div>
            ))}
          </div>
          {/* Dates — Sep 2026 starts on Tuesday (offset 2) */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* Offset for Tuesday */}
            {[0, 1].map((i) => <div key={`empty-${i}`} />)}
            {MONTH_DAYS.map((d) => {
              const isToday = d === 15;
              const hasHearing = HEARING_DATES.has(d);
              const hasFiling = FILING_DATES.has(d);
              return (
                <button
                  key={d}
                  className="aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-medium relative transition-colors"
                  style={isToday
                    ? { background: "#0B2349", color: "white" }
                    : hasHearing
                    ? { background: "#FEF3C7", color: "#0B2349" }
                    : { color: "#374151" }
                  }
                >
                  {d}
                  {(hasHearing || hasFiling) && !isToday && (
                    <span
                      className="absolute bottom-0.5 w-1 h-1 rounded-full"
                      style={{ background: hasHearing ? "#C9A227" : "#DC2626" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-2">
            {[
              { dot: "#C9A227", label: "Court hearing" },
              { dot: "#DC2626", label: "Filing deadline" },
              { dot: "#94A3B8", label: "Client meeting" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[11px] text-[#64748B]">
                <span className="w-2 h-2 rounded-full" style={{ background: l.dot }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Attorney filter */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
            <p className="text-[11px] font-semibold text-[#0B2349] mb-2 uppercase tracking-wide">Filter by Attorney</p>
            {["All", "A. Mensah", "K. Asante", "E. Darko", "D. Owusu"].map((a) => (
              <button key={a} className="w-full text-left text-[12px] px-3 py-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#64748B] transition-colors">
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Hearings List */}
        <div className="xl:col-span-2 space-y-3">
          {HEARINGS.map((h, i) => {
            const s = urgencyStyle(h.urgency);
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border transition-shadow hover:shadow-md"
                style={{ borderColor: s.border, background: "white" }}
              >
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div
                    className="flex-shrink-0 w-14 text-center rounded-lg py-2"
                    style={{ background: h.urgency === "hot" ? "#0B2349" : "#F5F7FA" }}
                  >
                    <p className="text-[10px] font-semibold uppercase" style={{ color: h.urgency === "hot" ? "#C9A227" : "#94A3B8" }}>{h.day}</p>
                    <p className="text-xl font-bold" style={{ color: h.urgency === "hot" ? "white" : "#0B2349" }}>
                      {h.date.split(" ")[0]}
                    </p>
                    <p className="text-[10px]" style={{ color: h.urgency === "hot" ? "rgba(255,255,255,0.6)" : "#94A3B8" }}>
                      {h.date.split(" ")[1]}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-[#1e293b] text-[13px]">{h.client}</p>
                        <p className="text-[11px] text-[#94A3B8] font-mono">{h.caseId} · {h.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={h.status === "Confirmed"
                            ? { background: "#ECFDF5", color: "#059669" }
                            : { background: "#FFFBEB", color: "#D97706" }
                          }
                        >
                          {h.status}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">{daysUntil(h.date)}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Icon name="building" className="w-3 h-3" />
                        {h.court}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Icon name="clock" className="w-3 h-3" />
                        {h.time}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <Icon name="user" className="w-3 h-3" />
                        {h.attorney}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
