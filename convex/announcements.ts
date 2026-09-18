import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Role sets for audience targeting ─────────────────────────────────────────

const AUDIENCE_ROLES: Record<string, string[]> = {
  "All Staff":   ["managing_partner", "partner", "associate", "paralegal", "admin", "hr_officer"],
  "Everyone":    ["managing_partner", "partner", "associate", "paralegal", "admin", "hr_officer"],
  "All":         ["managing_partner", "partner", "associate", "paralegal", "admin", "hr_officer"],
  "HR":          ["hr_officer", "managing_partner"],
  "Partners":    ["managing_partner", "partner"],
  "Partners Only": ["managing_partner", "partner"],
  "Associates":  ["associate"],
  "Legal Team":  ["managing_partner", "partner", "associate", "paralegal"],
};

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

    const announcementId = await ctx.db.insert("announcements", {
      title: args.title,
      content: args.content,
      authorId: userId,
      authorName: author.name ?? author.email ?? "Unknown",
      audience: args.audience,
      category: args.category,
      pinned: args.pinned ?? false,
    });

    // Notify the relevant audience
    const targetRoles = AUDIENCE_ROLES[args.audience] ?? AUDIENCE_ROLES["All Staff"];
    const allUsers = await ctx.db.query("users").collect();
    const recipients = allUsers.filter(
      (u) => u._id !== userId && u.role && targetRoles.includes(u.role)
    );

    const snippet = args.content.length > 80
      ? args.content.slice(0, 80).trimEnd() + "…"
      : args.content;

    await Promise.all(
      recipients.map((u) =>
        ctx.db.insert("notifications", {
          recipientId: u._id,
          type: "announcement",
          title: args.title,
          body: snippet,
          read: false,
          linkTo: "/announcements",
        })
      )
    );

    return announcementId;
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
