import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug").notNull(),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  startDate: timestamp("startDate", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  endDate: timestamp("endDate", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
})
