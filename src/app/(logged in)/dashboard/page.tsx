import { getEvents } from "src/db/helpers/eventHelpers"

import { getSession } from "@lib/session"

async function getAllEvents() {
  return await getEvents()
}

export default async function DashboardPage() {
  const session = await getSession()
  const events = await getAllEvents()

  if (!events) {
    return <h1>Dashboard Page</h1>
  }

  return (
    <>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </>
  )
}
