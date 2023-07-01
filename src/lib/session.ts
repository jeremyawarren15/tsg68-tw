import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@config/auth"

export async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")
  return session
}
