"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

export default function DropdownNav({ email }: { email: string }) {
  return (
    <>
      <DropdownMenuLabel>{email}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
    </>
  );
}
