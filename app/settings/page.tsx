"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { ConfirmDialog } from "@/components/Modal";

const FIRM_FIELDS = [
  { label: "Firm Name", value: "S.K. Boafo & Company", type: "text" },
  { label: "Trading Name", value: "Gye Nyame Chambers", type: "text" },
  { label: "Ghana Bar Association No.", value: "GBA-1976-0044", type: "text" },
  { label: "Accra Office", value: "No. 23 Nii Bonne Crescent, Dzorwulu, Accra", type: "text" },
  { label: "Kumasi Office", value: "H/No OTB 389, Asomfo Road, Adum, Kumasi", type: "text" },
  { label: "Main Phone", value: "+233 36 219 5442", type: "tel" },
  { label: "Email", value: "info@skboafoandcompany.org", type: "email" },
];

const PREF_FIELDS = [
  { label: "Default Currency", value: "GHS — Ghana Cedi", options: ["GHS — Ghana Cedi", "USD — US Dollar", "EUR — Euro"] },
  { label: "Fiscal Year Start", value: "January", options: ["January", "April", "July", "October"] },
  { label: "Date Format", value: "DD MMM YYYY", options: ["DD MMM YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
  { label: "Cases Per Page", value: "20", options: ["10", "20", "50", "100"] },
];

const INITIAL_TOGGLES = [
  { label: "Email on new case assignment", enabled: true },
  { label: "Email on document requiring approval", enabled: true },
  { label: "Reminder 3 days before hearing", enabled: true },
  { label: "Reminder for overdue invoices", enabled: true },
  { label: "Announcement notifications", enabled: false },
  { label: "Weekly case summary digest", enabled: false },
];

const USERS = [
  { name: "S.K. Boafo", role: "Managing Partner", access: "Full", initials: "SK", color: "#C9A227" },
  { name: "Abena Mensah", role: "Partner", access: "Full", initials: "AM", color: "#0B2349" },
  { name: "Kofi Asante", role: "Associate", access: "Standard", initials: "KA", color: "#059669" },
  { name: "Esi Darko", role: "Associate", access: "Standard", initials: "ED", color: "#7C3AED" },
  { name: "Derick Owusu", role: "Associate", access: "Standard", initials: "DO", color: "#DC2626" },
  { name: "Akosua Osei", role: "Paralegal", access: "Limited", initials: "AO", color: "#D97706" },
  { name: "Yaa Bonsu", role: "Admin", access: "Admin", initials: "YB", color: "#64748B" },
];

const ACCESS_STYLES: Record<string, { bg: string; text: string }> = {
  Full: { bg: "#ECFDF5", text: "#059669" },
  Standard: { bg: "#EFF4FF", text: "#1d4ed8" },
  Limited: { bg: "#FFFBEB", text: "#D97706" },
  Admin: { bg: "#F5F3FF", text: "#7C3AED" },
};

const inputCls = "w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#1e293b] outline-none focus:border-[#0B2349] transition-colors bg-white";

export default function SettingsPage() {
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [confirmFirm, setConfirmFirm] = useState(false);
  const [confirmPref, setConfirmPref] = useState(false);
  const [savedFirm, setSavedFirm] = useState(false);
  const [savedPref, setSavedPref] = useState(false);

  const flipToggle = (i: number) => {
    setToggles((prev) => prev.map((t, idx) => idx === i ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <div className="space-y-5 max-w-[900px]">
      <div>
        <h2 className="text-lg font-bold text-[#0B2349]">Settings</h2>
        <p className="text-sm text-[#94A3B8]">Manage firm settings, preferences and user access</p>
      </div>

      {/* Firm Information */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
            <Icon name="building" className="w-4 h-4 text-[#0B2349]" />
          </div>
          <h3 className="font-semibold text-[#0B2349] text-[14px]">Firm Information</h3>
          {savedFirm && <span className="ml-auto text-[11px] font-semibold text-[#059669]">Saved</span>}
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIRM_FIELDS.map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">{field.label}</label>
                <input type={field.type} defaultValue={field.value} className={inputCls} />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3 bg-[#FAFBFC]">
          <button
            className="rounded-lg px-5 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => { setConfirmFirm(true); setSavedFirm(false); }}
          >
            Save Changes
          </button>
          <button className="rounded-lg px-5 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
            <Icon name="settings" className="w-4 h-4 text-[#0B2349]" />
          </div>
          <h3 className="font-semibold text-[#0B2349] text-[14px]">Dashboard Preferences</h3>
          {savedPref && <span className="ml-auto text-[11px] font-semibold text-[#059669]">Saved</span>}
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREF_FIELDS.map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">{field.label}</label>
                <select defaultValue={field.value} className={inputCls}>
                  {field.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#F1F5F9] flex gap-3 bg-[#FAFBFC]">
          <button
            className="rounded-lg px-5 py-2 text-[13px] font-medium text-white"
            style={{ background: "#0B2349" }}
            onClick={() => { setConfirmPref(true); setSavedPref(false); }}
          >
            Save Changes
          </button>
          <button className="rounded-lg px-5 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
            <Icon name="bell" className="w-4 h-4 text-[#0B2349]" />
          </div>
          <h3 className="font-semibold text-[#0B2349] text-[14px]">Notifications</h3>
        </div>
        <div className="px-6 py-5 space-y-3">
          {toggles.map((toggle, i) => (
            <div key={toggle.label} className="flex items-center justify-between py-2 border-b border-[#F8FAFC] last:border-0">
              <span className="text-[13px] text-[#374151]">{toggle.label}</span>
              <button
                onClick={() => flipToggle(i)}
                className="relative rounded-full transition-colors flex-shrink-0"
                style={{ background: toggle.enabled ? "#0B2349" : "#E2E8F0", width: 40, height: 22 }}
                aria-label={toggle.enabled ? "Disable" : "Enable"}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: toggle.enabled ? "calc(100% - 18px)" : "2px", transitionProperty: "left" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Access & Roles */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EFF4FF" }}>
            <Icon name="shield" className="w-4 h-4 text-[#0B2349]" />
          </div>
          <h3 className="font-semibold text-[#0B2349] text-[14px]">User Access & Roles</h3>
        </div>
        <div className="px-6 py-5 space-y-2">
          {USERS.map((u) => {
            const as_ = ACCESS_STYLES[u.access] ?? { bg: "#F1F5F9", text: "#64748B" };
            return (
              <div key={u.name} className="flex items-center gap-3 py-2.5 border-b border-[#F8FAFC] last:border-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: u.color + "20", color: u.color }}
                >
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1e293b]">{u.name}</p>
                  <p className="text-[11px] text-[#94A3B8]">{u.role}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: as_.bg, color: as_.text }}>
                  {u.access}
                </span>
                <button className="rounded p-1.5 hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#0B2349] transition-colors">
                  <Icon name="edit" className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={confirmFirm}
        onClose={() => setConfirmFirm(false)}
        onConfirm={() => { setSavedFirm(true); setConfirmFirm(false); }}
        title="Save firm information?"
        message="This will update the firm's details across the dashboard."
        confirmLabel="Save Changes"
        variant="primary"
      />
      <ConfirmDialog
        isOpen={confirmPref}
        onClose={() => setConfirmPref(false)}
        onConfirm={() => { setSavedPref(true); setConfirmPref(false); }}
        title="Save preferences?"
        message="Dashboard display preferences will be updated for all users."
        confirmLabel="Save Changes"
        variant="primary"
      />
    </div>
  );
}
