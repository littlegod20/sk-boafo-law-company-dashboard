"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";

const STAGES = ["All", "Pre-arrival", "Week 1", "Month 1", "Completed"];

const ONBOARDEES = [
  {
    id: "ONB-2026-007",
    name: "Akosua Mensah",
    role: "Associate — Litigation",
    dept: "Litigation",
    startDate: "22 Sep 2026",
    stage: "Pre-arrival",
    progress: 20,
    buddy: "Kofi Owusu",
    checklist: [
      { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
      { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
      { task: "IT setup request submitted",    done: false, category: "Pre-arrival" },
      { task: "Desk & access card arranged",   done: false, category: "Pre-arrival" },
      { task: "Orientation meeting scheduled", done: false, category: "Week 1" },
      { task: "Introduction to team",          done: false, category: "Week 1" },
      { task: "System access confirmed",       done: false, category: "Week 1" },
      { task: "HR induction completed",        done: false, category: "Week 1" },
      { task: "First matter assigned",         done: false, category: "Month 1" },
      { task: "30-day check-in",               done: false, category: "Month 1" },
    ],
  },
  {
    id: "ONB-2026-006",
    name: "Kweku Acheampong",
    role: "Paralegal",
    dept: "Conveyancing",
    startDate: "15 Sep 2026",
    stage: "Week 1",
    progress: 55,
    buddy: "Ama Darko",
    checklist: [
      { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
      { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
      { task: "IT setup request submitted",    done: true,  category: "Pre-arrival" },
      { task: "Desk & access card arranged",   done: true,  category: "Pre-arrival" },
      { task: "Orientation meeting scheduled", done: true,  category: "Week 1" },
      { task: "Introduction to team",          done: true,  category: "Week 1" },
      { task: "System access confirmed",       done: false, category: "Week 1" },
      { task: "HR induction completed",        done: false, category: "Week 1" },
      { task: "First matter assigned",         done: false, category: "Month 1" },
      { task: "30-day check-in",               done: false, category: "Month 1" },
    ],
  },
  {
    id: "ONB-2026-005",
    name: "Efua Agyeman",
    role: "HR Officer",
    dept: "Human Resources",
    startDate: "01 Sep 2026",
    stage: "Month 1",
    progress: 80,
    buddy: "Yaa Bonsu",
    checklist: [
      { task: "Offer letter signed",          done: true,  category: "Pre-arrival" },
      { task: "Right to work documents",       done: true,  category: "Pre-arrival" },
      { task: "IT setup request submitted",    done: true,  category: "Pre-arrival" },
      { task: "Desk & access card arranged",   done: true,  category: "Pre-arrival" },
      { task: "Orientation meeting scheduled", done: true,  category: "Week 1" },
      { task: "Introduction to team",          done: true,  category: "Week 1" },
      { task: "System access confirmed",       done: true,  category: "Week 1" },
      { task: "HR induction completed",        done: true,  category: "Week 1" },
      { task: "First matter assigned",         done: false, category: "Month 1" },
      { task: "30-day check-in",               done: false, category: "Month 1" },
    ],
  },
  {
    id: "ONB-2026-004",
    name: "Nana Frimpong",
    role: "IT Support Specialist",
    dept: "IT",
    startDate: "18 Aug 2026",
    stage: "Completed",
    progress: 100,
    buddy: "Nana Acheampong",
    checklist: [
      { task: "Offer letter signed",          done: true, category: "Pre-arrival" },
      { task: "Right to work documents",       done: true, category: "Pre-arrival" },
      { task: "IT setup request submitted",    done: true, category: "Pre-arrival" },
      { task: "Desk & access card arranged",   done: true, category: "Pre-arrival" },
      { task: "Orientation meeting scheduled", done: true, category: "Week 1" },
      { task: "Introduction to team",          done: true, category: "Week 1" },
      { task: "System access confirmed",       done: true, category: "Week 1" },
      { task: "HR induction completed",        done: true, category: "Week 1" },
      { task: "First matter assigned",         done: true, category: "Month 1" },
      { task: "30-day check-in",               done: true, category: "Month 1" },
    ],
  },
];

const STAGE_STYLE: Record<string, { bg: string; text: string }> = {
  "Pre-arrival": { bg: "#EFF4FF", text: "#1d4ed8" },
  "Week 1":      { bg: "#FFFBEB", text: "#D97706" },
  "Month 1":     { bg: "#F5F3FF", text: "#7C3AED" },
  "Completed":   { bg: "#ECFDF5", text: "#059669" },
};

type Onboardee = typeof ONBOARDEES[number];

export default function OnboardingPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Onboardee | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [added, setAdded] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", dept: "", startDate: "", buddy: "" });
  const [confirmComplete, setConfirmComplete] = useState(false);

  const filtered = ONBOARDEES.filter((o) => filter === "All" || o.stage === filter);

  const totalActive    = ONBOARDEES.filter((o) => o.stage !== "Completed").length;
  const completedCount = ONBOARDEES.filter((o) => o.stage === "Completed").length;
  const preArrival     = ONBOARDEES.filter((o) => o.stage === "Pre-arrival").length;
  const avgProgress    = Math.round(ONBOARDEES.reduce((a, o) => a + o.progress, 0) / ONBOARDEES.length);

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Onboarding</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Track new hire onboarding progress</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAdded(false); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Add New Hire
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Onboarding", value: String(totalActive),    icon: "users" as const,       color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pre-arrival",        value: String(preArrival),     icon: "clock" as const,       color: "#1d4ed8", bg: "#EFF4FF" },
          { label: "Completed",          value: String(completedCount), icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Avg Progress",       value: `${avgProgress}%`,      icon: "bar-chart" as const,   color: "#7C3AED", bg: "#F5F3FF" },
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
        {STAGES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={filter === s ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((o) => {
          const ss = STAGE_STYLE[o.stage];
          const done = o.checklist.filter((c) => c.done).length;
          return (
            <div key={o.id} className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              onClick={() => setSelected(o)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                    {o.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1e293b] text-[13px]">{o.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{o.role}</p>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: ss.bg, color: ss.text }}>{o.stage}</span>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Start date: {o.startDate}</span>
                  <span className="font-semibold text-[#0B2349]">{done}/{o.checklist.length} tasks</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${o.progress}%`, background: o.progress === 100 ? "#059669" : "#0B2349" }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#94A3B8]">Buddy: <span className="text-[#64748B] font-medium">{o.buddy}</span></span>
                <span className="text-[11px] font-semibold" style={{ color: "#0B2349" }}>{o.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.name} — Onboarding` : ""} maxWidth="560px">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                {selected.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-[#1e293b]">{selected.name}</p>
                <p className="text-[12px] text-[#64748B]">{selected.role} · {selected.dept}</p>
              </div>
              <span className="ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: STAGE_STYLE[selected.stage].bg, color: STAGE_STYLE[selected.stage].text }}>{selected.stage}</span>
            </div>

            {["Pre-arrival", "Week 1", "Month 1"].map((cat) => (
              <div key={cat}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">{cat}</p>
                <div className="space-y-1.5">
                  {selected.checklist.filter((c) => c.category === cat).map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: c.done ? "#ECFDF5" : "#F8FAFC" }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: c.done ? "#059669" : "#E2E8F0" }}>
                        {c.done && <Icon name="check" className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[12px]" style={{ color: c.done ? "#059669" : "#64748B" }}>{c.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {selected.stage !== "Completed" && (
              <div className="pt-2">
                <button
                  onClick={() => setConfirmComplete(true)}
                  className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#059669" }}
                >
                  Mark Onboarding Complete
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add new hire modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Hire">
        {added ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" }} />
            </div>
            <p className="font-semibold text-[#1e293b]">New hire added</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Onboarding checklist has been created.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowAdd(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Full Name" required>
              <input className={inputCls} placeholder="e.g. Kwame Asante" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role" required>
                <input className={inputCls} placeholder="e.g. Associate" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </FormField>
              <FormField label="Department" required>
                <select className={inputCls} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Human Resources", "IT"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Start Date" required>
                <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </FormField>
              <FormField label="Onboarding Buddy">
                <select className={inputCls} value={form.buddy} onChange={(e) => setForm((f) => ({ ...f, buddy: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Kofi Owusu", "Ama Darko", "Yaa Bonsu", "Nana Acheampong", "Kojo Frimpong"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onClose={() => setShowAdd(false)} confirmLabel="Add New Hire" onConfirm={() => { if (form.name && form.role && form.dept && form.startDate) setAdded(true); }} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={() => { setSelected(null); setConfirmComplete(false); }}
        title="Mark as completed?"
        message={`Mark ${selected?.name}'s onboarding as complete? All remaining tasks will be checked off.`}
        confirmLabel="Mark Complete"
        variant="success"
      />
    </div>
  );
}
