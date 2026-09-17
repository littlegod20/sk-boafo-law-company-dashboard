import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── listForMe — messages where I am the recipient ─────────────────────────────

export const listForMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_to", (q) => q.eq("toId", userId))
      .order("desc")
      .collect();
  },
});

// ── listSent — messages I sent ────────────────────────────────────────────────

export const listSent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_from", (q) => q.eq("fromId", userId))
      .order("desc")
      .collect();
  },
});

// ── unreadCount ───────────────────────────────────────────────────────────────

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_to_read", (q) => q.eq("toId", userId).eq("read", false))
      .collect();
    return unread.length;
  },
});

// ── send ──────────────────────────────────────────────────────────────────────

export const send = mutation({
  args: {
    toId: v.id("users"),
    subject: v.string(),
    content: v.string(),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const sender = await ctx.db.get(userId);
    if (!sender) throw new Error("Sender not found");

    return await ctx.db.insert("messages", {
      fromId: userId,
      fromName: sender.name ?? sender.email ?? "Unknown",
      toId: args.toId,
      subject: args.subject,
      content: args.content,
      read: false,
      threadId: args.threadId,
    });
  },
});

// ── markRead ─────────────────────────────────────────────────────────────────

export const markRead = mutation({
  args: { ids: v.array(v.id("messages")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { read: true })));
  },
});

// ── markAllRead ───────────────────────────────────────────────────────────────

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_to_read", (q) => q.eq("toId", userId).eq("read", false))
      .collect();
    await Promise.all(unread.map((m) => ctx.db.patch(m._id, { read: true })));
  },
});
