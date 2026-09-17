"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Pagination, BulkToolbar, TBtn, Checkbox } from "@/components/TableControls";
import { Modal, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const PAGE_SIZE = 8;

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner",
  partner:          "Partner",
  associate:        "Associate",
  paralegal:        "Paralegal",
  admin:            "Admin",
  hr_officer:       "HR Officer",
};

const ROLE_KEYS = Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>;

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

type RawUser = NonNullable<ReturnType<typeof useQuery<typeof api.users.list>>>[number];

interface EditForm {
  name:       string;
  workPhone:  string;
  dept:       string;
  role:       string;
  isActive:   boolean;
  joinedDate: string;
  barNumber:  string;
}

export default function EmployeesPage() {
  const rawUsers  = useQuery(api.users.list) ?? [];
  const updateFn  = useMutation(api.users.update);

  const employees = rawUsers.map((u) => ({
    _id:        u._id,
    empId:      u.employeeId ?? u._id.toString().slice(-6).toUpperCase(),
    name:       u.name ?? u.email ?? "Unknown",
    role:       ROLE_LABELS[u.role ?? "associate"] ?? u.role ?? "Staff",
    roleKey:    u.role ?? "associate",
    dept:       u.dept ?? "—",
    email:      u.email ?? "—",
    phone:      u.workPhone ?? "—",
    joined:     u.joinedDate ?? "—",
    barNumber:  u.barNumber ?? "",
    status:     u.isActive === false ? "Inactive" : "Active",
    isActive:   u.isActive !== false,
    _raw:       u,
  }));

  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<typeof employees[number] | null>(null);
  const [form,       setForm]       = useState<EditForm>({ name: "", workPhone: "", dept: "", role: "associate", isActive: true, joinedDate: "", barNumber: "" });
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

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

  function openEdit(emp: typeof employees[number]) {
    setEditTarget(emp);
    setForm({
      name:       emp.name,
      workPhone:  emp.phone === "—" ? "" : emp.phone,
      dept:       emp.dept === "—" ? "" : emp.dept,
      role:       emp.roleKey,
      isActive:   emp.isActive,
      joinedDate: emp.joined === "—" ? "" : emp.joined,
      barNumber:  emp.barNumber,
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateFn({
        id:         editTarget._id as Id<"users">,
        name:       form.name || undefined,
        workPhone:  form.workPhone || undefined,
        dept:       form.dept || undefined,
        role:       form.role as any,
        isActive:   form.isActive,
        joinedDate: form.joinedDate || undefined,
        barNumber:  form.barNumber || undefined,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
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
                    <button
                      onClick={() => openEdit(e)}
                      className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#94A3B8] hover:text-[#0B2349]"
                    >
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

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Employee" maxWidth="520px">
        {editTarget && (
          saved ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
                <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
              </div>
              <p className="font-semibold text-[#1e293b]">Changes saved</p>
              <p className="text-[13px] text-[#94A3B8] mt-1">Employee profile has been updated.</p>
              <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setEditTarget(null)}>Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Identity */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                  {editTarget.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-semibold text-[#1e293b] text-[13px]">{editTarget.name}</p>
                  <p className="text-[11px] text-[#94A3B8]">{editTarget.email} · {editTarget.empId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </FormField>
                <FormField label="Work Phone">
                  <input className={inputCls} value={form.workPhone} onChange={(e) => setForm((f) => ({ ...f, workPhone: e.target.value }))} />
                </FormField>
                <FormField label="Department">
                  <input className={inputCls} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} />
                </FormField>
                <FormField label="Role">
                  <select className={inputCls} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
                  </select>
                </FormField>
                <FormField label="Date Joined">
                  <input className={inputCls} placeholder="e.g. Jan 2020" value={form.joinedDate} onChange={(e) => setForm((f) => ({ ...f, joinedDate: e.target.value }))} />
                </FormField>
                <FormField label="Bar Number">
                  <input className={inputCls} placeholder="e.g. GHA-BAR-2020-0201" value={form.barNumber} onChange={(e) => setForm((f) => ({ ...f, barNumber: e.target.value }))} />
                </FormField>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-[#F8FAFC]">
                <span className="text-[13px] text-[#1e293b] font-medium">Active employee</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                  style={{ background: form.isActive ? "#0B2349" : "#CBD5E1" }}
                >
                  <span
                    className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
                    style={{ transform: form.isActive ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <ModalFooter
                onClose={() => setEditTarget(null)}
                confirmLabel={saving ? "Saving…" : "Save Changes"}
                onConfirm={handleSave}
              />
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
