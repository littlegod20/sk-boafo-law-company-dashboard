import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── listMine — leave requests for the logged-in employee ────────────────────

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_employee", (q) => q.eq("employeeId", userId))
      .order("desc")
      .collect();
  },
});

// ── listAll — all leave requests (HR view) ────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leaveRequests").order("desc").collect();
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    type: v.string(),
    from: v.string(),
    to: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("leaveRequests", {
      employeeId: userId,
      employeeName: user.name ?? user.email ?? "Unknown",
      role: user.role ?? "associate",
      type: args.type,
      from: args.from,
      to: args.to,
      days: args.days,
      reason: args.reason,
      status: "Pending",
      appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });
  },
});

// ── approve ───────────────────────────────────────────────────────────────────

export const approve = mutation({
  args: { ids: v.array(v.id("leaveRequests")) },
  handler: async (ctx, { ids }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const approver = await ctx.db.get(userId);
    const approverName = approver?.name ?? approver?.email ?? "Manager";

    await Promise.all(
      ids.map((id) =>
        ctx.db.patch(id, {
          status: "Approved",
          approvedById: userId,
          approvedByName: approverName,
        })
      )
    );
  },
});

// ── decline ───────────────────────────────────────────────────────────────────

export const decline = mutation({
  args: { ids: v.array(v.id("leaveRequests")) },
  handler: async (ctx, { ids }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const approver = await ctx.db.get(userId);
    const approverName = approver?.name ?? approver?.email ?? "Manager";

    await Promise.all(
      ids.map((id) =>
        ctx.db.patch(id, {
          status: "Declined",
          approvedById: userId,
          approvedByName: approverName,
        })
      )
    );
  },
});
