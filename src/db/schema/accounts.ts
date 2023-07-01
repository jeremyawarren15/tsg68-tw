import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

import { users } from "./users"

export const providerTypes = pgEnum("providerTypes", [
  "oauth",
  "email",
  "credentials",
])

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull(),
  type: providerTypes("type").notNull(),
  provider: varchar("provider").notNull(),
  providerAccountId: varchar("providerAccountId").notNull(),
  refreshToken: varchar("refreshToken").notNull(),
  expiresAt: integer("expiresAt"),
  token_type: varchar("token_type").notNull(),
  scope: varchar("scope").notNull(),
  id_token: varchar("id_token").notNull(),
  session_state: varchar("session_state").notNull(),
})

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))
