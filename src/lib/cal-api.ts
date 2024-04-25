export function calApiUrl(endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://api.cal.com/api/v1${endpoint}`);
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    search.set(key, val);
  }
  url.search = search.toString();

  return url;
}

export async function callCal(
  endpoint: string,
  params: Record<string, string>,
) {
  const url = calApiUrl(endpoint, params);

  try {
    const res = await fetch(url);
    const json = (await res.json()) as Record<string, unknown>;

    return json;
  } catch (e) {
    return null;
  }
}

export async function getEventType(username: string, eventSlug: string) {
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

export async function getSlots({
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

// An function that checks if two dates are in between a range
export function isBetween(
  startDate: Date,
  endDate: Date,
  date: Date,
  minutes: number,
) {
  return (
    date >= startDate &&
    new Date(date.getTime() + minutes * 60 * 1000) <= endDate
  );
}

// Function that gets the hour and minutes as numbers ({ hour: number; minutes: number; }) of a date on a specified timezone
function getHour(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone,
  });
  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find((i) => i.type === "hour")!.value);

  return hour;
}

export function isWithinPreferredTime(
  date: Date,
  timeZone: string,
  preference: TimePreference,
) {
  const hour = getHour(date, timeZone);
  switch (preference) {
    case "morning":
      return hour < 11;
    case "lunchtime":
      return hour >= 11 && hour < 14;
    case "afternoon":
      return hour >= 14 && hour < 17;
    case "evening":
      return hour >= 17;
    case "any":
    default:
      return true;
  }
}

export function hasEnoughTimePassed(date: Date, frequency: Frequency) {
  const daysSince = Math.round(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  switch (frequency) {
    case "weekly":
      return daysSince >= 4;
    case "biweekly":
      return daysSince >= 11;
    case "monthly":
      return daysSince >= 25;
    case "quarterly":
      return daysSince >= 85;
    case "annually":
      return daysSince >= 350;
    default:
      return true;
  }
}
