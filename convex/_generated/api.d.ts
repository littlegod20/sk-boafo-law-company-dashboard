/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as announcements from "../announcements.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as cases from "../cases.js";
import type * as clients from "../clients.js";
import type * as crypto from "../crypto.js";
import type * as exitClearances from "../exitClearances.js";
import type * as expenseClaims from "../expenseClaims.js";
import type * as http from "../http.js";
import type * as jobApplicants from "../jobApplicants.js";
import type * as jobPostings from "../jobPostings.js";
import type * as leave from "../leave.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as onboardees from "../onboardees.js";
import type * as performance from "../performance.js";
import type * as seed from "../seed.js";
import type * as training from "../training.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  announcements: typeof announcements;
  auth: typeof auth;
  billing: typeof billing;
  cases: typeof cases;
  clients: typeof clients;
  crypto: typeof crypto;
  exitClearances: typeof exitClearances;
  expenseClaims: typeof expenseClaims;
  http: typeof http;
  jobApplicants: typeof jobApplicants;
  jobPostings: typeof jobPostings;
  leave: typeof leave;
  messages: typeof messages;
  notifications: typeof notifications;
  onboardees: typeof onboardees;
  performance: typeof performance;
  seed: typeof seed;
  training: typeof training;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
