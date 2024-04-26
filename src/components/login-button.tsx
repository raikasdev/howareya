"use client";
import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export function LoginButton({ session }: { session: Session | null }) {
  const router = useRouter();
  return (
    <Button
      onClick={() =>
        session
          ? router.push("/dashboard")
          : signIn("google", { callbackUrl: "/dashboard" })
      }
      className="max-w-screen w-64"
    >
      {session ? "Dashboard" : "Sign up using Google"}
    </Button>
  );
}
