import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

const DEFAULT_ITEMS = [
  { item: "Return of laptop & equipment", done: false, owner: "IT" },
  { item: "Access badge & keys returned",  done: false, owner: "Admin" },
  { item: "System accounts deactivated",   done: false, owner: "IT" },
  { item: "Final timesheet approved",      done: false, owner: "HR" },
  { item: "Handover notes submitted",      done: false, owner: "Manager" },
  { item: "Knowledge transfer completed",  done: false, owner: "Manager" },
  { item: "Final payslip processed",       done: false, owner: "Finance" },
  { item: "Exit interview completed",      done: false, owner: "HR" },
];

// ── list ─────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exitClearances").order("desc").collect();
  },
});

// ── create ───────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    dept: v.string(),
    lastDay: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db.query("exitClearances").collect();
    const seq = String(all.length + 1).padStart(3, "0");
    const exitRef = `EXIT-${new Date().getFullYear()}-${seq}`;

    return await ctx.db.insert("exitClearances", {
      exitRef,
      name: args.name,
      role: args.role,
      dept: args.dept,
      lastDay: args.lastDay,
      reason: args.reason,
      status: "In Progress",
      initiatedById: userId ?? undefined,
      clearanceItems: DEFAULT_ITEMS,
    });
  },
});

// ── toggleItem ────────────────────────────────────────────────────────────────

export const toggleItem = mutation({
  args: { id: v.id("exitClearances"), itemIndex: v.number() },
  handler: async (ctx, { id, itemIndex }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Exit clearance not found");

    const clearanceItems = record.clearanceItems.map((item, idx) =>
      idx === itemIndex ? { ...item, done: !item.done } : item
    );

    const allDone = clearanceItems.every((item) => item.done);
    const status = allDone ? "Cleared" : "In Progress";

    await ctx.db.patch(id, { clearanceItems, status });
  },
});

// ── markCleared (bulk) ────────────────────────────────────────────────────────

export const markCleared = mutation({
  args: { ids: v.array(v.id("exitClearances")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      const record = await ctx.db.get(id);
      if (!record) continue;
      const clearanceItems = record.clearanceItems.map((item) => ({ ...item, done: true }));
      await ctx.db.patch(id, { clearanceItems, status: "Cleared" });
    }
  },
});
