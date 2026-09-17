import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { hashPbkdf2, verifyPbkdf2 } from "./crypto";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      crypto: {
        hashSecret: hashPbkdf2,
        verifySecret: verifyPbkdf2,
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { existingUserId, profile } = args;

      // If the auth account is already linked to a users row, just return it
      if (existingUserId) {
        return existingUserId;
      }

      // Check for a seeded user with the same email so login links to their profile
      if (profile.email) {
        const seeded = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", profile.email!))
          .unique();
        if (seeded) {
          return seeded._id;
        }
      }

      // No existing row — create a bare user record
      return await ctx.db.insert("users", {
        email: profile.email,
        name: profile.name ?? profile.email,
        isAnonymous: false,
      });
    },
  },
});
