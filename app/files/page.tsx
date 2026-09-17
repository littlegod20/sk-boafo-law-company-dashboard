"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

type FileItem = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "png" | "folder";
  size: string;
  modified: string;
  shared: boolean;
};

const FILES: FileItem[] = [
  { id: "f1",  name: "Employment Contract – Yaa Bonsu.pdf",   type: "pdf",    size: "1.2 MB",  modified: "12 Sep 2026", shared: false },
  { id: "f2",  name: "Attendance Policy 2026.docx",            type: "docx",   size: "340 KB",  modified: "05 Sep 2026", shared: true  },
  { id: "f3",  name: "Leave Entitlements Q3.xlsx",             type: "xlsx",   size: "210 KB",  modified: "01 Sep 2026", shared: true  },
  { id: "f4",  name: "Firm Org Chart.png",                     type: "png",    size: "780 KB",  modified: "28 Aug 2026", shared: false },
  { id: "f5",  name: "HR Policy Handbook 2026.pdf",            type: "pdf",    size: "3.4 MB",  modified: "15 Aug 2026", shared: true  },
  { id: "f6",  name: "Onboarding Templates",                   type: "folder", size: "—",       modified: "10 Aug 2026", shared: false },
  { id: "f7",  name: "Performance Review Q2 2026.docx",        type: "docx",   size: "420 KB",  modified: "10 Jul 2026", shared: false },
  { id: "f8",  name: "Training Schedule H2.xlsx",              type: "xlsx",   size: "180 KB",  modified: "01 Jul 2026", shared: true  },
  { id: "f9",  name: "Staff Meeting Notes Jun 2026.docx",      type: "docx",   size: "95 KB",   modified: "28 Jun 2026", shared: true  },
  { id: "f10", name: "Payroll Reports",                        type: "folder", size: "—",       modified: "01 Jun 2026", shared: false },
];

const TYPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pdf:    { bg: "#FFF5F5", color: "#DC2626", label: "PDF"    },
  docx:   { bg: "#EFF4FF", color: "#1d4ed8", label: "DOCX"   },
  xlsx:   { bg: "#ECFDF5", color: "#059669", label: "XLSX"   },
  png:    { bg: "#F5F3FF", color: "#7C3AED", label: "PNG"    },
  folder: { bg: "#FFFBEB", color: "#D97706", label: "Folder" },
};

function FileIcon({ type }: { type: FileItem["type"] }) {
  const s = TYPE_STYLE[type];
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
      <Icon name={type === "folder" ? "folder" : "file"} className="w-4 h-4" style={{ color: s.color }} />
    </div>
  );
}

export default function MyFilesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const FILTERS = ["All", "PDF", "DOCX", "XLSX", "Folder"];

  const filtered = FILES.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || TYPE_STYLE[f.type].label === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">My Files</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">{FILES.length} files and folders</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "#0B2349" }}>
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} /> Upload
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white border border-[#E2E8F0] w-64">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
          <input type="text" placeholder="Search files…" className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none min-w-0" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={filter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Name", "Type", "Size", "Modified", "Shared", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors cursor-pointer group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <FileIcon type={f.type} />
                    <span className="font-medium text-[#1e293b] group-hover:text-[#0B2349] transition-colors">{f.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: TYPE_STYLE[f.type].bg, color: TYPE_STYLE[f.type].color }}>
                    {TYPE_STYLE[f.type].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[#64748B]">{f.size}</td>
                <td className="px-5 py-3.5 text-[#94A3B8] text-[12px]">{f.modified}</td>
                <td className="px-5 py-3.5">
                  {f.shared && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "#EFF4FF", color: "#1d4ed8" }}>
                      <Icon name="users" className="w-3 h-3" /> Shared
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <button className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#94A3B8] opacity-0 group-hover:opacity-100">
                    <Icon name="download" className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
