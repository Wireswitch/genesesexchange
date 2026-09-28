"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-foreground/60 hover:text-navy transition-colors"
    >
      Sign out
    </button>
  );
}
