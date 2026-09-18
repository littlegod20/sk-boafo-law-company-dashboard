import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Convex Auth tables ─────────────────────────────────────────────────────
  ...authTables,

  // ── Users (extended auth users) ───────────────────────────────────────────
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(
      v.union(
        v.literal("managing_partner"),
        v.literal("partner"),
        v.literal("associate"),
        v.literal("paralegal"),
        v.literal("admin"),
        v.literal("hr_officer")
      )
    ),
    dept: v.optional(v.string()),
    barNumber: v.optional(v.string()),
    joinedDate: v.optional(v.string()),
    workPhone: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    // Extended profile
    personalEmail: v.optional(v.string()),
    personalPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    profilePictureStorageId: v.optional(v.id("_storage")),
    cvStorageId: v.optional(v.id("_storage")),
    extraFiles: v.optional(
      v.array(v.object({ name: v.string(), storageId: v.id("_storage") }))
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // ── Clients ────────────────────────────────────────────────────────────────
  clients: defineTable({
    clientRef: v.string(),
    name: v.string(),
    type: v.union(v.literal("Corporate"), v.literal("Individual"), v.literal("Trust")),
    contact: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.string(),
    joined: v.string(),
    attorney: v.string(),
    activeCases: v.number(),
    totalCases: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_ref", ["clientRef"]),

  // ── Cases ──────────────────────────────────────────────────────────────────
  cases: defineTable({
    caseNumber: v.string(),
    title: v.optional(v.string()),
    clientId: v.id("clients"),
    clientName: v.string(),
    clientType: v.string(),
    type: v.string(),
    status: v.union(
      v.literal("Active"),
      v.literal("Pending"),
      v.literal("On Hold"),
      v.literal("Closed"),
      v.literal("Settled")
    ),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
    attorney: v.string(),
    leadAttorneyId: v.optional(v.id("users")),
    nextHearing: v.optional(v.string()),
    court: v.optional(v.string()),
    openedDate: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_case_number", ["caseNumber"]),

  // ── Leave requests ─────────────────────────────────────────────────────────
  leaveRequests: defineTable({
    employeeId: v.id("users"),
    employeeName: v.string(),
    role: v.string(),
    type: v.string(),
    from: v.string(),
    to: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
    status: v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Declined")),
    approvedById: v.optional(v.id("users")),
    approvedByName: v.optional(v.string()),
    appliedDate: v.string(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ── Invoices ───────────────────────────────────────────────────────────────
  invoices: defineTable({
    invoiceNumber: v.string(),
    clientId: v.id("clients"),
    clientName: v.string(),
    caseId: v.optional(v.id("cases")),
    type: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Sent"),
      v.literal("Paid"),
      v.literal("Overdue"),
      v.literal("Disputed")
    ),
    issueDate: v.string(),
    dueDate: v.string(),
    attorney: v.string(),
    description: v.optional(v.string()),
    lineItems: v.optional(
      v.array(v.object({
        description: v.string(),
        hours: v.optional(v.number()),
        rate: v.optional(v.number()),
        amount: v.number(),
      }))
    ),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_invoice_number", ["invoiceNumber"]),

  // ── Messages ───────────────────────────────────────────────────────────────
  messages: defineTable({
    fromId: v.id("users"),
    fromName: v.string(),
    toId: v.id("users"),
    subject: v.string(),
    content: v.string(),
    read: v.boolean(),
    threadId: v.optional(v.string()),
  })
    .index("by_to", ["toId"])
    .index("by_from", ["fromId"])
    .index("by_to_read", ["toId", "read"]),

  // ── Announcements ──────────────────────────────────────────────────────────
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    audience: v.string(),
    category: v.optional(v.string()),
    pinned: v.boolean(),
  }).index("by_pinned", ["pinned"]),

  // ── Job Postings ───────────────────────────────────────────────────────────
  jobPostings: defineTable({
    jobRef: v.string(),
    title: v.string(),
    dept: v.string(),
    status: v.union(
      v.literal("Open"),
      v.literal("Interviewing"),
      v.literal("Offer Extended"),
      v.literal("Filled"),
      v.literal("Closed")
    ),
    applications: v.number(),
    postedDate: v.string(),
    closingDate: v.string(),
    hiringManagerName: v.string(),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_ref", ["jobRef"]),

  // ── Job Applicants ─────────────────────────────────────────────────────────
  jobApplicants: defineTable({
    jobId: v.id("jobPostings"),
    name: v.string(),
    email: v.optional(v.string()),
    appliedDate: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Shortlisted"),
      v.literal("Interview"),
      v.literal("Offered"),
      v.literal("Rejected")
    ),
    notes: v.optional(v.string()),
    cvUrl: v.optional(v.string()),
  }).index("by_job", ["jobId"]),

  // ── Onboardees ─────────────────────────────────────────────────────────────
  onboardees: defineTable({
    name: v.string(),
    role: v.string(),
    dept: v.string(),
    startDate: v.string(),
    stage: v.union(
      v.literal("Pre-arrival"),
      v.literal("Week 1"),
      v.literal("Month 1"),
      v.literal("Completed")
    ),
    progress: v.number(),
    buddy: v.optional(v.string()),
    addedById: v.optional(v.id("users")),
    checklist: v.array(v.object({
      task: v.string(),
      done: v.boolean(),
      category: v.string(),
    })),
    personalEmail: v.optional(v.string()),
    personalPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    profilePictureStorageId: v.optional(v.id("_storage")),
    cvStorageId: v.optional(v.id("_storage")),
    extraFiles: v.optional(
      v.array(v.object({ name: v.string(), storageId: v.id("_storage") }))
    ),
    linkedUserId: v.optional(v.id("users")),
  }).index("by_stage", ["stage"]),

  // ── Exit Clearances ────────────────────────────────────────────────────────
  exitClearances: defineTable({
    exitRef: v.string(),
    name: v.string(),
    role: v.string(),
    dept: v.string(),
    lastDay: v.string(),
    reason: v.string(),
    status: v.union(v.literal("In Progress"), v.literal("Cleared")),
    initiatedById: v.optional(v.id("users")),
    clearanceItems: v.array(v.object({
      item: v.string(),
      done: v.boolean(),
      owner: v.string(),
    })),
  }).index("by_status", ["status"]),

  // ── Performance Periods ────────────────────────────────────────────────────
  performancePeriods: defineTable({
    name: v.string(),
    type: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annually")),
    startDate: v.string(),
    endDate: v.string(),
    status: v.union(v.literal("Active"), v.literal("Closed")),
    createdById: v.id("users"),
  }).index("by_status", ["status"]),

  // ── Performance Reviews ────────────────────────────────────────────────────
  performanceReviews: defineTable({
    periodId: v.id("performancePeriods"),
    employeeId: v.id("users"),
    employeeName: v.string(),
    reviewerId: v.optional(v.id("users")),
    reviewerName: v.optional(v.string()),
    billableHours: v.optional(v.number()),
    billableHoursTarget: v.optional(v.number()),
    casesHandled: v.optional(v.number()),
    casesClosed: v.optional(v.number()),
    overallScore: v.optional(v.number()),
    kpis: v.optional(v.array(v.object({
      name: v.string(),
      target: v.number(),
      actual: v.number(),
      unit: v.optional(v.string()),
    }))),
    notes: v.optional(v.string()),
    status: v.union(v.literal("Draft"), v.literal("Submitted")),
  })
    .index("by_period", ["periodId"])
    .index("by_employee", ["employeeId"])
    .index("by_period_employee", ["periodId", "employeeId"]),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: defineTable({
    recipientId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    linkTo: v.optional(v.string()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_read", ["recipientId", "read"]),

  // ── Expense Claims ─────────────────────────────────────────────────────────
  expenseClaims: defineTable({
    claimRef: v.string(),
    employeeId: v.id("users"),
    employeeName: v.string(),
    role: v.string(),
    category: v.string(),
    amount: v.number(),
    date: v.string(),
    submittedDate: v.string(),
    description: v.string(),
    status: v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Declined")),
    receipt: v.boolean(),
    approvedById: v.optional(v.id("users")),
    approvedByName: v.optional(v.string()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ── Training Courses ───────────────────────────────────────────────────────
  trainingCourses: defineTable({
    title: v.string(),
    provider: v.string(),
    category: v.union(
      v.literal("Legal"),
      v.literal("HR"),
      v.literal("Tech"),
      v.literal("Compliance"),
      v.literal("Other")
    ),
    durationHours: v.number(),
    description: v.optional(v.string()),
    targetRoles: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    status: v.union(v.literal("Active"), v.literal("Archived")),
    createdById: v.id("users"),
    // ── course materials ──────────────────────────────────────────────────────
    items: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      kind: v.union(
        v.literal("link"),
        v.literal("video_file"),
        v.literal("document_file")
      ),
      url: v.optional(v.string()),
      storageId: v.optional(v.string()),
    }))),
    // ── quiz ─────────────────────────────────────────────────────────────────
    quiz: v.optional(v.object({
      passMarkPercent: v.number(),
      questions: v.array(v.object({
        id: v.string(),
        prompt: v.string(),
        options: v.array(v.object({ id: v.string(), label: v.string() })),
        correctOptionId: v.string(),
      })),
    })),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  // ── Training Enrollments ───────────────────────────────────────────────────
  trainingEnrollments: defineTable({
    courseId: v.id("trainingCourses"),
    employeeId: v.id("users"),
    employeeName: v.string(),
    progress: v.number(),
    status: v.union(
      v.literal("Not Started"),
      v.literal("In Progress"),
      v.literal("Completed")
    ),
    enrolledDate: v.string(),
    completedDate: v.optional(v.string()),
    assignedById: v.optional(v.id("users")),
  })
    .index("by_employee", ["employeeId"])
    .index("by_course", ["courseId"])
    .index("by_course_employee", ["courseId", "employeeId"]),

  // ── Training Quiz Attempts ─────────────────────────────────────────────────
  trainingQuizAttempts: defineTable({
    courseId: v.id("trainingCourses"),
    employeeId: v.id("users"),
    enrollmentId: v.id("trainingEnrollments"),
    scorePercent: v.number(),
    passed: v.boolean(),
    answers: v.array(v.object({ questionId: v.string(), optionId: v.string() })),
  })
    .index("by_enrollment", ["enrollmentId"])
    .index("by_employee_course", ["employeeId", "courseId"]),
});
