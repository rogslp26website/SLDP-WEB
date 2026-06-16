/**
 * Run migrations 007 through 010 only (idempotent). Use when 001-006 are already applied.
 * Usage: node -r dotenv/config scripts/run-migrations-007-010.js
 */
const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

const FILES = [
  "007_schools_principal_coordinator_address.sql",
  "008_notice_attachments.sql",
  "009_schools_columns_and_admin_seed.sql",
  "010_calendar_time_participants.sql",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL (e.g. in .env).");
    process.exit(1);
  }
  const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    for (const file of FILES) {
      const sqlPath = path.join(migrationsDir, file);
      if (!fs.existsSync(sqlPath)) {
        console.error("Missing:", file);
        process.exit(1);
      }
      const sql = fs.readFileSync(sqlPath, "utf8");
      await client.query(sql);
      console.log("Ran:", file);
    }
    console.log("Migrations 007-010 completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
