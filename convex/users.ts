import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── getByEmail (internal — used by seed) ────────────────────────────────────

export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
  },
});

// ── getCurrentUser ──────────────────────────────────────────────────────────

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// ── list all active employees ───────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("isAnonymous"), true))
      .collect();
  },
});

// ── get a single user ────────────────────────────────────────────────────────

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── updateProfile ────────────────────────────────────────────────────────────

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    dept: v.optional(v.string()),
    workPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.dept !== undefined) updates.dept = args.dept;
    if (args.workPhone !== undefined) updates.workPhone = args.workPhone;
    await ctx.db.patch(userId, updates);
  },
});

// ── updateRole (admin only — future guard) ───────────────────────────────────

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("managing_partner"),
      v.literal("partner"),
      v.literal("associate"),
      v.literal("paralegal"),
      v.literal("admin"),
      v.literal("hr_officer")
    ),
  },
  handler: async (ctx, { userId, role }) => {
    await ctx.db.patch(userId, { role });
  },
});

// ── setActive ────────────────────────────────────────────────────────────────

export const setActive = mutation({
  args: { userId: v.id("users"), isActive: v.boolean() },
  handler: async (ctx, { userId, isActive }) => {
    await ctx.db.patch(userId, { isActive });
  },
});

// ── update (full employee edit by HR) ────────────────────────────────────────

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    workPhone: v.optional(v.string()),
    dept: v.optional(v.string()),
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
    isActive: v.optional(v.boolean()),
    joinedDate: v.optional(v.string()),
    barNumber: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
  },
});
