import { cronTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger";
import { db } from "~/server/db";
import { contacts } from "~/server/db/schema";
import runBook from "~/jobs/book";

client.defineJob({
  id: "schedule",
  name: "Schedule cal.com",
  version: "0.0.1",
  trigger: cronTrigger({
    cron: "0 12 * * *",
  }),
  run: async (_payload, io, _ctx) => {
    const rows = await io.runTask("get-contacts", async () => {
      return await db.select().from(contacts).all();
    });

    await runBook(rows, io);
  },
});
