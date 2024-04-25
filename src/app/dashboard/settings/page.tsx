import Link from "next/link";

import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { CalConnect } from "~/components/cal-connect";
import { api } from "~/trpc/server";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Check, X } from "lucide-react";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) return redirect("/");
  const userProfile = await api.user.me();

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto w-full max-w-6xl items-start gap-6">
        <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>
                {!!userProfile.apiKey
                  ? "Cal.com connection"
                  : "Connect your Cal.com account"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                In order to create reservations on your behalf, we need API
                access to your account. You can create an API key in{" "}
                <Link
                  className="delay-50 underline transition-colors ease-in-out hover:text-blue-700"
                  href="https://app.cal.com/settings/developer/api-keys"
                  target="_blank"
                >
                  your account&apos;s settings
                </Link>
              </p>
              <Alert
                variant={!!userProfile.apiKey ? "success" : "destructive"}
                className="z-0 mt-4"
              >
                {!!userProfile.apiKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertTitle>
                  {!!userProfile.apiKey
                    ? "Connection succesful"
                    : "No API connection"}
                </AlertTitle>
                <AlertDescription>
                  {!!userProfile.apiKey
                    ? "You are now connected to your Cal.com account!"
                    : "Please connect your account by providing an API key above."}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <CalConnect userProfile={userProfile} />
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
