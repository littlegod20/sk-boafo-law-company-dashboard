"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls } from "@/components/Modal";

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1, type: "Urgent", from: "S.K. Boafo (Managing Partner)", title: "Court Holiday — 23 September 2026",
    body: "Please note that all courts will be closed on 23 September 2026 for a public holiday. All scheduled hearings on that date will be rescheduled. Affected attorneys should contact the registry immediately.",
    date: "14 Sep 2026", read: false,
  },
  {
    id: 2, type: "Policy", from: "Admin", title: "New Document Naming Convention Effective 1 October",
    body: "Effective 1 October 2026, all case documents must follow the naming convention: [CaseID]_[DocType]_[YYYYMMDD]. For example: SKB-2026-047_SettlementAgreement_20261001.pdf. Please update your practices accordingly.",
    date: "12 Sep 2026", read: false,
  },
  {
    id: 3, type: "Update", from: "A. Mensah (Partner)", title: "Ofori & Sons Hearing Confirmed — 18 Sep",
    body: "The hearing for SKB-2026-047 (Ofori & Sons Ltd.) has been confirmed for 18 September 2026 at 9:00 AM at the High Court, Accra. All relevant documents have been filed.",
    date: "10 Sep 2026", read: true,
  },
  {
    id: 4, type: "HR", from: "Admin", title: "Staff Meeting — Friday 19 September, 4:00 PM",
    body: "There will be a firm-wide staff meeting on Friday, 19 September 2026 at 4:00 PM in the main conference room. Attendance is mandatory for all attorneys and paralegals. Agenda will be shared by Thursday.",
    date: "09 Sep 2026", read: true,
  },
  {
    id: 5, type: "Update", from: "E. Darko (Associate)", title: "Ghana Mining Co. — ZKTeco Filing Submitted",
    body: "The regulatory filing for Ghana Mining Co. (SKB-2026-045) has been submitted to the Minerals Commission. Awaiting acknowledgement. Client has been notified.",
    date: "05 Sep 2026", read: true,
  },
];

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Urgent: { bg: "#FFF5F5", text: "#DC2626", border: "#FCA5A5" },
  Policy: { bg: "#EFF4FF", text: "#1d4ed8", border: "#93C5FD" },
  Update: { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7" },
  HR: { bg: "#F5F3FF", text: "#7C3AED", border: "#C4B5FD" },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [showPost, setShowPost] = useState(false);
  const [posted, setPosted] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Update", from: "", body: "" });

  const unread = announcements.filter((a) => !a.read).length;

  const toggleRead = (id: number) => {
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, read: !a.read } : a));
  };

  return (
    <div className="space-y-5 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0B2349]">Announcements</h2>
          <p className="text-sm text-[#94A3B8]">{unread} unread</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-white"
          style={{ background: "#0B2349" }}
          onClick={() => { setShowPost(true); setPosted(false); }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Post Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => {
          const ts = TYPE_STYLES[a.type] ?? TYPE_STYLES.Update;
          return (
            <div
              key={a.id}
              className="bg-white rounded-xl p-5 transition-shadow hover:shadow-md"
              style={{
                border: `1px solid ${a.read ? "#F1F5F9" : ts.border}`,
                boxShadow: a.read ? "0 1px 4px rgba(0,0,0,0.04)" : `0 2px 12px ${ts.border}50`,
              }}
            >
              <div className="flex items-start gap-3">
                {!a.read && (
                  <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: "#DC2626" }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ background: ts.bg, color: ts.text }}
                      >
                        {a.type}
                      </span>
                      {!a.read && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                          Unread
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">{a.date}</span>
                  </div>

                  <h3 className="font-semibold text-[#1e293b] text-[14px] mb-1">{a.title}</h3>
                  <p className="text-[11px] text-[#64748B] mb-3">From: {a.from}</p>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{a.body}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-lg px-3 py-1.5 text-[12px] font-medium bg-[#F5F7FA] text-[#0B2349] hover:bg-[#EFF4FF] transition-colors"
                      onClick={() => toggleRead(a.id)}
                    >
                      {a.read ? "Mark Unread" : "Mark as Read"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Announcement Modal */}
      <Modal isOpen={showPost} onClose={() => setShowPost(false)} title="Post Announcement">
        {posted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF5" }}>
              <Icon name="check-circle" className="w-6 h-6" style={{ color: "#059669" } as React.CSSProperties} />
            </div>
            <p className="font-semibold text-[#1e293b]">Announcement posted</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">The announcement has been shared with all firm members.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowPost(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Title" required>
                  <input className={inputCls} placeholder="e.g. Court Holiday — 30 September" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Type" required>
                <select className={inputCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                  {["Update", "Urgent", "Policy", "HR"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="From" required>
                <input className={inputCls} placeholder="e.g. A. Mensah (Partner)" value={form.from} onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))} />
              </FormField>
              <div className="col-span-2">
                <FormField label="Message" required>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={4}
                    placeholder="Write your announcement here..."
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  />
                </FormField>
              </div>
            </div>
            <ModalFooter
              onClose={() => setShowPost(false)}
              confirmLabel="Post Announcement"
              onConfirm={() => {
                if (form.title && form.body) {
                  setPosted(true);
                  setForm({ title: "", type: "Update", from: "", body: "" });
                }
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
