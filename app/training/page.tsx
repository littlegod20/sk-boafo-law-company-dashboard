"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

type CourseWithExtras = {
  _id: Id<"trainingCourses">;
  title: string;
  provider: string;
  category: string;
  durationHours: number;
  description?: string;
  dueDate?: string;
  status: string;
  items?: CourseItem[];
  quiz?: { passMarkPercent: number; questions: QuizQuestion[] };
};

type EnrollmentWithCourse = {
  _id: Id<"trainingEnrollments">;
  courseId: Id<"trainingCourses">;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed";
  enrolledDate: string;
  completedDate?: string;
  course?: CourseWithExtras | null;
};

// ── style maps ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#EFF4FF", text: "#1d4ed8" },
  Completed:     { bg: "#ECFDF5", text: "#059669" },
  "Not Started": { bg: "#F1F5F9", text: "#64748B" },
};

const CAT_STYLE: Record<string, { bg: string; text: string }> = {
  Legal:      { bg: "#EFF4FF",  text: "#1d4ed8" },
  HR:         { bg: "#F5F3FF",  text: "#7C3AED" },
  Tech:       { bg: "#ECFDF5",  text: "#059669" },
  Compliance: { bg: "#FFFBEB",  text: "#D97706" },
  Other:      { bg: "#F1F5F9",  text: "#64748B" },
};

// ── QuizModal ─────────────────────────────────────────────────────────────────

function QuizModal({
  course,
  enrollmentId,
  onClose,
}: {
  course: CourseWithExtras;
  enrollmentId: Id<"trainingEnrollments">;
  onClose: () => void;
}) {
  const quiz = course.quiz!;
  const submitAttempt = useMutation(api.training.submitQuizAttempt);
  const attempts = useQuery(api.training.myQuizAttempts, { courseId: course._id }) ?? [];
  const bestAttempt = attempts.find((a) => a.passed) ?? attempts[0] ?? null;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult]   = useState<{ scorePercent: number; passed: boolean; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView]       = useState<"quiz" | "result" | "history">("quiz");

  const answered = quiz.questions.filter((q) => answers[q.id]).length;
  const allAnswered = answered === quiz.questions.length;

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const res = await submitAttempt({
        courseId:     course._id,
        enrollmentId,
        answers: quiz.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })),
      });
      setResult(res);
      setView("result");
    } finally {
      setSubmitting(false);
    }
  }

  function retakeQuiz() {
    setAnswers({});
    setResult(null);
    setView("quiz");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(11,35,73,0.55)" }}>
      <div className="bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] flex-shrink-0" style={{ background: "#0B2349" }}>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-[14px] truncate">{course.title}</p>
            <p className="text-white/60 text-[11px] mt-0.5">
              {quiz.questions.length} questions · {quiz.passMarkPercent}% to pass
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {attempts.length > 0 && (
              <button
                onClick={() => setView(view === "history" ? "quiz" : "history")}
                className="text-[11px] font-medium text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                History ({attempts.length})
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
              <Icon name="x" className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── History view ────────────────────────────────────────────────── */}
          {view === "history" && (
            <div className="px-5 py-4 space-y-3">
              <p className="text-[12px] font-semibold text-[#0B2349]">Your Attempts</p>
              {attempts.map((a, i) => (
                <div key={a._id} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: a.passed ? "#ECFDF5" : "#FFF5F5", border: `1px solid ${a.passed ? "#D1FAE5" : "#FEE2E2"}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: a.passed ? "#059669" : "#DC2626" }}>
                      <Icon name={a.passed ? "check-circle" : "x"} className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: a.passed ? "#065F46" : "#7F1D1D" }}>
                        Attempt {attempts.length - i}
                      </p>
                      <p className="text-[11px]" style={{ color: a.passed ? "#059669" : "#DC2626" }}>
                        {a.passed ? "Passed" : "Failed"} · {a.scorePercent}%
                      </p>
                    </div>
                  </div>
                  <span className="text-[24px] font-bold" style={{ color: a.passed ? "#059669" : "#DC2626" }}>
                    {a.scorePercent}%
                  </span>
                </div>
              ))}
              <button
                onClick={() => setView("quiz")}
                className="w-full rounded-xl py-2 text-[13px] font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors mt-2"
              >
                Take Quiz Again
              </button>
            </div>
          )}

          {/* ── Result view ─────────────────────────────────────────────────── */}
          {view === "result" && result && (
            <div className="px-5 py-8 flex flex-col items-center gap-5 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: result.passed ? "#ECFDF5" : "#FFF5F5" }}
              >
                <Icon
                  name={result.passed ? "check-circle" : "x"}
                  className="w-10 h-10"
                  style={{ color: result.passed ? "#059669" : "#DC2626" }}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-[32px] font-bold" style={{ color: result.passed ? "#059669" : "#DC2626" }}>
                  {result.scorePercent}%
                </p>
                <p className="text-[18px] font-bold mt-1" style={{ color: result.passed ? "#065F46" : "#7F1D1D" }}>
                  {result.passed ? "You passed!" : "Not quite"}
                </p>
                <p className="text-[13px] text-[#64748B] mt-2">
                  {result.correct} of {result.total} correct · Pass mark: {quiz.passMarkPercent}%
                </p>
              </div>
              {result.passed ? (
                <div className="rounded-xl px-5 py-4 w-full" style={{ background: "#ECFDF5", border: "1px solid #D1FAE5" }}>
                  <p className="text-[13px] font-semibold text-[#065F46]">Course completed!</p>
                  <p className="text-[11px] text-[#059669] mt-0.5">Your progress has been updated to 100%.</p>
                </div>
              ) : (
                <div className="rounded-xl px-5 py-4 w-full" style={{ background: "#FFF5F5", border: "1px solid #FEE2E2" }}>
                  <p className="text-[13px] font-semibold text-[#7F1D1D]">Keep going!</p>
                  <p className="text-[11px] text-[#DC2626] mt-0.5">
                    You needed {quiz.passMarkPercent}% to pass. Review the materials and try again.
                  </p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-[13px] font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                  Close
                </button>
                {!result.passed && (
                  <button onClick={retakeQuiz} className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#0B2349" }}>
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Quiz view ───────────────────────────────────────────────────── */}
          {view === "quiz" && (
            <div className="px-5 py-4 space-y-5">
              {bestAttempt?.passed && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#ECFDF5", border: "1px solid #D1FAE5" }}>
                  <Icon name="check-circle" className="w-4 h-4 flex-shrink-0" style={{ color: "#059669" }} />
                  <p className="text-[12px] text-[#065F46]">
                    You already passed with <strong>{bestAttempt.scorePercent}%</strong>. You can retake for practice.
                  </p>
                </div>
              )}

              {quiz.questions.map((q, qIdx) => (
                <div key={q.id}>
                  <p className="text-[13px] font-semibold text-[#1e293b] mb-3">
                    <span className="text-[#94A3B8] mr-2">{qIdx + 1}.</span>{q.prompt}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                          style={selected
                            ? { background: "#EFF4FF", border: "1.5px solid #0B2349" }
                            : { background: "#F8FAFC", border: "1.5px solid transparent" }
                          }
                        >
                          <div
                            className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                            style={selected
                              ? { borderColor: "#0B2349", background: "#0B2349" }
                              : { borderColor: "#C4C9D4" }
                            }
                          >
                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-[13px]" style={{ color: selected ? "#0B2349" : "#4B5563", fontWeight: selected ? 600 : 400 }}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only on quiz view */}
        {view === "quiz" && (
          <div className="px-5 py-4 border-t border-[#F1F5F9] flex-shrink-0 bg-[#FAFBFC]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[#94A3B8]">{answered} of {quiz.questions.length} answered</p>
              <div className="flex gap-1">
                {quiz.questions.map((q) => (
                  <div key={q.id} className="w-2 h-2 rounded-full"
                    style={{ background: answers[q.id] ? "#0B2349" : "#E2E8F0" }} />
                ))}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ background: "#0B2349" }}
            >
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CourseDetailModal ─────────────────────────────────────────────────────────

function CourseDetailModal({
  enrollment,
  onClose,
  onUpdateProgress,
}: {
  enrollment: EnrollmentWithCourse;
  onClose: () => void;
  onUpdateProgress: (e: EnrollmentWithCourse) => void;
}) {
  const course = enrollment.course as CourseWithExtras | null;
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<"materials" | "quiz">(
    course?.items && course.items.length > 0 ? "materials" : "quiz"
  );

  if (!course) return null;

  const items = course.items ?? [];
  const hasQuiz = !!course.quiz;

  const ITEM_ICON_MAP: Record<string, "link" | "book-open" | "clock"> = {
    link:          "link",
    video_file:    "clock",
    document_file: "book-open",
  };
  const ITEM_BG: Record<string, string> = {
    link:          "#EFF4FF",
    video_file:    "#F5F3FF",
    document_file: "#FFFBEB",
  };
  const ITEM_COLOR: Record<string, string> = {
    link:          "#1d4ed8",
    video_file:    "#7C3AED",
    document_file: "#D97706",
  };
  const ITEM_LABEL: Record<string, string> = {
    link:          "Link",
    video_file:    "Video",
    document_file: "Document",
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(11,35,73,0.35)" }} onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white"
        style={{ width: 400, boxShadow: "-8px 0 40px rgba(11,35,73,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] flex-shrink-0" style={{ background: "#0B2349" }}>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-[14px] truncate">{course.title}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{course.provider} · {course.durationHours}h</p>
          </div>
          <button onClick={onClose} className="ml-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Icon name="x" className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Progress strip */}
        <div className="px-5 py-3 border-b border-[#F1F5F9] flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[#64748B]">
              <span className="font-semibold"
                style={{ color: STATUS_STYLE[enrollment.status].text }}>
                {enrollment.status}
              </span>
              {enrollment.completedDate && ` · Completed ${enrollment.completedDate}`}
            </span>
            <span className="text-[12px] font-bold text-[#0B2349]">{enrollment.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${enrollment.progress}%`, background: enrollment.status === "Completed" ? "#059669" : "#0B2349" }} />
          </div>
          {enrollment.status !== "Completed" && (
            <button
              onClick={() => onUpdateProgress(enrollment)}
              className="mt-2 text-[11px] font-semibold text-[#0B2349] hover:underline"
            >
              Update progress
            </button>
          )}
        </div>

        {/* Tabs */}
        {(items.length > 0 || hasQuiz) && (
          <div className="flex border-b border-[#F1F5F9] flex-shrink-0">
            {items.length > 0 && (
              <button
                onClick={() => setActiveTab("materials")}
                className="flex-1 py-2.5 text-[12px] font-semibold border-b-2 transition-colors"
                style={activeTab === "materials"
                  ? { borderColor: "#0B2349", color: "#0B2349" }
                  : { borderColor: "transparent", color: "#94A3B8" }}
              >
                Materials ({items.length})
              </button>
            )}
            {hasQuiz && (
              <button
                onClick={() => setActiveTab("quiz")}
                className="flex-1 py-2.5 text-[12px] font-semibold border-b-2 transition-colors"
                style={activeTab === "quiz"
                  ? { borderColor: "#D97706", color: "#D97706" }
                  : { borderColor: "transparent", color: "#94A3B8" }}
              >
                Quiz
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Materials ─────────────────────────────────────────────────── */}
          {activeTab === "materials" && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-8">
                  <Icon name="book-open" className="w-8 h-8 text-[#C4C9D4]" />
                  <p className="text-[13px] font-medium text-[#64748B]">No materials yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F8FAFC]">
                  {items.map((item) => {
                    const bg    = ITEM_BG[item.kind]    ?? "#F1F5F9";
                    const color = ITEM_COLOR[item.kind] ?? "#64748B";
                    const label = ITEM_LABEL[item.kind] ?? item.kind;
                    const iconName = ITEM_ICON_MAP[item.kind];

                    return (
                      <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: bg }}>
                          <Icon name={iconName} className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1e293b] leading-snug">{item.title}</p>
                          <p className="text-[10px] font-medium mt-0.5" style={{ color }}>{label}</p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-3 py-1 hover:opacity-80 transition-opacity"
                              style={{ background: bg, color }}
                            >
                              Open link <Icon name="link" className="w-3 h-3" />
                            </a>
                          )}
                          {item.storageId && !item.url && (
                            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#94A3B8] rounded-lg px-3 py-1 bg-[#F1F5F9]">
                              <Icon name="book-open" className="w-3 h-3" /> File uploaded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Quiz ──────────────────────────────────────────────────────── */}
          {activeTab === "quiz" && course.quiz && (
            <div className="px-5 py-6 flex flex-col items-center gap-5 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
                <Icon name="check-circle" className="w-7 h-7" style={{ color: "#D97706" }} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1e293b]">Course Quiz</p>
                <p className="text-[12px] text-[#94A3B8] mt-1">
                  {course.quiz.questions.length} questions · {course.quiz.passMarkPercent}% to pass
                </p>
              </div>
              {course.description && (
                <p className="text-[12px] text-[#64748B] leading-relaxed">{course.description}</p>
              )}
              <div className="w-full space-y-2.5">
                {[
                  { label: "Questions", value: `${course.quiz.questions.length}` },
                  { label: "Pass mark", value: `${course.quiz.passMarkPercent}%` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                    <span className="text-[12px] text-[#64748B]">{s.label}</span>
                    <span className="text-[13px] font-bold text-[#0B2349]">{s.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full rounded-xl py-2.5 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "#0B2349" }}
              >
                Start Quiz
              </button>
            </div>
          )}
        </div>

        {/* No materials and no quiz */}
        {items.length === 0 && !hasQuiz && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-8">
            <Icon name="book-open" className="w-8 h-8 text-[#C4C9D4]" />
            <p className="text-[13px] font-medium text-[#64748B]">No materials attached yet</p>
            <p className="text-[11px] text-[#94A3B8]">Your HR team can add learning materials and quizzes.</p>
          </div>
        )}
      </div>

      {/* Quiz modal */}
      {showQuiz && course.quiz && (
        <QuizModal
          course={course}
          enrollmentId={enrollment._id}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}

// ── Progress updater ──────────────────────────────────────────────────────────

function ProgressModal({
  enrollment,
  onClose,
}: {
  enrollment: EnrollmentWithCourse;
  onClose: () => void;
}) {
  const updateProgress = useMutation(api.training.updateProgress);
  const [value, setValue] = useState(enrollment.progress);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateProgress({ enrollmentId: enrollment._id, progress: value });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(11,35,73,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div>
          <h3 className="text-[15px] font-bold text-[#0B2349]">Update Progress</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5 truncate">{enrollment.course?.title}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748B]">Completion</span>
            <span className="text-[14px] font-bold text-[#0B2349]">{value}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full accent-[#0B2349]"
          />
          <div className="flex justify-between text-[10px] text-[#C4C9D4]">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
        {value === 100 && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "#ECFDF5" }}>
            <Icon name="check-circle" className="w-4 h-4" style={{ color: "#059669" }} />
            <span className="text-[12px] font-semibold" style={{ color: "#059669" }}>This will mark the course as completed.</span>
          </div>
        )}
        <div className="flex gap-2.5 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl py-2 text-[13px] font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: "#0B2349" }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const enrollments = (useQuery(api.training.myEnrollments) ?? []) as EnrollmentWithCourse[];
  const courses     = (useQuery(api.training.listCourses) ?? []) as CourseWithExtras[];
  const selfEnroll  = useMutation(api.training.selfEnroll);

  const [enrollingId,     setEnrollingId]     = useState<string | null>(null);
  const [progressTarget,  setProgressTarget]  = useState<EnrollmentWithCourse | null>(null);
  const [detailTarget,    setDetailTarget]    = useState<EnrollmentWithCourse | null>(null);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const available = courses.filter((c) => !enrolledCourseIds.has(c._id));

  const completed   = enrollments.filter((e) => e.status === "Completed");
  const inProgress  = enrollments.filter((e) => e.status === "In Progress");
  const totalCpdHrs = completed.reduce((a, e) => a + (e.course?.durationHours ?? 0), 0);

  async function handleEnroll(courseId: Id<"trainingCourses">) {
    setEnrollingId(courseId);
    try { await selfEnroll({ courseId }); } finally { setEnrollingId(null); }
  }

  const loading = enrollments === undefined || courses === undefined;

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h2 className="text-[18px] font-bold text-[#0B2349]">My Training</h2>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">Your learning and development tracker</p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-[13px] text-[#94A3B8]">Loading…</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Completed",   value: completed.length,  suffix: "courses", color: "#059669", bg: "#ECFDF5", icon: "check-circle" as const },
              { label: "In Progress", value: inProgress.length, suffix: "courses", color: "#1d4ed8", bg: "#EFF4FF", icon: "book-open" as const },
              { label: "CPD Hours",   value: totalCpdHrs,       suffix: "hrs",     color: "#0B2349", bg: "#F1F5F9", icon: "clock" as const },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-[32px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1">{s.suffix} this year</p>
              </div>
            ))}
          </div>

          {/* My courses */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="px-5 py-4 border-b border-[#F1F5F9]">
              <h3 className="text-[14px] font-bold text-[#0B2349]">My Courses</h3>
            </div>
            {enrollments.length === 0 ? (
              <div className="px-5 py-12 flex flex-col items-center gap-2 text-center">
                <Icon name="book-open" className="w-8 h-8 text-[#C4C9D4]" />
                <p className="text-[13px] font-medium text-[#64748B]">No courses yet</p>
                <p className="text-[11px] text-[#94A3B8]">Browse the catalogue below and enroll in a course.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F8FAFC]">
                {enrollments.map((e) => {
                  const course = e.course as CourseWithExtras | null;
                  const hasItems = (course?.items?.length ?? 0) > 0;
                  const hasQuiz  = !!course?.quiz;
                  return (
                    <div key={e._id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <p className="text-[13px] font-semibold text-[#1e293b]">{course?.title ?? "Unknown"}</p>
                            <span className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{ background: STATUS_STYLE[e.status].bg, color: STATUS_STYLE[e.status].text }}>
                              {e.status}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#94A3B8] mb-2">
                            {course?.provider} · {course?.durationHours}h
                            {course?.dueDate ? ` · Due ${course.dueDate}` : ""}
                          </p>

                          {/* Materials + quiz badges */}
                          {(hasItems || hasQuiz) && (
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {hasItems && (
                                <span className="text-[10px] font-medium rounded-md px-2 py-0.5 flex items-center gap-1"
                                  style={{ background: "#EFF4FF", color: "#1d4ed8" }}>
                                  <Icon name="book-open" className="w-3 h-3" />
                                  {course!.items!.length} material{course!.items!.length !== 1 ? "s" : ""}
                                </span>
                              )}
                              {hasQuiz && (
                                <span className="text-[10px] font-medium rounded-md px-2 py-0.5 flex items-center gap-1"
                                  style={{ background: "#FFFBEB", color: "#D97706" }}>
                                  <Icon name="check-circle" className="w-3 h-3" />
                                  Quiz
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${e.progress}%`, background: e.status === "Completed" ? "#059669" : "#0B2349" }} />
                            </div>
                            <span className="text-[12px] font-semibold text-[#0B2349] w-10 text-right">{e.progress}%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {(hasItems || hasQuiz) && (
                            <button
                              onClick={() => setDetailTarget(e)}
                              className="rounded-lg px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] text-[#0B2349] hover:bg-[#F5F7FA] transition-colors"
                            >
                              View
                            </button>
                          )}
                          {e.status !== "Completed" && (
                            <button
                              onClick={() => setProgressTarget(e)}
                              className="rounded-lg px-3 py-1.5 text-[12px] font-semibold hover:opacity-90 transition-opacity"
                              style={{ background: "#0B2349", color: "white" }}
                            >
                              {e.status === "Not Started" ? "Start" : "Continue"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available courses */}
          {available.length > 0 && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4 border-b border-[#F1F5F9]">
                <h3 className="text-[14px] font-bold text-[#0B2349]">Browse Courses</h3>
              </div>
              <div className="divide-y divide-[#F8FAFC]">
                {available.map((c) => {
                  const cs = CAT_STYLE[c.category] ?? CAT_STYLE.Other;
                  const hasItems = (c.items?.length ?? 0) > 0;
                  const hasQuiz  = !!c.quiz;
                  return (
                    <div key={c._id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F1F5F9" }}>
                          <Icon name="book-open" className="w-4 h-4 text-[#64748B]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1e293b]">{c.title}</p>
                          <p className="text-[12px] text-[#94A3B8]">
                            {c.provider} · {c.durationHours}h{c.dueDate ? ` · Due ${c.dueDate}` : ""}
                          </p>
                          {(hasItems || hasQuiz) && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {hasItems && (
                                <span className="text-[10px] font-medium rounded px-1.5 py-0.5" style={{ background: "#EFF4FF", color: "#1d4ed8" }}>
                                  {c.items!.length} material{c.items!.length !== 1 ? "s" : ""}
                                </span>
                              )}
                              {hasQuiz && (
                                <span className="text-[10px] font-medium rounded px-1.5 py-0.5" style={{ background: "#FFFBEB", color: "#D97706" }}>
                                  Quiz included
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: cs.bg, color: cs.text }}>{c.category}</span>
                        <button
                          onClick={() => handleEnroll(c._id)}
                          disabled={enrollingId === c._id}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
                        >
                          {enrollingId === c._id ? "Enrolling…" : "Enroll"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {enrollments.length > 0 && available.length === 0 && (
            <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-2 text-center" style={{ border: "1px solid #F1F5F9" }}>
              <Icon name="check-circle" className="w-8 h-8" style={{ color: "#059669" }} />
              <p className="text-[13px] font-medium text-[#64748B]">You're enrolled in all available courses.</p>
            </div>
          )}
        </>
      )}

      {/* Progress modal */}
      {progressTarget && (
        <ProgressModal enrollment={progressTarget} onClose={() => setProgressTarget(null)} />
      )}

      {/* Course detail drawer */}
      {detailTarget && (
        <CourseDetailModal
          enrollment={detailTarget}
          onClose={() => setDetailTarget(null)}
          onUpdateProgress={(e) => { setDetailTarget(null); setProgressTarget(e); }}
        />
      )}
    </div>
  );
}
