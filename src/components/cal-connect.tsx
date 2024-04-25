"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { X } from "lucide-react";

export function CalConnect({
  userProfile,
}: {
  userProfile: { apiKey: string | null };
}) {
  const router = useRouter();
  const [apiKey, setAPIKey] = useState(userProfile?.apiKey ?? "");
  const [error, setError] = useState<string | null>(null);

  const updateAPIKey = api.user.setAPIKey.useMutation({
    onSuccess: (res) => {
      if (res.error) setError(res.error);

      router.refresh();
    },
  });

  return (
    <div className="flex w-full flex-col">
      {error && (
        <Alert variant="destructive" className="z-0 mb-4">
          <X className="h-4 w-4" />
          <AlertTitle>API connection failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateAPIKey.mutate({ apiKey });
        }}
        className="flex w-full flex-col justify-center gap-4 md:flex-row"
      >
        <Input
          type="password"
          placeholder="Cal.com API key"
          value={apiKey}
          required
          onChange={(e) => setAPIKey(e.target.value)}
        />
        <Button type="submit" disabled={updateAPIKey.isPending}>
          {updateAPIKey.isPending
            ? "Authorizing..."
            : !!userProfile.apiKey
              ? "Reconnect your Cal.com account"
              : "Connect your Cal.com account"}
        </Button>
      </form>
    </div>
  );
}
