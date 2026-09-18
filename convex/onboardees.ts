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

// ── getWithUrls ───────────────────────────────────────────────────────────────

export const getWithUrls = query({
  args: { id: v.id("onboardees") },
  handler: async (ctx, { id }) => {
    const record = await ctx.db.get(id);
    if (!record) return null;

    const profilePictureUrl = record.profilePictureStorageId
      ? await ctx.storage.getUrl(record.profilePictureStorageId)
      : null;
    const cvUrl = record.cvStorageId
      ? await ctx.storage.getUrl(record.cvStorageId)
      : null;
    const extraFiles = await Promise.all(
      (record.extraFiles ?? []).map(async (f) => ({
        name: f.name,
        storageId: f.storageId,
        url: await ctx.storage.getUrl(f.storageId),
      }))
    );

    return { ...record, profilePictureUrl, cvUrl, extraFiles };
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
  const total    = checklist.length;
  const done     = checklist.filter((c) => c.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const allPre   = checklist.filter((c) => c.category === "Pre-arrival").every((c) => c.done);
  const allWeek1 = checklist.filter((c) => c.category === "Week 1").every((c) => c.done);
  const allMon1  = checklist.filter((c) => c.category === "Month 1").every((c) => c.done);

  let stage: "Pre-arrival" | "Week 1" | "Month 1" | "Completed";
  if (allMon1 && allWeek1 && allPre) stage = "Completed";
  else if (allPre && allWeek1)       stage = "Month 1";
  else if (allPre)                   stage = "Week 1";
  else                               stage = "Pre-arrival";

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

// ── updateProfile ─────────────────────────────────────────────────────────────

export const updateProfile = mutation({
  args: {
    id: v.id("onboardees"),
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
    id:       v.id("onboardees"),
    field:    v.union(v.literal("profilePictureStorageId"), v.literal("cvStorageId")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, field, storageId }) => {
    await ctx.db.patch(id, { [field]: storageId });
  },
});

// ── addExtraFile ──────────────────────────────────────────────────────────────

export const addExtraFile = mutation({
  args: {
    id:       v.id("onboardees"),
    name:      v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, name, storageId }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Onboardee not found");
    const extraFiles = [...(record.extraFiles ?? []), { name, storageId }];
    await ctx.db.patch(id, { extraFiles });
  },
});

// ── removeExtraFile ───────────────────────────────────────────────────────────

export const removeExtraFile = mutation({
  args: { id: v.id("onboardees"), index: v.number() },
  handler: async (ctx, { id, index }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Onboardee not found");
    const extraFiles = (record.extraFiles ?? []).filter((_, i) => i !== index);
    await ctx.db.patch(id, { extraFiles });
  },
});

// ── completeOnboarding ────────────────────────────────────────────────────────
// Creates a row in the users table from the onboardee's profile data.

const ROLE_MAP: Record<string, string> = {
  "Managing Partner": "managing_partner",
  "Partner":          "partner",
  "Associate":        "associate",
  "Paralegal":        "paralegal",
  "Admin":            "admin",
  "HR Officer":       "hr_officer",
};

export const completeOnboarding = mutation({
  args: { id: v.id("onboardees") },
  handler: async (ctx, { id }) => {
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Onboardee not found");
    if (record.linkedUserId) throw new Error("Already added to employees");

    const roleKey = ROLE_MAP[record.role] ?? "associate";

    const userId = await ctx.db.insert("users", {
      name:                    record.name,
      role:                    roleKey as "managing_partner" | "partner" | "associate" | "paralegal" | "admin" | "hr_officer",
      dept:                    record.dept,
      joinedDate:              record.startDate,
      isActive:                true,
      personalEmail:           record.personalEmail,
      personalPhone:           record.personalPhone,
      address:                 record.address,
      emergencyContact:        record.emergencyContact,
      profilePictureStorageId: record.profilePictureStorageId,
      cvStorageId:             record.cvStorageId,
      extraFiles:              record.extraFiles,
    });

    // Mark the checklist complete
    const checklist = record.checklist.map((item) => ({ ...item, done: true }));
    await ctx.db.patch(id, { checklist, stage: "Completed", progress: 100, linkedUserId: userId });
    return userId;
  },
});
