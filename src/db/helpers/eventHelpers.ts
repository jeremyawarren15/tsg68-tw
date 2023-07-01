import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { events } from "../schema/events"

const client = postgres(process.env.DATABASE_URL as string)
const db = drizzle(client)

export async function getEvent(slug: string) {
  return await db
    .select()
    .from(events)
    .where(eq(events.slug, slug))
    .then((res) => res[0])
}

export async function getEvents() {
  return await db.select().from(events)
}
