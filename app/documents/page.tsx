import { Icon } from "@/components/Icons";

const DOCUMENTS = [
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

export default function DocumentsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Document Repository</h2>
          <p className="text-sm text-[#94A3B8]">{DOCUMENTS.length} documents — all matters</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }}>
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
          { label: "Total Documents", value: "284", icon: "file-text" as const, color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pending Approval", value: "3", icon: "hourglass" as const, color: "#D97706", bg: "#FFFBEB" },
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
        {["All", "Pending Approval", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={s === "All" ? { background: "#0B2349", color: "white" } : { background: "#F5F7FA", color: "#64748B" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {["Document", "Type", "Case", "Client", "Uploaded By", "Date", "Size", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "#94A3B8" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((doc) => {
                const t = TYPE_ICON_MAP[doc.type] ?? TYPE_ICON_MAP.Application;
                const ss = STATUS_STYLES[doc.status] ?? STATUS_STYLES.Approved;
                return (
                  <tr key={doc.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFF] transition-colors cursor-pointer">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
