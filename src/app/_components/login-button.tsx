"use client";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

export function LoginButton({ session }: { session: Session | null }) {
  return (
    <button
      onClick={() => (session ? signOut() : signIn("google"))}
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      {session ? "Sign out" : "Sign in"}
    </button>
  );
}
