/**
 * Run pending migrations (004, 005). Assumes 001–003 are already applied.
 * Usage: node -r dotenv/config scripts/run-pending-migrations.js
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
  const files = [
    "004_profiles.sql",
    "005_profile_preferences_and_roles.sql",
  ];
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      if (!fs.existsSync(sqlPath)) {
        console.error("Missing:", file);
        process.exit(1);
      }
      const sql = fs.readFileSync(sqlPath, "utf8");
      await client.query(sql);
      console.log("Ran:", file);
    }
    console.log("Pending migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
