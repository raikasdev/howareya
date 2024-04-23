import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "turso",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  tablesFilter: ["checkin_*"],
} satisfies Config;
