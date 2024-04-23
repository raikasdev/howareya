/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { contacts, users } from "~/server/db/schema";

function calApiUrl(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://api.cal.com/api/v1${endpoint}`);
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    search.set(key, val);
  }
  url.search = search.toString();

  return url;
}

async function callCal(endpoint: string, params: Record<string, string>) {
  const url = calApiUrl(endpoint, params);

  try {
    const res = await fetch(url);
    const json = (await res.json()) as Record<string, unknown>;

    return json;
  } catch (e) {
    return null;
  }
}

async function getEventType(username: string, eventSlug: string) {
  const url = new URL(`https://cal.com/api/trpc/public/event`);
  const params = new URLSearchParams();
  params.set(
    "input",
    JSON.stringify({
      json: {
        username,
        eventSlug,
        isTeamEvent: false,
        org: null,
      },
    }),
  );
  url.search = params.toString();

  try {
    const res = await fetch(url.toString());
    const json = (await res.json()) as {
      result: {
        data: {
          json: {
            id: number;
            title: string;
            length: number;
          };
        };
      };
    };

    return json.result.data.json;
  } catch (e) {
    return null;
  }
}

async function getSlots({
  username,
  eventSlug,
  from,
  to,
  timeZone,
}: {
  username: string;
  eventSlug: string;
  from: string;
  to: string;
  timeZone: string;
}) {
  const url = new URL(`https://cal.com/api/trpc/public/slots.getSchedule`);
  const params = new URLSearchParams();
  params.set(
    "input",
    JSON.stringify({
      json: {
        isTeamEvent: false,
        usernameList: [username],
        eventTypeSlug: eventSlug,
        startTime: from,
        endTime: to,
        timeZone: timeZone,
        duration: null,
        rescheduleUid: null,
        orgSlug: null,
      },
      meta: { values: { duration: ["undefined"], orgSlug: ["undefined"] } },
    }),
  );
  url.search = params.toString();

  try {
    const res = await fetch(url.toString());
    const json = (await res.json()) as {
      result: {
        data: {
          json: {
            slots: Record<string, { time: string }[]>;
          };
        };
      };
    };

    return json.result.data.json;
  } catch (e) {
    return null;
  }
}

const handler = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const rows = await db.select().from(contacts).all();

  // ** Do epic calculations here **
  const userMap = new Map<string, typeof rows>();
  for (const row of rows) {
    const userRows = userMap.get(row.createdById) ?? [];
    userRows.push(row);
    userMap.set(row.createdById, userRows);
  }

  for (const [userId, rows] of userMap.entries()) {
    const user = (
      await db.select().from(users).where(eq(users.id, userId)).limit(1)
    )[0];
    if (!user?.apiKey) continue;

    const me = (await callCal("/me", { apiKey: user.apiKey })) as {
      user: {
        id: string;
        timeZone: string;
        locale: string;
        email: string;
        name: string;
      };
    };
    const myAvailability = await callCal("/availability", {
      apiKey: user.apiKey,
      userId: me.user.id ?? "unknown",
      dateFrom: "2024-04-24",
      dateTo: "2024-05-01",
    });
    await Promise.all(
      rows.map(async (row) => {
        const url = new URL(row.url ?? "https://cal.com");
        const [_, username, eventSlug] = url.pathname.split("/");
        if (!username || !eventSlug) return;
        const eventType = await getEventType(username, eventSlug);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const slots = await getSlots({
          from: new Date().toUTCString(),
          to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(),
          username,
          eventSlug,
          timeZone: me.user.timeZone,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });

        const reqHeaders = new Headers();
        reqHeaders.set("Content-Type", "application/json");

        const res = await fetch(
          calApiUrl("/bookings", { apiKey: user.apiKey ?? "unknown" }),
          {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify({
              eventTypeId: eventType?.id,
              start:
                (slots!.slots["2024-04-24"]![0]!.time as unknown as string) ??
                "",
              responses: {
                name: me.user.name,
                email: me.user.email,
              },
              metadata: {},
              timeZone: me.user.timeZone,
              language: me.user.locale ?? "en",
              title: "test",
            }),
          },
        );
        const json = (await res.json()) as Record<string, unknown>;
        console.log(json);
      }),
    );
  }

  return new NextResponse(JSON.stringify(rows), {
    status: 200,

    headers: {
      "Content-Type": "application/json",
    },
  });
};

export { handler as GET };
