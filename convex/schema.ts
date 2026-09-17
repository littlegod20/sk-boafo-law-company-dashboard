import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Convex Auth tables ─────────────────────────────────────────────────────
  ...authTables,

  // ── Users (extended auth users) ───────────────────────────────────────────
  users: defineTable({
    // Fields required by @convex-dev/auth
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
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
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // ── Clients ────────────────────────────────────────────────────────────────
  clients: defineTable({
    clientRef: v.string(),           // e.g. CLT-001
    name: v.string(),
    type: v.union(
      v.literal("Corporate"),
      v.literal("Individual"),
      v.literal("Trust")
    ),
    contact: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.string(),              // "Active" | "Inactive"
    joined: v.string(),
    attorney: v.string(),            // denormalized display name
    activeCases: v.number(),
    totalCases: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_ref", ["clientRef"]),

  // ── Cases ──────────────────────────────────────────────────────────────────
  cases: defineTable({
    caseNumber: v.string(),          // e.g. SKB-2026-047
    title: v.optional(v.string()),
    clientId: v.id("clients"),
    clientName: v.string(),          // denormalized
    clientType: v.string(),
    type: v.string(),
    status: v.union(
      v.literal("Active"),
      v.literal("Pending"),
      v.literal("On Hold"),
      v.literal("Closed"),
      v.literal("Settled")
    ),
    priority: v.union(
      v.literal("High"),
      v.literal("Medium"),
      v.literal("Low")
    ),
    attorney: v.string(),            // denormalized display name
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
    employeeName: v.string(),        // denormalized
    role: v.string(),                // denormalized
    type: v.string(),
    from: v.string(),
    to: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Declined")
    ),
    approvedById: v.optional(v.id("users")),
    approvedByName: v.optional(v.string()),
    appliedDate: v.string(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"]),

  // ── Invoices ───────────────────────────────────────────────────────────────
  invoices: defineTable({
    invoiceNumber: v.string(),       // e.g. INV-2026-031
    clientId: v.id("clients"),
    clientName: v.string(),          // denormalized
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
      v.array(
        v.object({
          description: v.string(),
          hours: v.optional(v.number()),
          rate: v.optional(v.number()),
          amount: v.number(),
        })
      )
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
    audience: v.string(),            // "all" | "hr" | "legal"
    category: v.optional(v.string()),
    pinned: v.boolean(),
  }).index("by_pinned", ["pinned"]),
});
