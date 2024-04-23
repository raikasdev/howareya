"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Contact } from "~/app/_components/contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Frequency = "weekly" | "biweekly" | "monthly";
type TimePreference = "any" | "morning" | "lunchtime" | "afternoon" | "evening";

export function EditContact({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState(contact.url ?? "");
  const [frequency, setFrequency] = useState<Frequency>(
    (contact.frequency ?? "weekly") as unknown as Frequency,
  );
  const [timePreference, setTimePreference] = useState<TimePreference>(
    (contact.timePreference ?? "any") as unknown as TimePreference,
  );

  const updateContact = api.contact.update.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const deleteContact = api.contact.delete.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <div className="flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Edit contact</DialogTitle>
            <DialogDescription>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateContact.mutateAsync({
                    id: contact.id,
                    url: meetingUrl,
                    frequency,
                    timePreference,
                  });
                  setDialogOpen(false);
                }}
                className="flex flex-col gap-4 text-black"
              >
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
                      <SelectItem value="morning">
                        🌅 Morning (Before 11:00)
                      </SelectItem>
                      <SelectItem value="lunchtime">
                        🥪 Lunchtime (11:00-14:00)
                      </SelectItem>
                      <SelectItem value="afternoon">
                        💻 Afternoon (14:00-17:00)
                      </SelectItem>
                      <SelectItem value="evening">
                        🌆 Evening (17:00-)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={updateContact.isPending}>
                  {updateContact.isPending
                    ? "Saving contact..."
                    : "Save contact"}
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setDialogOpen(true)}>Edit contact</Button>
      <Button
        variant="destructive"
        onClick={() => {
          deleteContact.mutate({ id: contact.id });
        }}
      >
        Remove contact
      </Button>
    </div>
  );
}
