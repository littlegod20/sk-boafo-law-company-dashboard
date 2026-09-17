import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { existingUserId, profile } = args;
      // Auth callback ctx is typed as AnyDataModel; use our schema-aware db for indexes
      const db = (ctx as MutationCtx).db;

      // If the auth account is already linked to a users row, just return it
      if (existingUserId) {
        return existingUserId;
      }

      // Check for a seeded user with the same email so login links to their profile
      if (profile.email) {
        const seeded = await db
          .query("users")
          .withIndex("email", (q) => q.eq("email", profile.email!))
          .unique();
        if (seeded) {
          return seeded._id;
        }
      }

      // No existing row — create a bare user record; profile fields filled by seed or later update
      const email = typeof profile.email === "string" ? profile.email : undefined;
      const name =
        typeof profile.name === "string"
          ? profile.name
          : email;
      return await db.insert("users", {
        email,
        name,
        isAnonymous: false,
      });
    },
  },
});
