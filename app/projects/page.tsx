"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

const PROJECTS = [
  {
    id: "PRJ-001", name: "HR Policy Overhaul 2026",      lead: "Yaa Bonsu",     dept: "Human Resources",  status: "Active",    priority: "High",   progress: 70,  due: "30 Oct 2026",  members: 4, tasks: { done: 14, total: 20 },
  },
  {
    id: "PRJ-002", name: "Firm Website Redesign",         lead: "Nana Acheampong", dept: "Administration", status: "Active",    priority: "Medium", progress: 45,  due: "15 Nov 2026",  members: 3, tasks: { done: 9, total: 20 },
  },
  {
    id: "PRJ-003", name: "Staff Training Programme H2",   lead: "Yaa Bonsu",     dept: "Human Resources",  status: "Active",    priority: "High",   progress: 55,  due: "31 Dec 2026",  members: 2, tasks: { done: 11, total: 20 },
  },
  {
    id: "PRJ-004", name: "Case Management System Upgrade",lead: "Kojo Frimpong", dept: "IT",               status: "Planning",  priority: "High",   progress: 15,  due: "28 Feb 2027",  members: 5, tasks: { done: 3, total: 20 },
  },
  {
    id: "PRJ-005", name: "Client Portal v2",              lead: "Kwabena Asare", dept: "Corporate Law",    status: "Active",    priority: "Medium", progress: 30,  due: "30 Jan 2027",  members: 4, tasks: { done: 6, total: 20 },
  },
  {
    id: "PRJ-006", name: "Annual Compliance Audit",       lead: "S.K. Boafo",   dept: "Litigation",       status: "Completed", priority: "High",   progress: 100, due: "31 Aug 2026",  members: 6, tasks: { done: 20, total: 20 },
  },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Active:    { bg: "#ECFDF5", text: "#059669" },
  Planning:  { bg: "#EFF4FF", text: "#1d4ed8" },
  Completed: { bg: "#F1F5F9", text: "#64748B" },
  "On Hold": { bg: "#FFFBEB", text: "#D97706" },
};

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FFF5F5", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low:    { bg: "#F1F5F9", text: "#64748B" },
};

const AVATAR_PALETTE = [
  { bg: "#EFF4FF", color: "#1d4ed8" }, { bg: "#ECFDF5", color: "#059669" },
  { bg: "#F5F3FF", color: "#7C3AED" }, { bg: "#FFFBEB", color: "#D97706" },
  { bg: "#FFF5F5", color: "#DC2626" }, { bg: "#F0FDF4", color: "#15803d" },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const FILTERS = ["All", "Active", "Planning", "Completed"];

  const filtered = PROJECTS.filter((p) => filter === "All" || p.status === filter);
  const active = PROJECTS.filter((p) => p.status === "Active").length;
  const completed = PROJECTS.filter((p) => p.status === "Completed").length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Projects</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">{PROJECTS.length} projects · {active} active · {completed} completed</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "#0B2349" }}>
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={filter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((p, i) => {
          const av = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
          return (
            <div key={p.id} className="bg-white rounded-xl p-5" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-mono text-[#94A3B8]">{p.id}</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: STATUS_STYLE[p.status].bg, color: STATUS_STYLE[p.status].text }}>{p.status}</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: PRIORITY_STYLE[p.priority].bg, color: PRIORITY_STYLE[p.priority].text }}>{p.priority}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#0B2349]">{p.name}</h3>
                  <p className="text-[12px] text-[#94A3B8] mt-0.5">{p.dept}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#64748B]">{p.tasks.done}/{p.tasks.total} tasks</span>
                  <span className="text-[11px] font-semibold text-[#0B2349]">{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.progress === 100 ? "#059669" : "#0B2349" }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: av.bg, color: av.color }}>
                    {p.lead.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <span className="text-[12px] text-[#64748B]">{p.lead}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="users" className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[12px] text-[#94A3B8]">{p.members}</span>
                  <span className="text-[#E2E8F0] mx-1">·</span>
                  <Icon name="calendar" className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-[12px] text-[#94A3B8]">{p.due}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
