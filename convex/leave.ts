import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── helpers ────────────────────────────────────────────────────────────────────

/** Returns all users whose role is managing_partner or hr_officer. */
async function getApprovers(ctx: { db: any }) {
  const all = await ctx.db.query("users").collect();
  return (all as any[]).filter(
    (u) => u.role === "managing_partner" || u.role === "hr_officer"
  );
}

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

    const employeeName = user.name ?? user.email ?? "Unknown";

    const id = await ctx.db.insert("leaveRequests", {
      employeeId: userId,
      employeeName,
      role: user.role ?? "associate",
      type: args.type,
      from: args.from,
      to: args.to,
      days: args.days,
      reason: args.reason,
      status: "Pending",
      appliedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });

    // Notify all HR officers and managing partners
    const approvers = await getApprovers(ctx);
    await Promise.all(
      approvers.map((a) =>
        ctx.db.insert("notifications", {
          recipientId: a._id,
          type: "leave_submitted",
          title: "Leave request submitted",
          body: `${employeeName} has applied for ${args.days} day${args.days !== 1 ? "s" : ""} of ${args.type} leave (${args.from} – ${args.to}).`,
          read: false,
          linkTo: "/hr/leave",
        })
      )
    );

    return id;
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
      ids.map(async (id) => {
        const req = await ctx.db.get(id);
        await ctx.db.patch(id, {
          status: "Approved",
          approvedById: userId,
          approvedByName: approverName,
        });
        if (req) {
          await ctx.db.insert("notifications", {
            recipientId: req.employeeId,
            type: "leave_approved",
            title: "Leave approved",
            body: `Your ${req.type} leave request (${req.from} – ${req.to}, ${req.days} day${req.days !== 1 ? "s" : ""}) has been approved by ${approverName}.`,
            read: false,
            linkTo: "/leave",
          });
        }
      })
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
      ids.map(async (id) => {
        const req = await ctx.db.get(id);
        await ctx.db.patch(id, {
          status: "Declined",
          approvedById: userId,
          approvedByName: approverName,
        });
        if (req) {
          await ctx.db.insert("notifications", {
            recipientId: req.employeeId,
            type: "leave_declined",
            title: "Leave request declined",
            body: `Your ${req.type} leave request (${req.from} – ${req.to}, ${req.days} day${req.days !== 1 ? "s" : ""}) was not approved by ${approverName}.`,
            read: false,
            linkTo: "/leave",
          });
        }
      })
    );
  },
});
