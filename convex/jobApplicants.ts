import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── listByJob ─────────────────────────────────────────────────────────────────

export const listByJob = query({
  args: { jobId: v.id("jobPostings") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("jobApplicants")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .order("desc")
      .collect();
  },
});

// ── updateStatus ─────────────────────────────────────────────────────────────

export const updateStatus = mutation({
  args: {
    id: v.id("jobApplicants"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Shortlisted"),
      v.literal("Interview"),
      v.literal("Offered"),
      v.literal("Rejected")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});
