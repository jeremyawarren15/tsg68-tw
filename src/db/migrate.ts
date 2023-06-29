const dotenv = require("dotenv")
const { drizzle } = require("drizzle-orm/postgres-js")
const { migrate } = require("drizzle-orm/postgres-js/migrator")
const postgres = require("postgres")

dotenv.config()

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql)

console.log("Running migrations...")
console.log("using connection string:", connectionString)

migrate(db, { migrationsFolder: "./src/db/migrations" })
  .then(() => {
    console.log("Migrations complete!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Migrations failed!", err)
    process.exit(1)
  })
