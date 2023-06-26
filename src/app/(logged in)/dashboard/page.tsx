import { redirect } from "next/navigation"

import { getSession } from "@lib/session"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/")
  }
  return <h1>Dashboard Page</h1>
}
