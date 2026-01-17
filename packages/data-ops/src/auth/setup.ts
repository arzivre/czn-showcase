import { betterAuth, type BetterAuthOptions } from "better-auth";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const createBetterAuth = (config: {
  database: BetterAuthOptions["database"];
  secret?: BetterAuthOptions["secret"];
  socialProviders?: BetterAuthOptions["socialProviders"];
}): ReturnType<typeof betterAuth> => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: config.database,
    secret: config.secret,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: config.socialProviders,
    user: {
      modelName: "auth_user",
    },
    session: {
      modelName: "auth_session",
    },
    verification: {
      modelName: "auth_verification",
    },
    account: {
      modelName: "auth_account",
    },
    disablePaths: ["/is-username-available"],
    plugins: [
      username(),
      tanstackStartCookies()
    ]
  });
};
