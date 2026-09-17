"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const PAGE_SIZE = 8;

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner",
  partner:          "Partner",
  associate:        "Associate",
  paralegal:        "Paralegal",
  admin:            "Admin",
  hr_officer:       "HR Officer",
};

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" }, { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" }, { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" }, { bg: "#F0FDF4", color: "#15803d" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Active:     { bg: "#ECFDF5", text: "#059669" },
  "On Leave": { bg: "#FFFBEB", text: "#D97706" },
  Inactive:   { bg: "#F1F5F9", text: "#64748B" },
};

export default function EmployeesPage() {
  // ── Convex ──────────────────────────────────────────────────────────────────
  const rawUsers = useQuery(api.users.list) ?? [];

  // Map to display shape
  const employees = rawUsers.map((u) => ({
    _id:    u._id,
    empId:  u.employeeId ?? u._id.toString().slice(-6).toUpperCase(),
    name:   u.name ?? u.email ?? "Unknown",
    role:   ROLE_LABELS[u.role ?? "associate"] ?? u.role ?? "Staff",
    dept:   u.dept ?? "—",
    email:  u.email ?? "—",
    phone:  u.workPhone ?? "—",
    joined: u.joinedDate ?? "—",
    status: u.isActive === false ? "Inactive" : "Active",
  }));

  // ── State ────────────────────────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered  = employees.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageIds   = paginated.map((e) => e.empId);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) { pageIds.forEach((id) => next.delete(id)); }
      else                  { pageIds.forEach((id) => next.add(id)); }
      return next;
    });
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Employees</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            {employees.length} staff members · {employees.filter((e) => e.status === "Active").length} active
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white border border-[#E2E8F0] w-72">
        <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8]" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search by name or department…"
          className="flex-1 bg-transparent text-[13px] text-[#1e293b] placeholder-[#94A3B8] outline-none min-w-0"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {selected.size > 0 && (
        <BulkToolbar count={selected.size} onClear={() => setSelected(new Set())}>
          <TBtn onClick={() => {}}>
            <Icon name="download" className="w-3.5 h-3.5" strokeWidth={2} /> Export
          </TBtn>
        </BulkToolbar>
      )}

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              <th className="pl-5 pr-3 py-3">
                <Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleAll} />
              </th>
              {["Employee", "Role", "Department", "Contact", "Joined", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((e, i) => {
              const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              const ss = STATUS_STYLE[e.status] ?? STATUS_STYLE.Active;
              return (
                <tr key={e.empId} className="border-t border-[#F8FAFC] hover:bg-[#FAFBFC] transition-colors" style={selected.has(e.empId) ? { background: "#EFF4FF" } : {}}>
                  <td className="pl-5 pr-3 py-3.5">
                    <Checkbox checked={selected.has(e.empId)} onChange={() => {
                      setSelected((prev) => { const next = new Set(prev); if (next.has(e.empId)) next.delete(e.empId); else next.add(e.empId); return next; });
                    }} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: av.bg, color: av.color }}>
                        {e.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e293b] leading-tight">{e.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-[#1e293b]">{e.role}</td>
                  <td className="px-3 py-3.5 text-[#64748B]">{e.dept}</td>
                  <td className="px-3 py-3.5 text-[#64748B] text-[12px]">{e.phone}</td>
                  <td className="px-3 py-3.5 text-[#94A3B8] text-[12px]">{e.joined}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <button className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#94A3B8]">
                      <Icon name="eye" className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-[12px] text-[#94A3B8]">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setSelected(new Set()); }} />
      </div>
    </div>
  );
}
