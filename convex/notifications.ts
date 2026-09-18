import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── listMine — all notifications for the logged-in user, newest first ────────

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .order("desc")
      .take(50);
  },
});

// ── unreadCount — badge number for the current user ──────────────────────────

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientId", userId).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

// ── markRead — mark a single notification as read ────────────────────────────

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const notif = await ctx.db.get(id);
    // Only allow the recipient to mark their own notification
    if (!notif || notif.recipientId !== userId) return;
    await ctx.db.patch(id, { read: true });
  },
});

// ── markAllRead — mark all of the current user's notifications as read ────────

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientId", userId).eq("read", false)
      )
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});
