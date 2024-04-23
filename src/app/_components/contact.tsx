import { CalendarDays, Clock } from "lucide-react";
import { useMemo } from "react";
import { EditContact } from "~/app/_components/edit-contact";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export type Contact = {
  id: number;
  name: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  url: string | null;
  frequency: string | null;
  timePreference: string | null;
};

export default function CalendarContact({ contact }: { contact: Contact }) {
  const timePreference = useMemo(() => {
    switch (contact.timePreference) {
      case "morning":
        return "🌅 Morning (Before 11:00)";
      case "lunchtime":
        return "🥪 Lunchtime (11:00-14:00)";
      case "afternoon":
        return "💻 Afternoon (14:00-17:00)";
      case "evening":
        return "🌆 Evening (17:00-)";
      default:
      case "any":
        return "⌚ Any time";
    }
  }, [contact.timePreference]);

  const frequency = useMemo(() => {
    switch (contact.frequency) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Biweekly";
      default:
      case "monthly":
        return "Monthly";
    }
  }, [contact.frequency]);

  const cleanUrl = useMemo(() => {
    const url = new URL(contact.url ?? "https://cal.com");
    return `${url.hostname}${url.pathname}`;
  }, [contact.url]);

  return (
    <Card x-chunk="dashboard-04-chunk-1" key={contact.id}>
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
        <a
          className="delay-150ms flex items-center gap-1.5 text-gray-600 transition-colors ease-in-out hover:text-gray-900 hover:underline"
          href={contact.url ?? "https://cal.com"}
        >
          <CalendarDays className="h-5 w-5" /> {cleanUrl}
        </a>
        <p className="flex items-center gap-1.5 text-base text-gray-600">
          <Clock className="h-5 w-5" /> {frequency} in the {timePreference}
        </p>
      </CardHeader>
      <CardContent>
        <p>
          Next meeting is scheduled at{" "}
          <span className="font-bold">
            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-GB",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              },
            )}
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <EditContact contact={contact} />
      </CardFooter>
    </Card>
  );
}
