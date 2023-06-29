import { randomUUID } from "crypto"
import { InferModel, and, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "next-auth/adapters"
import postgres from "postgres"
import { accounts } from "src/db/schema/accounts"
import { sessions } from "src/db/schema/sessions"
import { users } from "src/db/schema/users"
import { verificationTokens } from "src/db/schema/verificationTokens"

const client = postgres(process.env.DATABASE_URL as string)
const db = drizzle(client)

type User = InferModel<typeof users>
type Account = InferModel<typeof accounts>
type Session = InferModel<typeof sessions>
type VerificationToken = InferModel<typeof verificationTokens>

function constructAdapterUser(user: User): AdapterUser {
  return {
    ...user,
    id: user.id.toString(),
    emailVerified: user.emailVerified,
    email: user.email,
  }
}

function constructAdapterAccount(account: AdapterAccount): Account {
  return {
    id: randomUUID(), // Assuming you're using UUID v4 for IDs
    userId: account.userId.toString(),
    type: "oauth", // Fill this in as necessary
    provider: account.provider,
    providerAccountId: account.providerAccountId.toString(),
    refreshToken: (account.refreshToken as string) || "",
    expiresAt: account.accessTokenExpires
      ? new Date(account.accessTokenExpires as number).getTime()
      : 0,
    token_type: "Bearer", // Fill this in as necessary
    scope: "email", // Fill this in as necessary
    id_token: "", // Fill this in as necessary
    session_state: "", // Fill this in as necessary
  }
}

function constructAdapterSession(session: Session): AdapterSession {
  return {
    ...session,
    sessionToken: session.sessionToken,
    userId: session.userId.toString(),
    expires: session.expires,
  }
}

export default function DrizzleAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const allUsers = await db
        .insert(users)
        .values({ ...user })
        .returning()
      const firstUser = allUsers[0]
      return constructAdapterUser(firstUser)
    },
    async getUser(id: string) {
      const allUsers = await db.select().from(users).where(eq(users.id, id))
      const firstUser = allUsers[0]
      return constructAdapterUser(firstUser)
    },
    async getUserByEmail(email: string) {
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
      const firstUser = allUsers[0]
      return constructAdapterUser(firstUser)
    },
    async getUserByAccount({
      providerAccountId,
      provider,
    }: Pick<Account, "providerAccountId" | "provider">) {
      if (!providerAccountId || !provider) return null

      const dbAccount = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId),
            eq(accounts.provider, provider)
          )
        )
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0])
      if (!dbAccount || !dbAccount.users) return null
      return constructAdapterUser(dbAccount.users)
    },
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      if (!user.id) {
        throw new Error("No user id.")
      }

      const updatedUsers = await db
        .update(users)
        .set(user)
        .where(eq(users.id, user.id))
        .returning()
      return constructAdapterUser(updatedUsers[0])
    },
    async deleteUser(userId: string) {
      await Promise.all([
        db.delete(users).where(eq(users.id, userId)),
        db.delete(sessions).where(eq(sessions.userId, userId)),
        db.delete(accounts).where(eq(accounts.userId, userId)),
      ])

      return null
    },
    async linkAccount(account: AdapterAccount) {
      const mappedAccount = constructAdapterAccount(account)
      const newAccount = await db
        .insert(accounts)
        .values(mappedAccount)
        .returning()

      return newAccount[0] ? constructAdapterAccount(newAccount[0]) : null
    },
    async unlinkAccount(
      providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">
    ) {
      if (!providerAccountId.providerAccountId || !providerAccountId.provider)
        return

      await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, providerAccountId.providerAccountId),
            eq(accounts.provider, providerAccountId.provider)
          )
        )
    },
    async createSession({
      sessionToken,
      userId,
      expires,
    }: {
      sessionToken: string
      userId: string
      expires: Date
    }): Promise<AdapterSession> {
      const newSession = await db
        .insert(sessions)
        .values({
          sessionToken,
          userId,
          expires,
        })
        .returning()

      if (!newSession[0]) {
        throw new Error("Failed to create session.")
      }

      return constructAdapterSession(newSession[0])
    },
    async getSessionAndUser(sessionToken: string) {
      return (
        (await db
          .select({ session: sessions, user: users })
          .from(sessions)
          .where(eq(sessions.sessionToken, sessionToken))
          .innerJoin(users, eq(users.id, sessions.userId))
          .then((res) => res[0])) ?? null
      )
    },
    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) {
      const updatedSessions = await db
        .update(sessions)
        .set(session)
        .where(eq(sessions.sessionToken, session.sessionToken))
        .returning()

      return updatedSessions[0]
        ? constructAdapterSession(updatedSessions[0])
        : null
    },
    async deleteSession(sessionToken: string) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken))
    },
    async createVerificationToken({
      identifier,
      token,
      expires,
    }: VerificationToken) {
      await db
        .insert(verificationTokens)
        .values({
          identifier,
          token,
          expires,
        })
        .returning()

      return null
    },
    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string
      token: string
    }) {
      const tokenRecord = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .execute()

      if (!tokenRecord || tokenRecord.length === 0) {
        throw new Error("No verification token found.")
      }

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
        .execute()

      return null
    },
  }
}
