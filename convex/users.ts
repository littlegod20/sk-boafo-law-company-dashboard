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
      .order("desc")
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

// ── getWithUrls ──────────────────────────────────────────────────────────────

export const getWithUrls = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) return null;

    const profilePictureUrl = user.profilePictureStorageId
      ? await ctx.storage.getUrl(user.profilePictureStorageId)
      : null;
    const cvUrl = user.cvStorageId
      ? await ctx.storage.getUrl(user.cvStorageId)
      : null;
    const extraFiles = await Promise.all(
      (user.extraFiles ?? []).map(async (f) => ({
        name:      f.name,
        storageId: f.storageId,
        url:       await ctx.storage.getUrl(f.storageId),
      }))
    );

    return { ...user, profilePictureUrl, cvUrl, extraFiles };
  },
});

// ── updateProfile (self) ────────────────────────────────────────────────────

export const updateProfile = mutation({
  args: {
    name:      v.optional(v.string()),
    dept:      v.optional(v.string()),
    workPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const patch: Record<string, string> = {};
    if (args.name !== undefined)      patch.name      = args.name;
    if (args.dept !== undefined)      patch.dept      = args.dept;
    if (args.workPhone !== undefined) patch.workPhone = args.workPhone;
    await ctx.db.patch(userId, patch);
  },
});

// ── updateRole ───────────────────────────────────────────────────────────────

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
    id:               v.id("users"),
    name:             v.optional(v.string()),
    workPhone:        v.optional(v.string()),
    dept:             v.optional(v.string()),
    role:             v.optional(
      v.union(
        v.literal("managing_partner"),
        v.literal("partner"),
        v.literal("associate"),
        v.literal("paralegal"),
        v.literal("admin"),
        v.literal("hr_officer")
      )
    ),
    isActive:         v.optional(v.boolean()),
    joinedDate:       v.optional(v.string()),
    barNumber:        v.optional(v.string()),
    personalEmail:    v.optional(v.string()),
    personalPhone:    v.optional(v.string()),
    address:          v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ── generateUploadUrl ─────────────────────────────────────────────────────────

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ── saveDocument ──────────────────────────────────────────────────────────────

export const saveDocument = mutation({
  args: {
    id:        v.id("users"),
    field:     v.union(v.literal("profilePictureStorageId"), v.literal("cvStorageId")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, field, storageId }) => {
    await ctx.db.patch(id, { [field]: storageId });
  },
});

// ── addExtraFile ──────────────────────────────────────────────────────────────

export const addExtraFile = mutation({
  args: {
    id:        v.id("users"),
    name:      v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, name, storageId }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    const extraFiles = [...(user.extraFiles ?? []), { name, storageId }];
    await ctx.db.patch(id, { extraFiles });
  },
});

// ── removeExtraFile ───────────────────────────────────────────────────────────

export const removeExtraFile = mutation({
  args: { id: v.id("users"), index: v.number() },
  handler: async (ctx, { id, index }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    const extraFiles = (user.extraFiles ?? []).filter((_, i) => i !== index);
    await ctx.db.patch(id, { extraFiles });
  },
});
