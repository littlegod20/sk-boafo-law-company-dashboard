import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── list ────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").collect();
  },
});

// ── get ─────────────────────────────────────────────────────────────────────

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("Corporate"), v.literal("Individual"), v.literal("Trust")),
    contact: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    company: v.optional(v.string()),
    attorney: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("clients").collect();
    const clientRef = `CLT-${String(existing.length + 1).padStart(3, "0")}`;
    return await ctx.db.insert("clients", {
      clientRef,
      name: args.name,
      type: args.type,
      contact: args.contact,
      email: args.email,
      address: args.address,
      company: args.company,
      attorney: args.attorney,
      status: "Active",
      joined: new Date().toLocaleString("en-GB", { month: "short", year: "numeric" }),
      activeCases: 0,
      totalCases: 0,
    });
  },
});

// ── assignAttorney ───────────────────────────────────────────────────────────

export const assignAttorney = mutation({
  args: { ids: v.array(v.id("clients")), attorney: v.string() },
  handler: async (ctx, { ids, attorney }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { attorney })));
  },
});

// ── remove ───────────────────────────────────────────────────────────────────

export const remove = mutation({
  args: { ids: v.array(v.id("clients")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id) => ctx.db.delete(id)));
  },
});
