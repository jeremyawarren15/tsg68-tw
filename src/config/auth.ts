import { drizzle } from "drizzle-orm/postgres-js"
import { NextAuthOptions } from "next-auth"
import Auth0 from "next-auth/providers/auth0"
import Github from "next-auth/providers/github"
import postgres from "postgres"

import DrizzleAdapter from "@lib/drizzleAdapter"

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(),
  providers: [
    Auth0({
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      issuer: process.env.AUTH0_ISSUER,
    }),
    Github({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  secret: "hey",
}
