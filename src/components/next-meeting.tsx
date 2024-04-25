"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contact } from "~/components/contact";
import { api } from "~/trpc/react";

export default function NextMeetingInfo({ contact }: { contact: Contact }) {
  const [data, setData] = useState<Record<string, unknown>>(contact);
  const freshContact = api.contact.get.useQuery(
    {
      id: contact.id,
    },
    {
      enabled: !data.latestMeeting,
      refetchInterval: 5000,
    },
  );

  useEffect(() => {
    setData(freshContact.data ?? contact);
  }, [freshContact, contact]);

  const latestContact = useMemo(
    () => freshContact.data ?? contact,
    [freshContact, contact],
  );

  const nextMeeting = useMemo(() => {
    const date = new Date(latestContact.latestMeeting ?? 0);
    if (date.getTime() < Date.now()) return null; // Ignore ones in the past
    return date;
  }, [latestContact.latestMeeting]);

  const [nextMeetingDate, setNextMeetingDate] = useState("loading...");

  useEffect(() => {
    setNextMeetingDate(
      nextMeeting?.toLocaleDateString(navigator.language ?? "en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }) ?? "loading...",
    );
  }, [nextMeeting]);

  return nextMeeting ? (
    <p>
      Next meeting is scheduled at{" "}
      <span className="font-bold">{nextMeetingDate}</span>
    </p>
  ) : (
    <></>
  );
}
