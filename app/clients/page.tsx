import { Icon } from "@/components/Icons";

const CLIENTS = [
  { id: "CLT-001", name: "Ofori & Sons Ltd.", type: "Corporate", contact: "+233 20 811 4401", email: "info@oforiandson.gh", activeCases: 3, totalCases: 5, joined: "Mar 2022", attorney: "A. Mensah" },
  { id: "CLT-002", name: "Adwoa Boateng", type: "Individual", contact: "+233 24 552 7703", email: "adwoa.b@gmail.com", activeCases: 1, totalCases: 2, joined: "Jan 2024", attorney: "K. Asante" },
  { id: "CLT-003", name: "Ghana Mining Co.", type: "Corporate", contact: "+233 30 274 1100", email: "legal@ghanamining.com", activeCases: 2, totalCases: 4, joined: "Jun 2021", attorney: "E. Darko" },
  { id: "CLT-004", name: "Kofi Agyeman", type: "Individual", contact: "+233 27 315 8890", email: "k.agyeman@outlook.com", activeCases: 1, totalCases: 1, joined: "Aug 2026", attorney: "A. Mensah" },
  { id: "CLT-005", name: "Accra Realty Ltd.", type: "Corporate", contact: "+233 30 278 4450", email: "admin@accra-realty.gh", activeCases: 1, totalCases: 3, joined: "Sep 2020", attorney: "D. Owusu" },
  { id: "CLT-006", name: "Yaa Asantewaa Trust", type: "Trust", contact: "+233 32 204 7700", email: "trust@yaaasantewaa.org", activeCases: 0, totalCases: 2, joined: "Nov 2019", attorney: "K. Asante" },
  { id: "CLT-007", name: "TeleFlex Ghana", type: "Corporate", contact: "+233 30 291 2233", email: "legal@teleflex.gh", activeCases: 1, totalCases: 2, joined: "Feb 2023", attorney: "E. Darko" },
  { id: "CLT-008", name: "Kwame Osei", type: "Individual", contact: "+233 26 448 1122", email: "kwameosei.law@yahoo.com", activeCases: 1, totalCases: 1, joined: "Jul 2026", attorney: "D. Owusu" },
  { id: "CLT-009", name: "Goldfields Minerals", type: "Corporate", contact: "+233 30 299 5500", email: "compliance@goldfields.gh", activeCases: 1, totalCases: 3, joined: "Apr 2019", attorney: "E. Darko" },
  { id: "CLT-010", name: "Akua Twum", type: "Individual", contact: "+233 20 767 3344", email: "akuatwum1987@gmail.com", activeCases: 1, totalCases: 1, joined: "Jun 2026", attorney: "K. Asante" },
  { id: "CLT-011", name: "Adom Broadcasting", type: "Corporate", contact: "+233 30 281 7788", email: "legal@adom.com.gh", activeCases: 1, totalCases: 2, joined: "Jan 2022", attorney: "A. Mensah" },
  { id: "CLT-012", name: "Ama Sarpong", type: "Individual", contact: "+233 55 224 9910", email: "ama.sarpong@hotmail.com", activeCases: 0, totalCases: 1, joined: "Jun 2026", attorney: "D. Owusu" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Corporate: { bg: "#EFF4FF", text: "#1d4ed8" },
  Individual: { bg: "#F0FDF4", text: "#15803d" },
  Trust: { bg: "#FDF4FF", text: "#7e22ce" },
};

export default function ClientsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Client Records</h2>
          <p className="text-sm text-[#94A3B8]">{CLIENTS.length} clients on file</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }}>
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            Add Client
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] bg-white hover:bg-[#F5F7FA]">
            <Icon name="download" className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: 124, icon: "users" as const, color: "#0B2349", bg: "#EFF4FF" },
          { label: "Corporate", value: 71, icon: "building" as const, color: "#1d4ed8", bg: "#EFF4FF" },
          { label: "Individual", value: 53, icon: "user" as const, color: "#059669", bg: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <Icon name={s.icon} className="w-5 h-5" style={{ color: s.color } as React.CSSProperties} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0B2349]">{s.value}</p>
              <p className="text-[11px] text-[#94A3B8]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Client ID", "Name", "Type", "Contact", "Active Cases", "Total Cases", "Lead Attorney", "Since", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((c) => {
                const tc = TYPE_COLORS[c.type] ?? { bg: "#F1F5F9", text: "#64748B" };
                return (
                  <tr key={c.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#94A3B8]">{c.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[#1e293b]">{c.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: tc.bg, color: tc.text }}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.contact}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${c.activeCases > 0 ? "text-[#059669]" : "text-[#94A3B8]"}`}>
                        {c.activeCases}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.totalCases}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.attorney}</td>
                    <td className="px-5 py-3.5 text-[#94A3B8]">{c.joined}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                          <Icon name="eye" className="w-3.5 h-3.5" />
                        </button>
                        <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                          <Icon name="edit" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
