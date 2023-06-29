import { relations } from "drizzle-orm"
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

import { users } from "./users"

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  sessionToken: varchar("sessionToken").notNull(),
  userId: uuid("userId").notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))
