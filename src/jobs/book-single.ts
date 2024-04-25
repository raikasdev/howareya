import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { contacts } from "~/server/db/schema";
import { z } from "zod";
import runBook from "~/jobs/book";

export const bookSingle = client.defineJob({
  id: "schedule-single",
  name: "Schedule cal.com (single contact)",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "schedule.contact",
    schema: z.object({
      id: z.number(),
      userId: z.string(),
    }),
  }),
  run: async (payload, io, _ctx) => {
    const rows = await io.runTask("get-contact", async () => {
      return await db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.id, payload.id),
            eq(contacts.createdById, payload.userId),
          ),
        );
    });

    await runBook(rows, io, true);
  },
});
