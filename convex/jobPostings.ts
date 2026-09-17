import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── list ─────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobPostings").order("desc").collect();
  },
});

// ── get ──────────────────────────────────────────────────────────────────────

export const get = query({
  args: { id: v.id("jobPostings") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    dept: v.string(),
    hiringManagerName: v.string(),
    closingDate: v.string(),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const year = now.getFullYear();
    const allJobs = await ctx.db.query("jobPostings").collect();
    const seq = String(allJobs.length + 1).padStart(3, "0");
    const jobRef = `REC-${year}-${seq}`;

    const postedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return await ctx.db.insert("jobPostings", {
      jobRef,
      title: args.title,
      dept: args.dept,
      status: "Open",
      applications: 0,
      postedDate,
      closingDate: args.closingDate,
      hiringManagerName: args.hiringManagerName,
      priority: args.priority,
      description: args.description,
      requirements: args.requirements,
    });
  },
});

// ── closePostings (bulk) ─────────────────────────────────────────────────────

export const closePostings = mutation({
  args: { ids: v.array(v.id("jobPostings")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { status: "Closed" });
    }
  },
});
