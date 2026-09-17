import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── list ────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("announcements").order("desc").collect();
  },
});

// ── listPinned ────────────────────────────────────────────────────────────────

export const listPinned = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_pinned", (q) => q.eq("pinned", true))
      .collect();
  },
});

// ── create ────────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    audience: v.string(),
    category: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const author = await ctx.db.get(userId);
    if (!author) throw new Error("Author not found");

    return await ctx.db.insert("announcements", {
      title: args.title,
      content: args.content,
      authorId: userId,
      authorName: author.name ?? author.email ?? "Unknown",
      audience: args.audience,
      category: args.category,
      pinned: args.pinned ?? false,
    });
  },
});

// ── togglePin ────────────────────────────────────────────────────────────────

export const togglePin = mutation({
  args: { id: v.id("announcements"), pinned: v.boolean() },
  handler: async (ctx, { id, pinned }) => {
    await ctx.db.patch(id, { pinned });
  },
});

// ── remove ───────────────────────────────────────────────────────────────────

export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
