"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { Contact } from "~/components/contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { BellMinus, CalendarCheck2, Loader, Pencil, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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

  const snoozeContact = api.contact.snooze.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const forceContact = api.contact.scheduleNow.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Edit contact</DialogTitle>
            <DialogDescription asChild>
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
                className="flex flex-col gap-4"
              >
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
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                snoozeContact.mutate({ id: contact.id });
              }}
            >
              <BellMinus className="mr-2 h-5 w-5" />
              Snooze contact
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Skips the next automatic schedule</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                forceContact.mutate({ id: contact.id });
              }}
              disabled={forceContact.isPending}
            >
              {forceContact.isPending ? (
                <Loader className="mr-2 h-5 w-5" />
              ) : (
                <CalendarCheck2 className="mr-2 h-5 w-5" />
              )}{" "}
              Force-schedule
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Schedules next appointment even if enough time {"hasn't"} passed
              (about a week away)
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex w-full gap-2">
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          <Pencil className="mr-2 h-5 w-5" /> Edit contact
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            deleteContact.mutate({ id: contact.id });
          }}
        >
          <Trash className="mr-2 h-5 w-5" /> Remove contact
        </Button>
      </div>
    </div>
  );
}
