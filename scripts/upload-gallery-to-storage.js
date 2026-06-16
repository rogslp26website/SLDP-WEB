/**
 * One-time script: upload images from "docs and photos" to Supabase Storage bucket "gallery".
 * Run from project root after creating a public bucket named "gallery" in Supabase Dashboard → Storage.
 *
 * Usage: node scripts/upload-gallery-to-storage.js
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (or env)
 */

const path = require("path");
const PROJECT_ROOT = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(PROJECT_ROOT, ".env.local") });
require("dotenv").config({ path: path.join(PROJECT_ROOT, ".env") });

const fs = require("fs");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY;
const GALLERY_ROOT = path.join(PROJECT_ROOT, "docs and photos");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);

function walk(dir, baseDir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, baseDir, out);
    else if (e.isFile() && IMG_EXT.has(path.extname(e.name))) {
      out.push(path.relative(baseDir, full).replace(/\\/g, "/"));
    }
  }
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    const missing = [];
    if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
    if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY (or SERVICE_ROLE_KEY)");
    console.error("Missing in .env.local:", missing.join(", "));
    console.error("Make sure the names match exactly (no extra spaces).");
    process.exit(1);
  }
  const files = [];
  walk(GALLERY_ROOT, GALLERY_ROOT, files);
  if (!files.length) {
    console.log("No images found in docs and photos");
    return;
  }
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const bucket = "Gallery";

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucket)) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error) {
      console.error("Create bucket failed:", error.message);
      process.exit(1);
    }
    console.log("Created public bucket:", bucket);
  }

  let ok = 0;
  let fail = 0;
  for (const filePath of files) {
    const fullPath = path.join(GALLERY_ROOT, filePath);
    const buf = fs.readFileSync(fullPath);
    const { error } = await supabase.storage.from(bucket).upload(filePath, buf, {
      contentType: path.extname(filePath).toLowerCase() === ".png" ? "image/png" : "image/jpeg",
      upsert: true,
    });
    if (error) {
      console.error("Upload failed:", filePath, error.message);
      fail++;
    } else {
      ok++;
      if (ok % 10 === 0) console.log("Uploaded", ok, "/", files.length);
    }
  }
  console.log("Done. Uploaded:", ok, "Failed:", fail);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
