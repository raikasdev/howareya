import type { IO } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { contacts, users } from "~/server/db/schema";
import {
  calApiUrl,
  callCal,
  getEventType,
  getSlots,
  hasEnoughTimePassed,
  isBetween,
  isWithinPreferredTime,
} from "~/lib/cal-api";
import { eq } from "drizzle-orm";

export default async function runBook(
  rows: {
    id: number;
    name: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date | null;
    url: string | null;
    frequency: string | null;
    timePreference: string | null;
    latestMeeting: Date | null;
  }[],
  io: IO,
  force = false,
) {
  await io.logger.info("rows", rows);

  // ** Do epic calculations here **
  const userMap = new Map<string, typeof rows>();
  for (const row of rows) {
    const userRows = userMap.get(row.createdById) ?? [];
    userRows.push(row);
    userMap.set(row.createdById, userRows);
  }

  for (const [userId, rows] of userMap.entries()) {
    await io.runTask(`process-user-${userId}`, async () => {
      const user = (
        await db.select().from(users).where(eq(users.id, userId)).limit(1)
      )[0];
      await io.logger.info("user", user);
      if (!user?.apiKey) return;

      // Get app user information
      const me = (await callCal("/me", { apiKey: user.apiKey })) as {
        user: {
          id: string;
          timeZone: string;
          locale: string;
          email: string;
          name: string;
        };
      };

      const searchStart = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toUTCString();
      const searchEnd = new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000,
      ).toUTCString();

      const myAvailability = (await callCal("/availability", {
        apiKey: user.apiKey,
        userId: me.user.id ?? "unknown",
        dateFrom: searchStart,
        dateTo: searchEnd,
      })) as { dateRanges: { start: string; end: string }[] };
      await Promise.all(
        rows.map(async (row) => {
          await io.logger.info("row", row);
          if (
            !force &&
            row.latestMeeting &&
            !hasEnoughTimePassed(
              new Date(row.latestMeeting),
              (row.frequency ?? "weekly") as Frequency,
            )
          ) {
            await io.logger.info(
              "Skipped, not enough time has passed since last meeting",
              {
                lastMeeting: row.latestMeeting,
                frequency: row.frequency,
              },
            );
            return;
          }

          const url = new URL(row.url ?? "https://cal.com");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, username, eventSlug] = url.pathname.split("/");
          if (!username || !eventSlug) return;
          const eventType = await io.runTask(
            "get-event-type",
            async () => await getEventType(username, eventSlug),
          );

          if (!eventType) {
            await io.logger.info("Event type not found", {
              username,
              eventSlug,
            });
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const slots = await io.runTask(
            "get-slots",
            async () =>
              await getSlots({
                from: searchStart,
                to: searchEnd,
                username,
                eventSlug,
                timeZone: me.user.timeZone,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }),
          );

          const availableSlots = Object.values(slots?.slots ?? {})
            .flat()
            .map((i) => new Date(i.time))
            .filter(
              (
                i, // Filter if its available for the app user
              ) =>
                myAvailability.dateRanges.some((a) =>
                  isBetween(
                    new Date(a.start),
                    new Date(a.end),
                    i,
                    eventType?.length ?? 15,
                  ),
                ),
            )
            .filter((i) =>
              isWithinPreferredTime(
                i,
                me.user.timeZone,
                (row.timePreference ?? "any") as TimePreference,
              ),
            ) // Make sure the time is within the preferred time for the app user
            .sort(() => 0.5 - Math.random()); // Shuffle results

          await io.logger.info("Available slots", availableSlots);

          const reqHeaders = new Headers();
          reqHeaders.set("Content-Type", "application/json");

          if (availableSlots.length === 0) {
            await io.logger.info("No available slots :(");
            return;
          }
          const slot = availableSlots[0]!;

          await io.logger.info("Booking", {
            eventTypeId: eventType.id,
            start: slot.toUTCString(),
            responses: {
              name: me.user.name,
              email: me.user.email,
              notes: "Automatically scheduled using howareaya.raikas.dev",
            },
            metadata: {
              howareaya: true,
            },
            timeZone: me.user.timeZone,
            language: me.user.locale ?? "en",
            description: "Automatically scheduled using howareaya.raikas.dev",
          });

          await io.runTask("book-appointment", async () => {
            const res = await fetch(
              calApiUrl("/bookings", { apiKey: user.apiKey ?? "unknown" }),
              {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({
                  eventTypeId: eventType.id,
                  start: slot.toUTCString(),
                  responses: {
                    name: me.user.name,
                    email: me.user.email,
                    notes: "Automatically scheduled using howareaya.raikas.dev",
                  },
                  metadata: {
                    howareya: "true",
                  },
                  timeZone: me.user.timeZone,
                  language: me.user.locale ?? "en",
                  description:
                    "Automatically scheduled using howareaya.raikas.dev",
                }),
              },
            );
            const json = (await res.json()) as Record<string, unknown>;
            await io.logger.info("test", json);
          });

          await io.runTask("update-contact", async () => {
            await db
              .update(contacts)
              .set({
                latestMeeting: slot,
              })
              .where(eq(contacts.id, row.id));
          });
        }),
      );
    });
  }
}
