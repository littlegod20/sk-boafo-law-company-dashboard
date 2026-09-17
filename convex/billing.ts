import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── list ────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("desc").collect();
    return await Promise.all(
      invoices.map(async (inv) => {
        const caseDoc = inv.caseId ? await ctx.db.get(inv.caseId) : null;
        return { ...inv, caseNumber: caseDoc?.caseNumber ?? "—" };
      })
    );
  },
});

// ── listByClient ─────────────────────────────────────────────────────────────

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, { clientId }) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .collect();
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    caseId: v.optional(v.id("cases")),
    type: v.string(),
    amount: v.number(),
    attorney: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    lineItems: v.optional(
      v.array(
        v.object({
          description: v.string(),
          hours: v.optional(v.number()),
          rate: v.optional(v.number()),
          amount: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    const existing = await ctx.db.query("invoices").collect();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(existing.length + 1).padStart(3, "0")}`;

    return await ctx.db.insert("invoices", {
      invoiceNumber,
      clientId: args.clientId,
      clientName: client.name,
      caseId: args.caseId,
      type: args.type,
      amount: args.amount,
      status: "Sent",
      issueDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dueDate: args.dueDate,
      attorney: args.attorney,
      description: args.description,
      lineItems: args.lineItems,
    });
  },
});

// ── markPaid ─────────────────────────────────────────────────────────────────

export const markPaid = mutation({
  args: { ids: v.array(v.id("invoices")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id) => ctx.db.patch(id, { status: "Paid" })));
  },
});

// ── void (remove) ─────────────────────────────────────────────────────────────

export const voidInvoices = mutation({
  args: { ids: v.array(v.id("invoices")) },
  handler: async (ctx, { ids }) => {
    await Promise.all(ids.map((id) => ctx.db.delete(id)));
  },
});

// ── updateStatus ─────────────────────────────────────────────────────────────

export const updateStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: v.union(
      v.literal("Draft"),
      v.literal("Sent"),
      v.literal("Paid"),
      v.literal("Overdue"),
      v.literal("Disputed")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});
