import { redirect } from "next/dist/server/api-utils"
import { getServerSession } from "next-auth"

import { authOptions } from "@app/api/auth/[...nextAuth]/route"

export async function getSession() {
  return await getServerSession(authOptions)
}
