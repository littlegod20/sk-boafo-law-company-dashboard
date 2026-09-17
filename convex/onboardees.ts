import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

// ── list ─────────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("onboardees").order("desc").collect();
  },
});

// ── create ───────────────────────────────────────────────────────────────────

const DEFAULT_CHECKLIST = [
  { task: "Offer letter signed",          done: false, category: "Pre-arrival" },
  { task: "Right to work documents",       done: false, category: "Pre-arrival" },
  { task: "IT setup request submitted",    done: false, category: "Pre-arrival" },
  { task: "Desk & access card arranged",   done: false, category: "Pre-arrival" },
  { task: "Orientation meeting scheduled", done: false, category: "Week 1" },
  { task: "Introduction to team",          done: false, category: "Week 1" },
  { task: "System access confirmed",       done: false, category: "Week 1" },
  { task: "HR induction completed",        done: false, category: "Week 1" },
  { task: "First matter assigned",         done: false, category: "Month 1" },
  { task: "30-day check-in",               done: false, category: "Month 1" },
];

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    dept: v.string(),
    startDate: v.string(),
    buddy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("onboardees", {
      name: args.name,
      role: args.role,
      dept: args.dept,
      startDate: args.startDate,
      stage: "Pre-arrival",
      progress: 0,
      buddy: args.buddy,
      addedById: userId ?? undefined,
      checklist: DEFAULT_CHECKLIST,
    });
  },
});

// ── toggleTask ────────────────────────────────────────────────────────────────

function deriveStage(checklist: { done: boolean; category: string }[]): {
  stage: "Pre-arrival" | "Week 1" | "Month 1" | "Completed";
  progress: number;
} {
  const total  = checklist.length;
  const done   = checklist.filter((c) => c.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const allPre   = checklist.filter((c) => c.category === "Pre-arrival").every((c) => c.done);
  const allWeek1 = checklist.filter((c) => c.category === "Week 1").every((c) => c.done);
  const allMon1  = checklist.filter((c) => c.category === "Month 1").every((c) => c.done);

  let stage: "Pre-arrival" | "Week 1" | "Month 1" | "Completed";
  if (allMon1 && allWeek1 && allPre) {
    stage = "Completed";
  } else if (allPre && allWeek1) {
    stage = "Month 1";
  } else if (allPre) {
    stage = "Week 1";
  } else {
    stage = "Pre-arrival";
  }

  return { stage, progress };
}

export const toggleTask = mutation({
  args: { id: v.id("onboardees"), taskIndex: v.number() },
  handler: async (ctx, { id, taskIndex }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Onboardee not found");

    const checklist = record.checklist.map((item, idx) =>
      idx === taskIndex ? { ...item, done: !item.done } : item
    );

    const { stage, progress } = deriveStage(checklist);
    await ctx.db.patch(id, { checklist, stage, progress });
  },
});

// ── markComplete ──────────────────────────────────────────────────────────────

export const markComplete = mutation({
  args: { id: v.id("onboardees") },
  handler: async (ctx, { id }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Onboardee not found");

    const checklist = record.checklist.map((item) => ({ ...item, done: true }));
    await ctx.db.patch(id, { checklist, stage: "Completed", progress: 100 });
  },
});
