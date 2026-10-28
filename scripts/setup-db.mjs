// Creates the database tables from scripts/schema.sql (safe to re-run).
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

for (const statement of schema.split(";").map((s) => s.replace(/--.*$/gm, "").trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("Database tables are ready.");
