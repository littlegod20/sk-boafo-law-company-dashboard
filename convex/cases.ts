import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── list ────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cases").order("desc").collect();
  },
});

// ── listByClient ─────────────────────────────────────────────────────────────

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, { clientId }) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .collect();
  },
});

// ── get ─────────────────────────────────────────────────────────────────────

export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    clientId: v.id("clients"),
    type: v.string(),
    attorney: v.string(),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
    description: v.optional(v.string()),
    court: v.optional(v.string()),
    nextHearing: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    const existing = await ctx.db.query("cases").collect();
    const year = new Date().getFullYear();
    const caseNumber = `SKB-${year}-${String(existing.length + 1).padStart(3, "0")}`;

    const id = await ctx.db.insert("cases", {
      caseNumber,
      title: args.title,
      clientId: args.clientId,
      clientName: client.name,
      clientType: client.type,
      type: args.type,
      status: "Pending",
      priority: args.priority,
      attorney: args.attorney,
      openedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      description: args.description,
      court: args.court,
      nextHearing: args.nextHearing,
    });

    // Increment client case counts
    await ctx.db.patch(args.clientId, {
      totalCases: (client.totalCases ?? 0) + 1,
      activeCases: (client.activeCases ?? 0) + 1,
    });

    return id;
  },
});

// ── updateStatus ─────────────────────────────────────────────────────────────

export const updateStatus = mutation({
  args: {
    id: v.id("cases"),
    status: v.union(
      v.literal("Active"),
      v.literal("Pending"),
      v.literal("On Hold"),
      v.literal("Closed"),
      v.literal("Settled")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

// ── bulkUpdateStatus ──────────────────────────────────────────────────────────

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("cases")),
    status: v.union(
      v.literal("Active"),
      v.literal("Pending"),
      v.literal("On Hold"),
      v.literal("Closed"),
      v.literal("Settled")
    ),
  },
  handler: async (ctx, { ids, status }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { status })));
  },
});

// ── bulkReassign ─────────────────────────────────────────────────────────────

export const bulkReassign = mutation({
  args: { ids: v.array(v.id("cases")), attorney: v.string() },
  handler: async (ctx, { ids, attorney }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { attorney })));
  },
});

// ── remove ───────────────────────────────────────────────────────────────────

export const remove = mutation({
  args: { ids: v.array(v.id("cases")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id) => ctx.db.delete(id)));
  },
});
