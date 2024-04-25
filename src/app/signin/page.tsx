"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function SigninPage() {
  useEffect(() => {
    signIn("google", { callbackUrl: "/dashboard" })
      .then(() => null)
      .catch(() => null);
  });

  return (
    <div className="p-4">
      <p>
        Redirecting...
        <br />
        Nothing happening?{" "}
        <Link className="text-blue-500 underline" href="/api/auth/signin">
          Click here
        </Link>
        .
      </p>
    </div>
  );
}
