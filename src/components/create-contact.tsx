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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { UserPlus } from "lucide-react";

// TODO: after create run the schedule query
export function CreateContact() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [timePreference, setTimePreference] = useState<TimePreference>("any");

  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setMeetingUrl("");
      setFrequency("weekly");
      setTimePreference("any");
    },
  });

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Edit contact</DialogTitle>
            <DialogDescription asChild>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createContact.mutateAsync({
                    name,
                    url: meetingUrl,
                    frequency,
                    timePreference,
                  });
                  setDialogOpen(false);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex w-full flex-col gap-2 text-black">
                  <Label>Name (required)</Label>
                  <Input
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-col gap-2 text-black">
                  <Label>Cal.com meeting URL (required)</Label>
                  <Input
                    type="url"
                    placeholder="Cal.com contact URL"
                    required
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-col gap-2 text-black">
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
                <div className="flex w-full flex-col gap-2 text-black">
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
                <Button type="submit" disabled={createContact.isPending}>
                  {createContact.isPending
                    ? "Creating contact..."
                    : "Create contact"}
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button className="w-full" onClick={() => setDialogOpen(true)}>
        <UserPlus className="mr-2 h-5 w-5" /> Create new contact
      </Button>
    </>
  );
}
