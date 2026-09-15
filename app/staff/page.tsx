import { Icon } from "@/components/Icons";

const STAFF = [
  { id: "STF-001", initials: "SK", name: "S.K. Boafo", role: "Managing Partner", dept: "Litigation & Corporate", activeCases: 0, totalCases: 312, joined: "1976", email: "sk@skboafo.gh", phone: "+233 36 219 5442", color: "#C9A227" },
  { id: "STF-002", initials: "AM", name: "Abena Mensah", role: "Partner", dept: "Corporate & Telecom", activeCases: 14, totalCases: 87, joined: "2018", email: "a.mensah@skboafo.gh", phone: "+233 20 811 4401", color: "#0B2349" },
  { id: "STF-003", initials: "KA", name: "Kofi Asante", role: "Associate", dept: "Estate & Probate, Land", activeCases: 11, totalCases: 43, joined: "2022", email: "k.asante@skboafo.gh", phone: "+233 24 552 7703", color: "#059669" },
  { id: "STF-004", initials: "ED", name: "Esi Darko", role: "Associate", dept: "Mining, Energy & Tech", activeCases: 12, totalCases: 51, joined: "2021", email: "e.darko@skboafo.gh", phone: "+233 27 315 8890", color: "#7C3AED" },
  { id: "STF-005", initials: "DO", name: "Derick Owusu", role: "Associate", dept: "Real Estate, Employment", activeCases: 10, totalCases: 38, joined: "2023", email: "d.owusu@skboafo.gh", phone: "+233 20 767 3344", color: "#DC2626" },
  { id: "STF-006", initials: "AO", name: "Akosua Osei", role: "Paralegal", dept: "All Practice Areas", activeCases: 8, totalCases: 24, joined: "2024", email: "a.osei@skboafo.gh", phone: "+233 55 224 9910", color: "#D97706" },
  { id: "STF-007", initials: "KD", name: "Kweku Duah", role: "Paralegal", dept: "Litigation", activeCases: 6, totalCases: 18, joined: "2024", email: "k.duah@skboafo.gh", phone: "+233 26 448 1122", color: "#0891b2" },
  { id: "STF-008", initials: "YB", name: "Yaa Bonsu", role: "Admin / Secretary", dept: "Administration", activeCases: 0, totalCases: 0, joined: "2020", email: "y.bonsu@skboafo.gh", phone: "+233 30 278 4450", color: "#64748B" },
];

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  "Managing Partner": { bg: "#FEF9E7", text: "#C9A227" },
  "Partner": { bg: "#EFF4FF", text: "#1d4ed8" },
  "Associate": { bg: "#ECFDF5", text: "#059669" },
  "Paralegal": { bg: "#F5F3FF", text: "#7C3AED" },
  "Admin / Secretary": { bg: "#F1F5F9", text: "#64748B" },
};

const DEPT_SUMMARY = [
  { area: "Litigation & Arbitration", attorneys: ["A. Mensah", "D. Owusu"], cases: 14 },
  { area: "Mining & Energy", attorneys: ["E. Darko"], cases: 7 },
  { area: "Corporate & Secretarial", attorneys: ["A. Mensah"], cases: 9 },
  { area: "Real Estate", attorneys: ["D. Owusu"], cases: 10 },
  { area: "Estate & Probate", attorneys: ["K. Asante"], cases: 5 },
  { area: "Employment & Labour", attorneys: ["D. Owusu"], cases: 2 },
];

export default function StaffPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Staff & Team</h2>
          <p className="text-sm text-[#94A3B8]">{STAFF.length} team members</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }}>
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Add Member
        </button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAFF.map((member) => {
          const rs = ROLE_STYLES[member.role] ?? { bg: "#F1F5F9", text: "#64748B" };
          return (
            <div
              key={member.id}
              className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold"
                  style={{ background: member.color + "18", color: member.color }}
                >
                  {member.initials}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: rs.bg, color: rs.text }}>
                  {member.role}
                </span>
              </div>

              <h3 className="font-semibold text-[#1e293b] text-[14px]">{member.name}</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{member.dept}</p>

              <div className="mt-4 pt-4 border-t border-[#F8FAFC] grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-[#94A3B8]">Active Cases</p>
                  <p className="text-[15px] font-bold text-[#0B2349]">{member.activeCases}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#94A3B8]">All Time</p>
                  <p className="text-[15px] font-bold text-[#0B2349]">{member.totalCases}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-[11px] text-[#64748B] hover:text-[#0B2349] transition-colors">
                  <Icon name="mail" className="w-3 h-3 flex-shrink-0" />
                  {member.email}
                </a>
                <span className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <Icon name="phone" className="w-3 h-3 flex-shrink-0" />
                  {member.phone}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg py-1.5 text-[11px] font-medium bg-[#F5F7FA] text-[#0B2349] hover:bg-[#EFF4FF] transition-colors">
                  View Cases
                </button>
                <button className="rounded-lg px-3 py-1.5 hover:bg-[#F5F7FA] transition-colors">
                  <Icon name="edit" className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Practice Area Assignment */}
      <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <h3 className="text-sm font-semibold text-[#0B2349] mb-1">Practice Area Coverage</h3>
        <p className="text-[11px] text-[#94A3B8] mb-4">Lead attorneys by area</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DEPT_SUMMARY.map((d) => (
            <div key={d.area} className="rounded-xl p-4 bg-[#F5F7FA]" style={{ border: "1px solid #F1F5F9" }}>
              <p className="text-[12px] font-semibold text-[#0B2349]">{d.area}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{d.attorneys.join(", ")}</p>
              <p className="text-[11px] text-[#94A3B8] mt-2">{d.cases} active matters</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
