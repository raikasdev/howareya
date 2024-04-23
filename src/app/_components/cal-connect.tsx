"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export function CalConnect({
  userProfile,
}: {
  userProfile: { apiKey: string | null };
}) {
  const router = useRouter();
  const [apiKey, setAPIKey] = useState(userProfile?.apiKey ?? "");

  const updateAPIKey = api.user.setAPIKey.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
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
  );
}
