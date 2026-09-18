"use client";

import { useState, useRef } from "react";
import { Icon } from "@/components/Icons";
import { Modal, FormField, ModalFooter, inputCls } from "@/components/Modal";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ── constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ["Legal", "HR", "Tech", "Compliance", "Other"] as const;
type Category = typeof CATEGORIES[number];

const CAT_STYLE: Record<Category, { bg: string; text: string }> = {
  Legal:      { bg: "#EFF4FF",  text: "#1d4ed8" },
  HR:         { bg: "#F5F3FF",  text: "#7C3AED" },
  Tech:       { bg: "#ECFDF5",  text: "#059669" },
  Compliance: { bg: "#FFFBEB",  text: "#D97706" },
  Other:      { bg: "#F1F5F9",  text: "#64748B" },
};

const ENROLLMENT_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Not Started": { bg: "#F1F5F9", text: "#64748B" },
  "In Progress": { bg: "#EFF4FF", text: "#1d4ed8" },
  Completed:     { bg: "#ECFDF5", text: "#059669" },
};

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner",
  partner:          "Partner",
  associate:        "Associate",
  paralegal:        "Paralegal",
  admin:            "Admin",
  hr_officer:       "HR Officer",
};

const ALL_ROLES = Object.keys(ROLE_LABELS);

// ── types ─────────────────────────────────────────────────────────────────────

type CourseItem = {
  id: string;
  title: string;
  kind: "link" | "video_file" | "document_file";
  url?: string;
  storageId?: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
};

type QuizState = {
  passMarkPercent: number;
  questions: QuizQuestion[];
};

type Course = {
  _id: Id<"trainingCourses">;
  title: string;
  provider: string;
  category: Category;
  durationHours: number;
  description?: string;
  targetRoles?: string[];
  dueDate?: string;
  status: "Active" | "Archived";
  items?: CourseItem[];
  quiz?: { passMarkPercent: number; questions: QuizQuestion[] };
};

type Enrollment = {
  _id: Id<"trainingEnrollments">;
  courseId: Id<"trainingCourses">;
  employeeId: Id<"users">;
  employeeName: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed";
  enrolledDate: string;
  completedDate?: string;
  assignedById?: Id<"users">;
  courseTitle: string;
};

type Employee = {
  _id: Id<"users">;
  name?: string;
  email?: string;
  role?: string;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyForm() {
  return {
    title:         "",
    provider:      "",
    category:      "Legal" as Category,
    durationHours: "",
    description:   "",
    dueDate:       "",
    targetRoles:   [] as string[],
    items:         [] as CourseItem[],
    quiz:          null as QuizState | null,
  };
}

function emptyQuestion(): QuizQuestion {
  const optA = uid();
  const optB = uid();
  return {
    id: uid(),
    prompt: "",
    options: [
      { id: optA, label: "" },
      { id: optB, label: "" },
    ],
    correctOptionId: optA,
  };
}

// ── CourseDrawer — enrollment list + assign ───────────────────────────────────

function CourseDrawer({
  course,
  enrollments,
  employees,
  onClose,
}: {
  course: Course;
  enrollments: Enrollment[];
  employees: Employee[];
  onClose: () => void;
}) {
  const assignFn = useMutation(api.training.assignCourse);
  const [showAssign, setShowAssign]  = useState(false);
  const [selected, setSelected]      = useState<Set<string>>(new Set());
  const [assigning, setAssigning]    = useState(false);

  const mine = enrollments.filter((e) => e.courseId === course._id);
  const enrolledIds = new Set(mine.map((e) => e.employeeId));
  const notEnrolled = employees.filter((e) => !enrolledIds.has(e._id));

  const completed  = mine.filter((e) => e.status === "Completed").length;
  const inProgress = mine.filter((e) => e.status === "In Progress").length;

  async function handleAssign() {
    if (selected.size === 0) return;
    setAssigning(true);
    try {
      await assignFn({
        courseId:    course._id,
        employeeIds: Array.from(selected) as Id<"users">[],
      });
      setSelected(new Set());
      setShowAssign(false);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(11,35,73,0.35)" }} onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white"
        style={{ width: 420, boxShadow: "-8px 0 40px rgba(11,35,73,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]" style={{ background: "#0B2349" }}>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-[14px] truncate">{course.title}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{course.provider} · {course.durationHours}h</p>
          </div>
          <button onClick={onClose} className="ml-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Icon name="x" className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-0 border-b border-[#F1F5F9] flex-shrink-0">
          {[
            { label: "Enrolled",    value: mine.length,  color: "#0B2349" },
            { label: "In Progress", value: inProgress,   color: "#1d4ed8" },
            { label: "Completed",   value: completed,    color: "#059669" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center border-r last:border-0 border-[#F1F5F9]">
              <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[#94A3B8] font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Materials + quiz summary */}
        {(course.items && course.items.length > 0) || course.quiz ? (
          <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center gap-4 flex-shrink-0 bg-[#FAFBFC]">
            {course.items && course.items.length > 0 && (
              <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <Icon name="book-open" className="w-3.5 h-3.5 text-[#94A3B8]" />
                {course.items.length} material{course.items.length !== 1 ? "s" : ""}
              </span>
            )}
            {course.quiz && (
              <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <Icon name="check-circle" className="w-3.5 h-3.5 text-[#94A3B8]" />
                Quiz · {course.quiz.questions.length} question{course.quiz.questions.length !== 1 ? "s" : ""} · {course.quiz.passMarkPercent}% pass mark
              </span>
            )}
          </div>
        ) : null}

        {/* Assign button */}
        <div className="px-5 py-3 border-b border-[#F1F5F9] flex-shrink-0">
          <button
            onClick={() => setShowAssign(true)}
            disabled={notEnrolled.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ background: "#0B2349", color: "white" }}
          >
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
            Assign to Employees ({notEnrolled.length} not enrolled)
          </button>
        </div>

        {/* Enrollment list */}
        <div className="flex-1 overflow-y-auto">
          {mine.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-8">
              <Icon name="users" className="w-8 h-8 text-[#C4C9D4]" />
              <p className="text-[13px] font-medium text-[#64748B]">No enrollments yet</p>
              <p className="text-[11px] text-[#94A3B8]">Assign this course to employees or wait for them to self-enroll.</p>
            </div>
          ) : (
            mine.map((e) => {
              const ss = ENROLLMENT_STATUS_STYLE[e.status];
              return (
                <div key={e._id} className="px-5 py-3.5 border-b border-[#F8FAFC] last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-[13px] font-medium text-[#1e293b]">{e.employeeName}</p>
                      <p className="text-[10px] text-[#94A3B8]">
                        Enrolled {e.enrolledDate}
                        {e.completedDate ? ` · Completed ${e.completedDate}` : ""}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ background: ss.bg, color: ss.text }}>
                      {e.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${e.progress}%`, background: e.status === "Completed" ? "#059669" : "#0B2349" }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#0B2349] w-8 text-right">{e.progress}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(11,35,73,0.55)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F1F5F9]">
              <h3 className="text-[15px] font-bold text-[#0B2349]">Assign Course</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Select employees to enroll in "{course.title}"</p>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-[#F8FAFC]">
              {notEnrolled.length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-[#94A3B8]">All employees are already enrolled.</p>
              ) : (
                notEnrolled.map((emp) => {
                  const checked = selected.has(emp._id);
                  return (
                    <label key={emp._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFBFC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelected((prev) => {
                          const next = new Set(prev);
                          checked ? next.delete(emp._id) : next.add(emp._id);
                          return next;
                        })}
                        className="w-4 h-4 accent-[#0B2349]"
                      />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: "#EFF4FF", color: "#0B2349" }}>
                        {(emp.name ?? emp.email ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1e293b]">{emp.name ?? emp.email}</p>
                        <p className="text-[11px] text-[#94A3B8]">{ROLE_LABELS[emp.role ?? ""] ?? emp.role}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div className="px-5 py-4 border-t border-[#F1F5F9] flex gap-2.5">
              <button onClick={() => setShowAssign(false)} className="flex-1 rounded-xl py-2 text-[13px] font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={selected.size === 0 || assigning}
                className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#0B2349" }}
              >
                {assigning ? "Assigning…" : `Assign (${selected.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HRTrainingPage() {
  const courses            = useQuery(api.training.listAllCourses) ?? [];
  const enrollments        = useQuery(api.training.allEnrollments) ?? [];
  const employees          = (useQuery(api.users.list) ?? []) as Employee[];

  const createCourse       = useMutation(api.training.createCourse);
  const updateCourse       = useMutation(api.training.updateCourse);
  const archiveCourse      = useMutation(api.training.archiveCourse);
  const restoreCourse      = useMutation(api.training.restoreCourse);
  const generateUploadUrl  = useMutation(api.training.generateUploadUrl);

  // ── local state ─────────────────────────────────────────────────────────────
  const [catFilter,      setCatFilter]      = useState("All");
  const [statusFilter,   setStatusFilter]   = useState("Active");
  const [showNew,        setShowNew]        = useState(false);
  const [editTarget,     setEditTarget]     = useState<Course | null>(null);
  const [drawerCourse,   setDrawerCourse]   = useState<Course | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [form,           setForm]           = useState(emptyForm());
  const [activeTab,      setActiveTab]      = useState<"details" | "lessons" | "quiz">("details");

  // link-add sub-form
  const [linkTitle,      setLinkTitle]      = useState("");
  const [linkUrl,        setLinkUrl]        = useState("");
  // file upload state
  const [uploading,      setUploading]      = useState(false);
  const fileInputRef                         = useRef<HTMLInputElement>(null);

  // ── derived ─────────────────────────────────────────────────────────────────
  const activeCourses   = courses.filter((c) => c.status === "Active");
  const totalEnrolled   = enrollments.length;
  const totalCompleted  = enrollments.filter((e) => e.status === "Completed").length;
  const completionRate  = totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
  const overdue         = enrollments.filter((e) => {
    if (e.status === "Completed") return false;
    const course = courses.find((c) => c._id === e.courseId);
    return course?.dueDate && course.dueDate < new Date().toISOString().slice(0, 10);
  }).length;

  const filtered = courses.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (catFilter !== "All" && c.category !== catFilter) return false;
    return true;
  });

  function enrollCount(courseId: string) {
    return enrollments.filter((e) => e.courseId === courseId).length;
  }
  function completedCount(courseId: string) {
    return enrollments.filter((e) => e.courseId === courseId && e.status === "Completed").length;
  }

  // ── form helpers ─────────────────────────────────────────────────────────────
  function openNew() {
    setForm(emptyForm());
    setEditTarget(null);
    setActiveTab("details");
    setLinkTitle("");
    setLinkUrl("");
    setShowNew(true);
  }

  function openEdit(c: Course) {
    setForm({
      title:         c.title,
      provider:      c.provider,
      category:      c.category,
      durationHours: String(c.durationHours),
      description:   c.description ?? "",
      dueDate:       c.dueDate ?? "",
      targetRoles:   c.targetRoles ?? [],
      items:         (c.items ?? []) as CourseItem[],
      quiz:          c.quiz
        ? { passMarkPercent: c.quiz.passMarkPercent, questions: c.quiz.questions }
        : null,
    });
    setEditTarget(c);
    setActiveTab("details");
    setLinkTitle("");
    setLinkUrl("");
    setShowNew(true);
  }

  // ── lessons helpers ──────────────────────────────────────────────────────────
  function addLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    setForm((f) => ({
      ...f,
      items: [...f.items, { id: uid(), title: linkTitle.trim(), kind: "link", url }],
    }));
    setLinkTitle("");
    setLinkUrl("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      const isVideo = file.type.startsWith("video/");
      setForm((f) => ({
        ...f,
        items: [
          ...f.items,
          {
            id: uid(),
            title: file.name.replace(/\.[^.]+$/, ""),
            kind: isVideo ? "video_file" : "document_file",
            storageId,
          },
        ],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeItem(id: string) {
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));
  }

  // ── quiz helpers ─────────────────────────────────────────────────────────────
  function enableQuiz() {
    setForm((f) => ({
      ...f,
      quiz: { passMarkPercent: 70, questions: [emptyQuestion()] },
    }));
  }

  function disableQuiz() {
    setForm((f) => ({ ...f, quiz: null }));
  }

  function addQuestion() {
    setForm((f) => ({
      ...f,
      quiz: f.quiz ? { ...f.quiz, questions: [...f.quiz.questions, emptyQuestion()] } : f.quiz,
    }));
  }

  function removeQuestion(qId: string) {
    setForm((f) => ({
      ...f,
      quiz: f.quiz
        ? { ...f.quiz, questions: f.quiz.questions.filter((q) => q.id !== qId) }
        : null,
    }));
  }

  function updateQuestion(qId: string, patch: Partial<QuizQuestion>) {
    setForm((f) => ({
      ...f,
      quiz: f.quiz
        ? {
            ...f.quiz,
            questions: f.quiz.questions.map((q) => q.id === qId ? { ...q, ...patch } : q),
          }
        : null,
    }));
  }

  function addOption(qId: string) {
    const newId = uid();
    setForm((f) => ({
      ...f,
      quiz: f.quiz
        ? {
            ...f.quiz,
            questions: f.quiz.questions.map((q) =>
              q.id === qId
                ? { ...q, options: [...q.options, { id: newId, label: "" }] }
                : q
            ),
          }
        : null,
    }));
  }

  function removeOption(qId: string, optId: string) {
    setForm((f) => ({
      ...f,
      quiz: f.quiz
        ? {
            ...f.quiz,
            questions: f.quiz.questions.map((q) => {
              if (q.id !== qId) return q;
              const opts = q.options.filter((o) => o.id !== optId);
              return {
                ...q,
                options: opts,
                correctOptionId:
                  q.correctOptionId === optId ? (opts[0]?.id ?? "") : q.correctOptionId,
              };
            }),
          }
        : null,
    }));
  }

  function updateOption(qId: string, optId: string, label: string) {
    setForm((f) => ({
      ...f,
      quiz: f.quiz
        ? {
            ...f.quiz,
            questions: f.quiz.questions.map((q) =>
              q.id === qId
                ? { ...q, options: q.options.map((o) => o.id === optId ? { ...o, label } : o) }
                : q
            ),
          }
        : null,
    }));
  }

  // ── save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.title || !form.provider || !form.durationHours) return;
    setSaving(true);
    try {
      const payload: Parameters<typeof createCourse>[0] = {
        title:         form.title,
        provider:      form.provider,
        category:      form.category,
        durationHours: parseFloat(form.durationHours),
        description:   form.description || undefined,
        dueDate:       form.dueDate || undefined,
        targetRoles:   form.targetRoles.length > 0 ? form.targetRoles : undefined,
        items:         form.items.length > 0 ? form.items : undefined,
        quiz:          form.quiz
          ? {
              passMarkPercent: form.quiz.passMarkPercent,
              questions: form.quiz.questions.filter(
                (q) => q.prompt.trim() && q.options.length >= 2 && q.options.every((o) => o.label.trim())
              ),
            }
          : undefined,
      };
      if (editTarget) {
        await updateCourse({ id: editTarget._id, ...payload });
      } else {
        await createCourse(payload);
      }
      setShowNew(false);
    } finally {
      setSaving(false);
    }
  }

  function toggleRole(r: string) {
    setForm((f) => ({
      ...f,
      targetRoles: f.targetRoles.includes(r)
        ? f.targetRoles.filter((x) => x !== r)
        : [...f.targetRoles, r],
    }));
  }

  const ITEM_ICON: Record<string, "link" | "book-open" | "clock"> = {
    link:          "link",
    video_file:    "clock",
    document_file: "book-open",
  };
  const ITEM_KIND_LABEL: Record<string, string> = {
    link:          "Link",
    video_file:    "Video",
    document_file: "Document",
  };

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B2349]">Training Management</h2>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Configure courses, track completion across the firm</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#0B2349" }}
        >
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Add Course
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Courses",    value: String(activeCourses.length), icon: "book-open" as const,   color: "#0B2349", bg: "#EFF4FF" },
          { label: "Total Enrollments", value: String(totalEnrolled),        icon: "users" as const,        color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Completion Rate",   value: `${completionRate}%`,         icon: "check-circle" as const, color: "#059669", bg: "#ECFDF5" },
          { label: "Overdue",           value: String(overdue),              icon: "clock" as const,        color: overdue > 0 ? "#DC2626" : "#64748B", bg: overdue > 0 ? "#FFF5F5" : "#F1F5F9" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{k.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <Icon name={k.icon} className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-[22px] font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {["Active", "Archived", "All"].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={statusFilter === f ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
              {f}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[#E2E8F0]" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
              style={catFilter === c ? { background: "#0B2349", color: "white" } : { background: "white", color: "#64748B", border: "1px solid #E2E8F0" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 flex flex-col items-center gap-3 text-center" style={{ border: "1px solid #F1F5F9" }}>
          <Icon name="book-open" className="w-10 h-10 text-[#C4C9D4]" />
          <p className="text-[14px] font-semibold text-[#64748B]">No courses found</p>
          <p className="text-[12px] text-[#94A3B8]">Add your first course with the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const cs = CAT_STYLE[c.category as Category] ?? CAT_STYLE.Other;
            const enrolled  = enrollCount(c._id);
            const done      = completedCount(c._id);
            const pct       = enrolled ? Math.round((done / enrolled) * 100) : 0;
            const isOverdue = c.dueDate && c.dueDate < new Date().toISOString().slice(0, 10) && c.status === "Active";
            const itemCount = (c as Course).items?.length ?? 0;
            const hasQuiz   = !!(c as Course).quiz;
            return (
              <div
                key={c._id}
                className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", opacity: c.status === "Archived" ? 0.65 : 1 }}
                onClick={() => setDrawerCourse(c as Course)}
              >
                {/* Card header */}
                <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold rounded-md px-2 py-0.5" style={{ background: cs.bg, color: cs.text }}>
                        {c.category}
                      </span>
                      {c.status === "Archived" && (
                        <span className="text-[11px] font-semibold rounded-md px-2 py-0.5 bg-[#F1F5F9] text-[#64748B]">Archived</span>
                      )}
                      {isOverdue && (
                        <span className="text-[11px] font-semibold rounded-md px-2 py-0.5 bg-[#FFF5F5] text-[#DC2626]">Overdue</span>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-[#0B2349] mt-1.5 leading-snug">{c.title}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{c.provider} · {c.durationHours}h</p>
                  </div>
                </div>

                {/* Materials + quiz badges */}
                {(itemCount > 0 || hasQuiz) && (
                  <div className="px-4 pt-2 flex items-center gap-2 flex-wrap">
                    {itemCount > 0 && (
                      <span className="text-[10px] font-medium rounded-md px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] flex items-center gap-1">
                        <Icon name="book-open" className="w-3 h-3" />{itemCount} material{itemCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {hasQuiz && (
                      <span className="text-[10px] font-medium rounded-md px-2 py-0.5 bg-[#FFFBEB] text-[#D97706] flex items-center gap-1">
                        <Icon name="check-circle" className="w-3 h-3" />Quiz included
                      </span>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#94A3B8]">{done}/{enrolled} completed</span>
                    <span className="text-[11px] font-bold text-[#0B2349]">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#059669" }} />
                  </div>
                  {c.dueDate && (
                    <p className="text-[10px] text-[#94A3B8] mt-1.5">Due {c.dueDate}</p>
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-4 py-2.5 border-t border-[#F8FAFC] flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(c as Course); }}
                    className="text-[12px] font-medium text-[#64748B] hover:text-[#0B2349] transition-colors flex items-center gap-1"
                  >
                    <Icon name="settings" className="w-3.5 h-3.5" /> Edit
                  </button>
                  {c.status === "Active" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveCourse({ id: c._id }); }}
                      className="text-[12px] font-medium text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); restoreCourse({ id: c._id }); }}
                      className="text-[12px] font-medium text-[#94A3B8] hover:text-[#059669] transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course modal */}
      <Modal
        isOpen={showNew}
        onClose={() => setShowNew(false)}
        title={editTarget ? "Edit Course" : "Add Course"}
      >
        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#F1F5F9] mb-4 -mx-0">
          {(["details", "lessons", "quiz"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-[12px] font-semibold capitalize transition-colors border-b-2 -mb-px"
              style={activeTab === tab
                ? { borderColor: "#0B2349", color: "#0B2349" }
                : { borderColor: "transparent", color: "#94A3B8" }}
            >
              {tab}
              {tab === "lessons" && form.items.length > 0 && (
                <span className="ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-bold" style={{ background: "#EFF4FF", color: "#1d4ed8" }}>
                  {form.items.length}
                </span>
              )}
              {tab === "quiz" && form.quiz && (
                <span className="ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-bold" style={{ background: "#FFFBEB", color: "#D97706" }}>
                  {form.quiz.questions.length}Q
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Details tab ─────────────────────────────────────────────────── */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Title" required>
                <input className={inputCls} placeholder="e.g. Employment Law Updates 2026"
                  value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </FormField>
              <FormField label="Provider" required>
                <input className={inputCls} placeholder="e.g. Ghana Bar Association"
                  value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} />
              </FormField>
              <FormField label="Category" required>
                <select className={inputCls} value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Duration (hours)" required>
                <input type="number" step="0.5" min="0.5" className={inputCls} placeholder="e.g. 8"
                  value={form.durationHours} onChange={(e) => setForm((f) => ({ ...f, durationHours: e.target.value }))} />
              </FormField>
              <FormField label="Due Date">
                <input type="date" className={inputCls} value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea className={inputCls} rows={2} placeholder="Optional description or learning objectives…"
                value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>

            <FormField label="Target Roles">
              <p className="text-[11px] text-[#94A3B8] mb-2">Leave blank to make available to all roles.</p>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((r) => {
                  const active = form.targetRoles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRole(r)}
                      className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
                      style={active ? { background: "#0B2349", color: "white" } : { background: "#F1F5F9", color: "#64748B" }}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel={saving ? "Saving…" : editTarget ? "Save Changes" : "Add Course"}
              onConfirm={handleSave}
            />
          </div>
        )}

        {/* ── Lessons tab ─────────────────────────────────────────────────── */}
        {activeTab === "lessons" && (
          <div className="space-y-4">
            {/* Add link sub-form */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <p className="text-[12px] font-semibold text-[#0B2349]">Add a Link</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#64748B] mb-1">Lesson title</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Introduction Video"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); }}}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#64748B] mb-1">URL</label>
                  <input
                    className={inputCls}
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); }}}
                  />
                </div>
              </div>
              <button
                onClick={addLink}
                disabled={!linkTitle.trim() || !linkUrl.trim()}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ background: "#0B2349", color: "white" }}
              >
                <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} /> Add Link
              </button>
            </div>

            {/* Upload file */}
            <div className="rounded-xl p-4" style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <p className="text-[12px] font-semibold text-[#0B2349] mb-2">Upload File</p>
              <p className="text-[11px] text-[#94A3B8] mb-3">Accepts PDF, DOCX, MP4, and other document or video files.</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.webm,.avi"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-semibold border border-[#E2E8F0] text-[#0B2349] hover:bg-white transition-colors disabled:opacity-50"
              >
                <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
                {uploading ? "Uploading…" : "Choose File"}
              </button>
            </div>

            {/* Item list */}
            {form.items.length === 0 ? (
              <div className="rounded-xl p-6 flex flex-col items-center gap-2 text-center" style={{ border: "1px dashed #E2E8F0" }}>
                <Icon name="book-open" className="w-7 h-7 text-[#C4C9D4]" />
                <p className="text-[12px] text-[#94A3B8]">No materials added yet. Add links or upload files above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide">Course Materials ({form.items.length})</p>
                {form.items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 bg-white" style={{ border: "1px solid #F1F5F9" }}>
                    <span className="text-[10px] font-bold text-[#94A3B8] w-5 text-center">{idx + 1}</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F1F5F9" }}>
                      <Icon name={ITEM_ICON[item.kind]} className="w-3.5 h-3.5 text-[#64748B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1e293b] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#94A3B8]">{ITEM_KIND_LABEL[item.kind]}{item.url ? ` · ${item.url.slice(0, 40)}…` : ""}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded hover:bg-[#FFF5F5] transition-colors flex-shrink-0"
                    >
                      <Icon name="x" className="w-3.5 h-3.5 text-[#DC2626]" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel={saving ? "Saving…" : editTarget ? "Save Changes" : "Add Course"}
              onConfirm={handleSave}
            />
          </div>
        )}

        {/* ── Quiz tab ─────────────────────────────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="space-y-4">
            {!form.quiz ? (
              <div className="rounded-xl p-8 flex flex-col items-center gap-3 text-center" style={{ border: "1px dashed #E2E8F0" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                  <Icon name="check-circle" className="w-5 h-5" style={{ color: "#D97706" }} />
                </div>
                <p className="text-[13px] font-semibold text-[#1e293b]">No quiz yet</p>
                <p className="text-[11px] text-[#94A3B8]">Add a multiple-choice quiz that employees must pass to complete this course.</p>
                <button
                  onClick={enableQuiz}
                  className="rounded-xl px-4 py-2 text-[12px] font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: "#0B2349", color: "white" }}
                >
                  Add Quiz
                </button>
              </div>
            ) : (
              <>
                {/* Pass mark */}
                <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <div>
                    <p className="text-[12px] font-semibold text-[#92400E]">Pass mark</p>
                    <p className="text-[11px] text-[#B45309] mt-0.5">Employees must score at least this percentage to pass.</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      step={5}
                      value={form.quiz.passMarkPercent}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quiz: f.quiz ? { ...f.quiz, passMarkPercent: Math.min(100, Math.max(10, Number(e.target.value))) } : null }))
                      }
                      className="w-16 rounded-lg text-center text-[14px] font-bold border border-[#FDE68A] py-1.5 outline-none focus:border-[#D97706]"
                      style={{ background: "white" }}
                    />
                    <span className="text-[13px] font-bold text-[#92400E]">%</span>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {form.quiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                      {/* Question header */}
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F1F5F9]" style={{ background: "#F8FAFC" }}>
                        <span className="text-[11px] font-bold text-[#0B2349] w-5">Q{qIdx + 1}</span>
                        <input
                          className="flex-1 bg-transparent text-[13px] font-medium text-[#1e293b] placeholder-[#C4C9D4] outline-none"
                          placeholder="Type your question here…"
                          value={q.prompt}
                          onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                        />
                        {form.quiz.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="p-1 rounded hover:bg-[#FFF5F5] transition-colors flex-shrink-0"
                          >
                            <Icon name="x" className="w-3.5 h-3.5 text-[#DC2626]" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                      {/* Options */}
                      <div className="px-4 py-3 space-y-2.5">
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.id} className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctOptionId === opt.id}
                              onChange={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                              className="w-4 h-4 accent-[#059669] flex-shrink-0 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <span className="text-[10px] font-bold text-[#94A3B8] w-4">{String.fromCharCode(65 + oIdx)}</span>
                            <input
                              className="flex-1 rounded-lg px-3 py-1.5 text-[12px] border border-[#E2E8F0] bg-white outline-none focus:border-[#0B2349] placeholder-[#C4C9D4]"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              value={opt.label}
                              onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                              style={q.correctOptionId === opt.id ? { borderColor: "#059669", background: "#ECFDF5" } : {}}
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(q.id, opt.id)}
                                className="p-1 rounded hover:bg-[#FFF5F5] transition-colors flex-shrink-0"
                              >
                                <Icon name="x" className="w-3 h-3 text-[#DC2626]" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        ))}
                        <p className="text-[10px] text-[#94A3B8] pl-6">Select the radio button next to the correct answer.</p>
                        {q.options.length < 5 && (
                          <button
                            onClick={() => addOption(q.id)}
                            className="ml-6 text-[11px] font-medium text-[#0B2349] hover:underline flex items-center gap-1"
                          >
                            <Icon name="plus" className="w-3 h-3" strokeWidth={2.5} /> Add option
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add question + remove quiz */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={addQuestion}
                    className="flex-1 rounded-xl py-2 text-[12px] font-semibold border border-dashed border-[#0B2349] text-[#0B2349] hover:bg-[#EFF4FF] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} /> Add Question
                  </button>
                  <button
                    onClick={disableQuiz}
                    className="px-3 py-2 rounded-xl text-[12px] font-medium text-[#DC2626] border border-[#FEE2E2] hover:bg-[#FFF5F5] transition-colors"
                  >
                    Remove Quiz
                  </button>
                </div>
              </>
            )}

            <ModalFooter
              onClose={() => setShowNew(false)}
              confirmLabel={saving ? "Saving…" : editTarget ? "Save Changes" : "Add Course"}
              onConfirm={handleSave}
            />
          </div>
        )}
      </Modal>

      {/* Course drawer */}
      {drawerCourse && (
        <CourseDrawer
          course={drawerCourse}
          enrollments={enrollments as Enrollment[]}
          employees={employees}
          onClose={() => setDrawerCourse(null)}
        />
      )}
    </div>
  );
}
