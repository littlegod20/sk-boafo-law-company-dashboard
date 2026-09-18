import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── shared validators ──────────────────────────────────────────────────────────

const itemValidator = v.object({
  id: v.string(),
  title: v.string(),
  kind: v.union(v.literal("link"), v.literal("video_file"), v.literal("document_file")),
  url: v.optional(v.string()),
  storageId: v.optional(v.string()),
});

const quizValidator = v.object({
  passMarkPercent: v.number(),
  questions: v.array(v.object({
    id: v.string(),
    prompt: v.string(),
    options: v.array(v.object({ id: v.string(), label: v.string() })),
    correctOptionId: v.string(),
  })),
});

// ── listCourses — all active courses ──────────────────────────────────────────

export const listCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("trainingCourses")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
  },
});

// ── listAllCourses — all courses including archived (HR view) ─────────────────

export const listAllCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trainingCourses").order("desc").collect();
  },
});

// ── myEnrollments — current user's enrollments with course info ───────────────

export const myEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const enrollments = await ctx.db
      .query("trainingEnrollments")
      .withIndex("by_employee", (q) => q.eq("employeeId", userId))
      .collect();
    return await Promise.all(
      enrollments.map(async (e) => {
        const course = await ctx.db.get(e.courseId);
        return { ...e, course };
      })
    );
  },
});

// ── courseEnrollments — all enrollments for a given course (HR) ───────────────

export const courseEnrollments = query({
  args: { courseId: v.id("trainingCourses") },
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("trainingEnrollments")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect();
  },
});

// ── allEnrollments — all enrollments with course info (HR overview) ───────────

export const allEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("trainingEnrollments").collect();
    return await Promise.all(
      enrollments.map(async (e) => {
        const course = await ctx.db.get(e.courseId);
        return { ...e, courseTitle: course?.title ?? "Unknown" };
      })
    );
  },
});

// ── createCourse ──────────────────────────────────────────────────────────────

export const createCourse = mutation({
  args: {
    title:         v.string(),
    provider:      v.string(),
    category:      v.union(
      v.literal("Legal"),
      v.literal("HR"),
      v.literal("Tech"),
      v.literal("Compliance"),
      v.literal("Other")
    ),
    durationHours: v.number(),
    description:   v.optional(v.string()),
    targetRoles:   v.optional(v.array(v.string())),
    dueDate:       v.optional(v.string()),
    items:         v.optional(v.array(itemValidator)),
    quiz:          v.optional(quizValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("trainingCourses", {
      ...args,
      status: "Active",
      createdById: userId,
    });
  },
});

// ── updateCourse ──────────────────────────────────────────────────────────────

export const updateCourse = mutation({
  args: {
    id:            v.id("trainingCourses"),
    title:         v.optional(v.string()),
    provider:      v.optional(v.string()),
    category:      v.optional(v.union(
      v.literal("Legal"),
      v.literal("HR"),
      v.literal("Tech"),
      v.literal("Compliance"),
      v.literal("Other")
    )),
    durationHours: v.optional(v.number()),
    description:   v.optional(v.string()),
    targetRoles:   v.optional(v.array(v.string())),
    dueDate:       v.optional(v.string()),
    status:        v.optional(v.union(v.literal("Active"), v.literal("Archived"))),
    items:         v.optional(v.array(itemValidator)),
    quiz:          v.optional(quizValidator),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ── archiveCourse ─────────────────────────────────────────────────────────────

export const archiveCourse = mutation({
  args: { id: v.id("trainingCourses") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "Archived" });
  },
});

// ── restoreCourse ─────────────────────────────────────────────────────────────

export const restoreCourse = mutation({
  args: { id: v.id("trainingCourses") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "Active" });
  },
});

// ── selfEnroll — employee self-enrolls in a course ───────────────────────────

export const selfEnroll = mutation({
  args: { courseId: v.id("trainingCourses") },
  handler: async (ctx, { courseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("trainingEnrollments")
      .withIndex("by_course_employee", (q) =>
        q.eq("courseId", courseId).eq("employeeId", userId)
      )
      .first();
    if (existing) return existing._id;

    const user = await ctx.db.get(userId);
    const today = new Date().toISOString().slice(0, 10);
    return await ctx.db.insert("trainingEnrollments", {
      courseId,
      employeeId: userId,
      employeeName: user?.name ?? user?.email ?? "Unknown",
      progress: 0,
      status: "Not Started",
      enrolledDate: today,
    });
  },
});

// ── updateProgress — employee updates their own progress ─────────────────────

export const updateProgress = mutation({
  args: {
    enrollmentId: v.id("trainingEnrollments"),
    progress:     v.number(),
  },
  handler: async (ctx, { enrollmentId, progress }) => {
    const clamped = Math.min(Math.max(Math.round(progress), 0), 100);
    const status =
      clamped === 100 ? "Completed"
      : clamped > 0   ? "In Progress"
      : "Not Started";
    const patch: Record<string, unknown> = { progress: clamped, status };
    if (clamped === 100) patch.completedDate = new Date().toISOString().slice(0, 10);
    await ctx.db.patch(enrollmentId, patch);
  },
});

// ── assignCourse — HR assigns a course to one or more employees ───────────────

export const assignCourse = mutation({
  args: {
    courseId:    v.id("trainingCourses"),
    employeeIds: v.array(v.id("users")),
  },
  handler: async (ctx, { courseId, employeeIds }) => {
    const assignerId = await getAuthUserId(ctx);
    if (!assignerId) throw new Error("Not authenticated");

    const today = new Date().toISOString().slice(0, 10);
    const results: string[] = [];

    for (const employeeId of employeeIds) {
      const existing = await ctx.db
        .query("trainingEnrollments")
        .withIndex("by_course_employee", (q) =>
          q.eq("courseId", courseId).eq("employeeId", employeeId)
        )
        .first();
      if (existing) { results.push(existing._id); continue; }

      const emp = await ctx.db.get(employeeId);
      const id = await ctx.db.insert("trainingEnrollments", {
        courseId,
        employeeId,
        employeeName: emp?.name ?? emp?.email ?? "Unknown",
        progress: 0,
        status: "Not Started",
        enrolledDate: today,
        assignedById: assignerId,
      });
      results.push(id);
    }
    return results;
  },
});

// ── generateUploadUrl — Convex file storage upload URL ───────────────────────

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// ── submitQuizAttempt — employee submits quiz answers ────────────────────────

export const submitQuizAttempt = mutation({
  args: {
    courseId:     v.id("trainingCourses"),
    enrollmentId: v.id("trainingEnrollments"),
    answers:      v.array(v.object({ questionId: v.string(), optionId: v.string() })),
  },
  handler: async (ctx, { courseId, enrollmentId, answers }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const course = await ctx.db.get(courseId);
    if (!course?.quiz) throw new Error("Course has no quiz");

    const { questions, passMarkPercent } = course.quiz;
    let correct = 0;
    for (const q of questions) {
      const given = answers.find((a) => a.questionId === q.id);
      if (given?.optionId === q.correctOptionId) correct++;
    }
    const scorePercent = questions.length > 0
      ? Math.round((correct / questions.length) * 100)
      : 0;
    const passed = scorePercent >= passMarkPercent;

    await ctx.db.insert("trainingQuizAttempts", {
      courseId,
      employeeId: userId,
      enrollmentId,
      scorePercent,
      passed,
      answers,
    });

    return { scorePercent, passed, correct, total: questions.length };
  },
});

// ── getFileUrl — resolve a storage ID to a download URL ──────────────────────

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ── myQuizAttempts — current user's quiz attempts for a course ────────────────

export const myQuizAttempts = query({
  args: { courseId: v.id("trainingCourses") },
  handler: async (ctx, { courseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("trainingQuizAttempts")
      .withIndex("by_employee_course", (q) =>
        q.eq("employeeId", userId).eq("courseId", courseId)
      )
      .order("desc")
      .collect();
  },
});

// ── allQuizAttempts — HR view: all attempts for a course ──────────────────────

export const allQuizAttempts = query({
  args: { courseId: v.id("trainingCourses") },
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("trainingQuizAttempts")
      .withIndex("by_enrollment", (q) => q)
      .filter((q) => q.eq(q.field("courseId"), courseId))
      .collect();
  },
});
