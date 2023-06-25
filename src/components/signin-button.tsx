"use client"

import { signIn, signOut, useSession } from "next-auth/react"

import { Button } from "./ui/button"

export function SignInButton() {
  const session = useSession()
  if (!session) {
    return <Button onClick={() => signIn("auth0")}>Sign In</Button>
  }

  return <Button onClick={() => signOut()}>Sign Out</Button>
}
