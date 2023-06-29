import fs from "fs"
import { Config } from "drizzle-kit"

const schemaFiles = fs
  .readdirSync("src/db/schema")
  .filter((file) => file.endsWith(".ts"))

export default {
  schema: schemaFiles.map((file) => `src/db/schema/${file}`),
  out: "./src/db/migrations",
} satisfies Config
