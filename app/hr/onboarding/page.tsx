"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import { Modal, ConfirmDialog, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const STAGES = ["All", "Pre-arrival", "Week 1", "Month 1", "Completed"];

const STAGE_STYLE: Record<string, { bg: string; text: string }> = {
  "Pre-arrival": { bg: "#EFF4FF", text: "#1d4ed8" },
  "Week 1":      { bg: "#FFFBEB", text: "#D97706" },
  "Month 1":     { bg: "#F5F3FF", text: "#7C3AED" },
  "Completed":   { bg: "#ECFDF5", text: "#059669" },
};

type DetailTab = "checklist" | "profile" | "documents";

export default function OnboardingPage() {
  // ── queries & mutations ───────────────────────────────────────────────────
  const onboardees       = useQuery(api.onboardees.list) ?? [];
  const createHire       = useMutation(api.onboardees.create);
  const toggleTask       = useMutation(api.onboardees.toggleTask);
  const markComplete     = useMutation(api.onboardees.markComplete);
  const updateProfileFn  = useMutation(api.onboardees.updateProfile);
  const genUploadUrl     = useMutation(api.onboardees.generateUploadUrl);
  const saveDocFn        = useMutation(api.onboardees.saveDocument);
  const addExtraFileFn   = useMutation(api.onboardees.addExtraFile);
  const removeExtraFileFn = useMutation(api.onboardees.removeExtraFile);
  const completeOnboarding = useMutation(api.onboardees.completeOnboarding);

  // ── detail modal state ────────────────────────────────────────────────────
  const [selectedId,      setSelectedId]      = useState<Id<"onboardees"> | null>(null);
  const [detailTab,       setDetailTab]       = useState<DetailTab>("checklist");
  const [togglingIndex,   setTogglingIndex]   = useState<number | null>(null);
  const [profileForm,     setProfileForm]     = useState({ personalEmail: "", personalPhone: "", address: "", emergencyContact: "" });
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [profileSaved,    setProfileSaved]    = useState(false);
  const [uploadingPic,    setUploadingPic]    = useState(false);
  const [uploadingCv,     setUploadingCv]     = useState(false);
  const [uploadingExtra,  setUploadingExtra]  = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [completing,      setCompleting]      = useState(false);
  const [confirmAddEmp,   setConfirmAddEmp]   = useState(false);
  const [addingEmp,       setAddingEmp]       = useState(false);

  // ── add new hire modal state ──────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [added,   setAdded]   = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [addForm, setAddForm] = useState({ name: "", role: "", dept: "", startDate: "", buddy: "" });

  // ── Filters ───────────────────────────────────────────────────────────────
  const [stageFilter,  setStageFilter]  = useState("All");
  const [nameSearch,   setNameSearch]   = useState("");
  const [startFrom,    setStartFrom]    = useState("");
  const [startTo,      setStartTo]      = useState("");

  const hasExtraFilters = nameSearch || startFrom || startTo;

  function resetFilters() {
    setStageFilter("All");
    setNameSearch("");
    setStartFrom("");
    setStartTo("");
  }

  // ── Filtering logic ────────────────────────────────────────────────────────
  const filtered = onboardees.filter((o) => {
    if (stageFilter !== "All" && o.stage !== stageFilter) return false;
    if (nameSearch && !o.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (startFrom && o.startDate < startFrom) return false;
    if (startTo && o.startDate > startTo) return false;
    return true;
  });

  // ── derived ───────────────────────────────────────────────────────────────
  const liveSelected  = selectedId ? (onboardees.find((o) => o._id === selectedId) ?? null) : null;
  const liveDetails   = useQuery(api.onboardees.getWithUrls, selectedId ? { id: selectedId } : "skip");
  const totalActive   = onboardees.filter((o) => o.stage !== "Completed").length;
  const completedCount = onboardees.filter((o) => o.stage === "Completed").length;
  const preArrival    = onboardees.filter((o) => o.stage === "Pre-arrival").length;
  const avgProgress   = onboardees.length > 0
    ? Math.round(onboardees.reduce((a, o) => a + o.progress, 0) / onboardees.length)
    : 0;

  // ── file input refs ───────────────────────────────────────────────────────
  const picInputRef   = useRef<HTMLInputElement>(null);
  const cvInputRef    = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  // ── handlers ──────────────────────────────────────────────────────────────

  function openDetail(o: typeof onboardees[number]) {
    setSelectedId(o._id as Id<"onboardees">);
    setDetailTab("checklist");
    setProfileForm({
      personalEmail:    (o as any).personalEmail    ?? "",
      personalPhone:    (o as any).personalPhone    ?? "",
      address:          (o as any).address          ?? "",
      emergencyContact: (o as any).emergencyContact ?? "",
    });
    setProfileSaved(false);
  }

  async function handleToggle(taskIndex: number) {
    if (!selectedId) return;
    setTogglingIndex(taskIndex);
    try { await toggleTask({ id: selectedId, taskIndex }); }
    finally { setTogglingIndex(null); }
  }

  async function handleMarkComplete() {
    if (!selectedId) return;
    setCompleting(true);
    try {
      await markComplete({ id: selectedId });
      setConfirmComplete(false);
    } finally { setCompleting(false); }
  }

  async function handleSaveProfile() {
    if (!selectedId) return;
    setSavingProfile(true);
    try {
      await updateProfileFn({ id: selectedId, ...profileForm });
      setProfileSaved(true);
    } finally { setSavingProfile(false); }
  }

  async function doUpload(file: File, field: "profilePictureStorageId" | "cvStorageId", setUploading: (v: boolean) => void) {
    if (!selectedId) return;
    setUploading(true);
    try {
      const postUrl = await genUploadUrl({});
      const res = await fetch(postUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await saveDocFn({ id: selectedId, field, storageId });
    } finally { setUploading(false); }
  }

  async function doUploadExtra(file: File) {
    if (!selectedId) return;
    setUploadingExtra(true);
    try {
      const postUrl = await genUploadUrl({});
      const res = await fetch(postUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await addExtraFileFn({ id: selectedId, name: file.name, storageId });
    } finally { setUploadingExtra(false); }
  }

  async function handleAddToEmployees() {
    if (!selectedId) return;
    setAddingEmp(true);
    try {
      await completeOnboarding({ id: selectedId });
      setConfirmAddEmp(false);
      setSelectedId(null);
    } finally { setAddingEmp(false); }
  }

  async function handleAdd() {
    if (!addForm.name || !addForm.role || !addForm.dept || !addForm.startDate) return;
    setAdding(true);
    try {
      await createHire({ name: addForm.name, role: addForm.role, dept: addForm.dept, startDate: addForm.startDate, buddy: addForm.buddy || undefined });
      setAdded(true);
    } finally { setAdding(false); }
  }

  const alreadyLinked = !!(liveSelected as any)?.linkedUserId;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Onboarding</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Track new hire onboarding progress</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAdded(false); setAddForm({ name: "", role: "", dept: "", startDate: "", buddy: "" }); }}
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
          { label: "Active Onboarding", value: String(totalActive),    icon: "users" as const,        color: "#0B2349", bg: "#EFF4FF" },
          { label: "Pre-arrival",        value: String(preArrival),     icon: "clock" as const,        color: "#1d4ed8", bg: "#EFF4FF" },
          { label: "Completed",          value: String(completedCount), icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Avg Progress",       value: `${avgProgress}%`,      icon: "bar-chart" as const,    color: "#7C3AED", bg: "#F5F3FF" },
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

      {/* Stage filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStageFilter(s)}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={stageFilter === s ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Advanced filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Name search */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-white border border-[#E2E8F0] w-52">
          <Icon name="search" className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name…"
            className="flex-1 bg-transparent text-[12px] text-[#1e293b] placeholder-[#94A3B8] outline-none min-w-0"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          {nameSearch && (
            <button onClick={() => setNameSearch("")}>
              <Icon name="x" className="w-3 h-3 text-[#94A3B8]" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Start date from */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">Start date from</span>
          <input
            type="date"
            value={startFrom}
            onChange={(e) => setStartFrom(e.target.value)}
            className={inputCls + " w-32"}
          />
        </div>

        {/* Start date to */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#94A3B8] font-medium">to</span>
          <input
            type="date"
            value={startTo}
            min={startFrom || undefined}
            onChange={(e) => setStartTo(e.target.value)}
            className={inputCls + " w-32"}
          />
        </div>

        {/* Clear all */}
        {hasExtraFilters && (
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
            style={{ color: "#64748B" }}>
            <Icon name="x" className="w-3 h-3" strokeWidth={2.5} /> Clear filters
          </button>
        )}

        {/* Result count */}
        {(hasExtraFilters || stageFilter !== "All") && (
          <span className="text-[11px] text-[#94A3B8] ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((o) => {
          const ss   = STAGE_STYLE[o.stage];
          const done = o.checklist.filter((c) => c.done).length;
          return (
            <div key={o._id} onClick={() => openDetail(o)}
              className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
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
                <span className="text-[11px] text-[#94A3B8]">Buddy: <span className="text-[#64748B] font-medium">{o.buddy ?? "—"}</span></span>
                <span className="text-[11px] font-semibold" style={{ color: "#0B2349" }}>{o.progress}%</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-[12px] text-[#94A3B8]">No onboardees match the current filters.</div>
        )}
      </div>

      {/* ── Detail modal ────────────────────────────────────────────────────── */}
      <Modal isOpen={!!liveSelected} onClose={() => setSelectedId(null)}
        title={liveSelected ? `${liveSelected.name} — Onboarding` : ""} maxWidth="620px">
        {liveSelected && (
          <div className="flex flex-col gap-4">

            {/* Sub-header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 overflow-hidden" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                {liveDetails?.profilePictureUrl
                  ? <img src={liveDetails.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  : liveSelected.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1e293b]">{liveSelected.name}</p>
                <p className="text-[12px] text-[#64748B]">{liveSelected.role} · {liveSelected.dept}</p>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0" style={{ background: STAGE_STYLE[liveSelected.stage].bg, color: STAGE_STYLE[liveSelected.stage].text }}>
                {liveSelected.stage}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "#F1F5F9" }}>
              {(["checklist", "profile", "documents"] as DetailTab[]).map((t) => (
                <button key={t} onClick={() => setDetailTab(t)}
                  className="flex-1 rounded-md py-1.5 text-[12px] font-medium capitalize transition-colors"
                  style={detailTab === t ? { background: "white", color: "#0B2349", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "#64748B" }}>
                  {t === "checklist" ? "Checklist" : t === "profile" ? "Profile" : "Documents"}
                </button>
              ))}
            </div>

            {/* ── Checklist tab ─────────────────────────────────────────────── */}
            {detailTab === "checklist" && (
              <div className="space-y-4">
                {["Pre-arrival", "Week 1", "Month 1"].map((cat) => (
                  <div key={cat}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">{cat}</p>
                    <div className="space-y-1.5">
                      {liveSelected.checklist.map((c, i) => {
                        if (c.category !== cat) return null;
                        const isToggling = togglingIndex === i;
                        return (
                          <button key={i} onClick={() => handleToggle(i)} disabled={isToggling}
                            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:opacity-80"
                            style={{ background: c.done ? "#ECFDF5" : "#F8FAFC" }}>
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: c.done ? "#059669" : "#E2E8F0" }}>
                              {c.done && <Icon name="check" className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                              {isToggling && <span className="w-2 h-2 rounded-full border border-current animate-spin" />}
                            </div>
                            <span className="text-[12px]" style={{ color: c.done ? "#059669" : "#64748B" }}>{c.task}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {liveSelected.stage !== "Completed" && (
                  <button onClick={() => setConfirmComplete(true)}
                    className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#64748B" }}>
                    Mark All Tasks Complete
                  </button>
                )}
              </div>
            )}

            {/* ── Profile tab ───────────────────────────────────────────────── */}
            {detailTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Personal Email">
                    <input type="email" className={inputCls} placeholder="personal@email.com"
                      value={profileForm.personalEmail}
                      onChange={(e) => { setProfileForm((f) => ({ ...f, personalEmail: e.target.value })); setProfileSaved(false); }} />
                  </FormField>
                  <FormField label="Personal Phone">
                    <input type="tel" className={inputCls} placeholder="+233 XX XXX XXXX"
                      value={profileForm.personalPhone}
                      onChange={(e) => { setProfileForm((f) => ({ ...f, personalPhone: e.target.value })); setProfileSaved(false); }} />
                  </FormField>
                </div>
                <FormField label="Home Address">
                  <input className={inputCls} placeholder="Full home address"
                    value={profileForm.address}
                    onChange={(e) => { setProfileForm((f) => ({ ...f, address: e.target.value })); setProfileSaved(false); }} />
                </FormField>
                <FormField label="Emergency Contact">
                  <input className={inputCls} placeholder="Name · Relationship · Phone"
                    value={profileForm.emergencyContact}
                    onChange={(e) => { setProfileForm((f) => ({ ...f, emergencyContact: e.target.value })); setProfileSaved(false); }} />
                </FormField>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: "#0B2349" }}>
                    {savingProfile ? "Saving…" : "Save Profile"}
                  </button>
                  {profileSaved && (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#059669" }}>
                      <Icon name="check-circle" className="w-4 h-4" /> Saved
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Documents tab ─────────────────────────────────────────────── */}
            {detailTab === "documents" && (
              <div className="space-y-5">
                {/* Profile picture */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">Profile Picture</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: "#EFF4FF", color: "#0B2349" }}>
                      {liveDetails?.profilePictureUrl
                        ? <img src={liveDetails.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                        : <Icon name="user" className="w-7 h-7" />}
                    </div>
                    <div>
                      <button onClick={() => picInputRef.current?.click()} disabled={uploadingPic}
                        className="rounded-lg px-3 py-1.5 text-[12px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors disabled:opacity-60"
                        style={{ color: "#0B2349" }}>
                        {uploadingPic ? "Uploading…" : liveDetails?.profilePictureUrl ? "Replace Photo" : "Upload Photo"}
                      </button>
                      <input ref={picInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f, "profilePictureStorageId", setUploadingPic); e.target.value = ""; }} />
                      {liveDetails?.profilePictureUrl && (
                        <a href={liveDetails.profilePictureUrl} target="_blank" rel="noopener noreferrer"
                          className="ml-2 text-[12px] underline" style={{ color: "#64748B" }}>View</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* CV */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-2">CV / Resume</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <Icon name="file-text" className="w-4 h-4 flex-shrink-0" style={{ color: liveDetails?.cvUrl ? "#0B2349" : "#CBD5E1" }} />
                      {liveDetails?.cvUrl
                        ? <a href={liveDetails.cvUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium underline" style={{ color: "#0B2349" }}>View CV</a>
                        : <span className="text-[12px] text-[#94A3B8]">No CV uploaded</span>}
                    </div>
                    <button onClick={() => cvInputRef.current?.click()} disabled={uploadingCv}
                      className="rounded-lg px-3 py-2 text-[12px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors disabled:opacity-60 shrink-0"
                      style={{ color: "#0B2349" }}>
                      {uploadingCv ? "Uploading…" : liveDetails?.cvUrl ? "Replace" : "Upload CV"}
                    </button>
                    <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f, "cvStorageId", setUploadingCv); e.target.value = ""; }} />
                  </div>
                </div>

                {/* Extra files */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Additional Files</p>
                    <button onClick={() => extraInputRef.current?.click()} disabled={uploadingExtra}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors disabled:opacity-60"
                      style={{ color: "#0B2349" }}>
                      <Icon name="plus" className="w-3 h-3" strokeWidth={2.5} />
                      {uploadingExtra ? "Uploading…" : "Add File"}
                    </button>
                    <input ref={extraInputRef} type="file" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) doUploadExtra(f); e.target.value = ""; }} />
                  </div>
                  <div className="space-y-1.5">
                    {(liveDetails?.extraFiles ?? []).length === 0 && (
                      <p className="text-[12px] text-[#94A3B8] text-center py-4 rounded-lg" style={{ background: "#F8FAFC" }}>No additional files.</p>
                    )}
                    {(liveDetails?.extraFiles ?? []).map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <Icon name="paper-clip" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#64748B" }} />
                        {f.url
                          ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-[12px] font-medium underline truncate" style={{ color: "#0B2349" }}>{f.name}</a>
                          : <span className="flex-1 text-[12px] text-[#64748B] truncate">{f.name}</span>}
                        <button onClick={() => removeExtraFileFn({ id: selectedId!, index: i })}
                          className="p-1 rounded hover:bg-[#FFF5F5] transition-colors" title="Remove">
                          <Icon name="x" className="w-3 h-3" style={{ color: "#DC2626" }} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer: Add to Employees */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              {alreadyLinked ? (
                <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "#059669" }}>
                  <Icon name="check-circle" className="w-4 h-4" /> Added to Employees
                </div>
              ) : (
                <button onClick={() => setConfirmAddEmp(true)}
                  className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: "#0B2349" }}>
                  Add to Employees List
                </button>
              )}
            </div>

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
            <p className="text-[13px] text-[#94A3B8] mt-1">Onboarding checklist has been created. Open their card to fill in their profile and documents.</p>
            <button className="mt-4 rounded-lg px-4 py-2 text-[13px] font-medium text-white" style={{ background: "#0B2349" }} onClick={() => setShowAdd(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Full Name" required>
              <input className={inputCls} placeholder="e.g. Kwame Asante" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role" required>
                <input className={inputCls} placeholder="e.g. Associate" value={addForm.role} onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))} />
              </FormField>
              <FormField label="Department" required>
                <select className={inputCls} value={addForm.dept} onChange={(e) => setAddForm((f) => ({ ...f, dept: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Litigation", "Corporate Law", "Conveyancing", "Family Law", "Human Resources", "IT"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Start Date" required>
                <input type="date" className={inputCls} value={addForm.startDate} onChange={(e) => setAddForm((f) => ({ ...f, startDate: e.target.value }))} />
              </FormField>
              <FormField label="Onboarding Buddy">
                <select className={inputCls} value={addForm.buddy} onChange={(e) => setAddForm((f) => ({ ...f, buddy: e.target.value }))}>
                  <option value="">Select...</option>
                  {["Kofi Owusu", "Ama Darko", "Yaa Bonsu", "Nana Acheampong", "Kojo Frimpong"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </FormField>
            </div>
            <ModalFooter onClose={() => setShowAdd(false)} confirmLabel={adding ? "Adding…" : "Add New Hire"} onConfirm={handleAdd} />
          </div>
        )}
      </Modal>

      {/* Confirm mark all complete */}
      <ConfirmDialog
        isOpen={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={handleMarkComplete}
        title="Mark all tasks complete?"
        message={`Mark all of ${liveSelected?.name}'s checklist tasks as done?`}
        confirmLabel={completing ? "Completing…" : "Mark Complete"}
        variant="success"
      />

      {/* Confirm add to employees */}
      <ConfirmDialog
        isOpen={confirmAddEmp}
        onClose={() => setConfirmAddEmp(false)}
        onConfirm={handleAddToEmployees}
        title="Add to Employees?"
        message={`This will create an employee record for ${liveSelected?.name} using their onboarding profile. Their checklist will be marked complete.`}
        confirmLabel={addingEmp ? "Adding…" : "Add to Employees"}
        variant="success"
      />
    </div>
  );
}
