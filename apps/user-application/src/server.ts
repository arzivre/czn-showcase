// src/server.ts - TanStack Start Server Entry
import { setAuth } from "@repo/data-ops/auth/server";
import { generateUniqueUsername, isUsernameTaken } from "@repo/data-ops/auth/is-username-taken";
import { initDatabase } from "@repo/data-ops/database/setup";
import handler from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";
import { generateRandomDisplayName } from "./utils/random-display-name";

export default {
  fetch(request: Request) {
    const db = initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    });

    setAuth({
      secret: env.BETTER_AUTH_SECRET,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          mapProfileToUser: async (profile) => {
            const username = await generateUniqueUsername(
              profile.name,
              isUsernameTaken
            );
            return {
              username: username,
              displayUsername: generateRandomDisplayName(),
            };
          },
        },
        discord: {
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
          permissions: 2048 | 16384,
          mapProfileToUser: async (profile) => {
            const username = await generateUniqueUsername(
              profile.username,
              isUsernameTaken
            );
            return {
              username: username,
              displayUsername: profile.display_name ? profile.display_name : generateRandomDisplayName()
            };
          },
        },
      },
      adapter: {
        drizzleDb: db,
        provider: "pg",
      },
    });

    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
