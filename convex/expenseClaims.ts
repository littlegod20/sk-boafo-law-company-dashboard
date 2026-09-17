import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

// ── list (all, for managers/HR) ───────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("expenseClaims").order("desc").collect();
  },
});

// ── listMine ──────────────────────────────────────────────────────────────────

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("expenseClaims")
      .withIndex("by_employee", (q) => q.eq("employeeId", userId))
      .order("desc")
      .collect();
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    receipt: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const all = await ctx.db.query("expenseClaims").collect();
    const seq = String(all.length + 1).padStart(3, "0");
    const year = new Date().getFullYear();
    const claimRef = `EXP-${year}-${seq}`;

    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const ROLE_LABELS: Record<string, string> = {
      managing_partner: "Managing Partner",
      partner:          "Partner",
      associate:        "Associate",
      paralegal:        "Paralegal",
      admin:            "Admin",
      hr_officer:       "HR Officer",
    };

    return await ctx.db.insert("expenseClaims", {
      claimRef,
      employeeId: userId,
      employeeName: user.name ?? user.email ?? "Unknown",
      role: ROLE_LABELS[user.role ?? "associate"] ?? user.role ?? "Staff",
      category: args.category,
      amount: args.amount,
      date: args.date,
      submittedDate: today,
      description: args.description,
      status: "Pending",
      receipt: args.receipt,
    });
  },
});

// ── approve (bulk) ────────────────────────────────────────────────────────────

export const approve = mutation({
  args: { ids: v.array(v.id("expenseClaims")) },
  handler: async (ctx, { ids }) => {
    const userId = await getAuthUserId(ctx);
    let approverName = "HR";
    if (userId) {
      const approver = await ctx.db.get(userId);
      approverName = approver?.name ?? approver?.email ?? "HR";
    }
    for (const id of ids) {
      await ctx.db.patch(id, {
        status: "Approved",
        approvedById: userId ?? undefined,
        approvedByName: approverName,
      });
    }
  },
});

// ── decline (bulk) ────────────────────────────────────────────────────────────

export const decline = mutation({
  args: { ids: v.array(v.id("expenseClaims")) },
  handler: async (ctx, { ids }) => {
    const userId = await getAuthUserId(ctx);
    let approverName = "HR";
    if (userId) {
      const approver = await ctx.db.get(userId);
      approverName = approver?.name ?? approver?.email ?? "HR";
    }
    for (const id of ids) {
      await ctx.db.patch(id, {
        status: "Declined",
        approvedById: userId ?? undefined,
        approvedByName: approverName,
      });
    }
  },
});
