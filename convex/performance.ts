import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── listPeriods ────────────────────────────────────────────────────────────────

export const listPeriods = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("performancePeriods").order("desc").collect();
  },
});

// ── activePeriod ──────────────────────────────────────────────────────────────

export const activePeriod = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("performancePeriods")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .first();
  },
});

// ── myReview — current user's review for a given period ───────────────────────

export const myReview = query({
  args: { periodId: v.id("performancePeriods") },
  handler: async (ctx, { periodId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("performanceReviews")
      .withIndex("by_period_employee", (q) =>
        q.eq("periodId", periodId).eq("employeeId", userId)
      )
      .first();
  },
});

// ── allMyReviews — full history for the current user, with period names ───────

export const allMyReviews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const reviews = await ctx.db
      .query("performanceReviews")
      .withIndex("by_employee", (q) => q.eq("employeeId", userId))
      .order("desc")
      .collect();
    return await Promise.all(
      reviews.map(async (r) => {
        const period = await ctx.db.get(r.periodId);
        return {
          ...r,
          periodName:   period?.name   ?? "Unknown",
          periodStatus: period?.status ?? "Closed",
          periodStart:  period?.startDate ?? "",
          periodEnd:    period?.endDate   ?? "",
        };
      })
    );
  },
});

// ── teamReviews — all reviews for a period, enriched with user data ───────────

export const teamReviews = query({
  args: { periodId: v.id("performancePeriods") },
  handler: async (ctx, { periodId }) => {
    return await ctx.db
      .query("performanceReviews")
      .withIndex("by_period", (q) => q.eq("periodId", periodId))
      .collect();
  },
});

// ── createPeriod ───────────────────────────────────────────────────────────────

export const createPeriod = mutation({
  args: {
    name:      v.string(),
    type:      v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annually")),
    startDate: v.string(),
    endDate:   v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Close any existing active periods
    const active = await ctx.db
      .query("performancePeriods")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
    for (const p of active) {
      await ctx.db.patch(p._id, { status: "Closed" });
    }

    return await ctx.db.insert("performancePeriods", {
      name:      args.name,
      type:      args.type,
      startDate: args.startDate,
      endDate:   args.endDate,
      status:    "Active",
      createdById: userId,
    });
  },
});

// ── closePeriod ────────────────────────────────────────────────────────────────

export const closePeriod = mutation({
  args: { id: v.id("performancePeriods") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "Closed" });
  },
});

// ── upsertReview ───────────────────────────────────────────────────────────────

export const upsertReview = mutation({
  args: {
    periodId:            v.id("performancePeriods"),
    employeeId:          v.id("users"),
    billableHours:       v.optional(v.number()),
    billableHoursTarget: v.optional(v.number()),
    casesHandled:        v.optional(v.number()),
    casesClosed:         v.optional(v.number()),
    overallScore:        v.optional(v.number()),
    kpis: v.optional(
      v.array(
        v.object({
          name:   v.string(),
          target: v.number(),
          actual: v.number(),
          unit:   v.optional(v.string()),
        })
      )
    ),
    notes:  v.optional(v.string()),
    status: v.union(v.literal("Draft"), v.literal("Submitted")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reviewer  = await ctx.db.get(userId);
    const employee  = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");

    const existing = await ctx.db
      .query("performanceReviews")
      .withIndex("by_period_employee", (q) =>
        q.eq("periodId", args.periodId).eq("employeeId", args.employeeId)
      )
      .first();

    const data = {
      periodId:            args.periodId,
      employeeId:          args.employeeId,
      employeeName:        employee.name ?? employee.email ?? "Unknown",
      reviewerId:          userId,
      reviewerName:        reviewer?.name ?? reviewer?.email ?? "Manager",
      billableHours:       args.billableHours,
      billableHoursTarget: args.billableHoursTarget,
      casesHandled:        args.casesHandled,
      casesClosed:         args.casesClosed,
      overallScore:        args.overallScore,
      kpis:                args.kpis,
      notes:               args.notes,
      status:              args.status,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }
    return await ctx.db.insert("performanceReviews", data);
  },
});
