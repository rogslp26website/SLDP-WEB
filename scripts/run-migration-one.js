/**
 * Run a single migration file by name.
 * Usage: node -r dotenv/config scripts/run-migration-one.js 011_admin_resources.sql
 */

const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

async function main() {
  const file = process.argv[2];
  if (!file || !file.endsWith(".sql")) {
    console.error("Usage: node -r dotenv/config scripts/run-migration-one.js <filename.sql>");
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL (e.g. in .env or .env.local).");
    process.exit(1);
  }
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", file);
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing:", sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Ran:", file);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
