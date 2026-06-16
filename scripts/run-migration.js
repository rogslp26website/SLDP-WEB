/**
 * Run all supabase/migrations/*.sql in order against DATABASE_URL.
 * Usage: set DATABASE_URL (or use .env) then run: node -r dotenv/config scripts/run-migration.js
 */

const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL (e.g. in .env or .env.local).");
    process.exit(1);
  }
  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  if (files.length === 0) {
    console.error("No .sql migration files in supabase/migrations");
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, "utf8");
      await client.query(sql);
      console.log("Ran:", file);
    }
    console.log("All migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
