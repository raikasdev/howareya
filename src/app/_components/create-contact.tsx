"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { CardContent, CardFooter } from "~/components/ui/card";

type Frequency = "weekly" | "biweekly" | "monthly";
type TimePreference = "any" | "morning" | "lunchtime" | "afternoon" | "evening";
export function CreateContact({
  userProfile,
}: {
  userProfile: { apiKey: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [timePreference, setTimePreference] = useState<TimePreference>("any");

  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createContact.mutate({
          name,
          url: meetingUrl,
          frequency,
          timePreference,
        });
      }}
    >
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label>Name (required)</Label>
          <Input
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label>Cal.com meeting URL (required)</Label>
          <Input
            type="url"
            placeholder="Cal.com contact URL"
            required
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
          />
        </div>
        <div>
          <Label>Check in frequency (required)</Label>
          <Select
            required
            value={frequency}
            onValueChange={(value) =>
              setFrequency(value as unknown as Frequency)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="How often do you want to check in?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Biweekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Preferred time</Label>
          <Select
            defaultValue="any"
            value={timePreference}
            onValueChange={(value) =>
              setTimePreference(value as unknown as TimePreference)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="What time would you prefer for the check ins?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">⌚ Any time</SelectItem>
              <SelectItem value="morning">🌅 Morning (Before 11:00)</SelectItem>
              <SelectItem value="lunchtime">
                🥪 Lunchtime (11:00-14:00)
              </SelectItem>
              <SelectItem value="afternoon">
                💻 Afternoon (14:00-17:00)
              </SelectItem>
              <SelectItem value="evening">🌆 Evening (17:00-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button disabled={!userProfile.apiKey}>Create contact</Button>
      </CardFooter>
    </form>
  );
}
