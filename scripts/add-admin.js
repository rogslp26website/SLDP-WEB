/**
 * Add an admin by email to salt_hub_admins.
 * The user must already exist in Supabase Auth (sign up first), or they will be invited.
 * Usage: node -r dotenv/config scripts/add-admin.js [email]
 * Example: node -r dotenv/config scripts/add-admin.js leokimandula@gmail.com
 */

const { createClient } = require("@supabase/supabase-js");

const email = process.argv[2] || "leokimandula@gmail.com";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Find user by email (list users and filter)
  let authUserId = null;
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("Failed to list users:", error.message);
      process.exit(1);
    }
    const user = data.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      authUserId = user.id;
      break;
    }
    if (data.users.length < perPage) break;
    page++;
  }

  if (!authUserId) {
    console.log("User not found in Auth. Sending invite to", email, "...");
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/dashboard`
        : undefined,
    });
    if (inviteError) {
      console.error("Invite failed:", inviteError.message);
      process.exit(1);
    }
    if (inviteData.user) {
      authUserId = inviteData.user.id;
      console.log("Invite sent. Adding to admins...");
    } else {
      console.error("Could not create or find user.");
      process.exit(1);
    }
  }

  const { error: insertError } = await supabase.from("salt_hub_admins").insert({ auth_user_id: authUserId });
  if (insertError) {
    if (insertError.code === "23505") {
      console.log(email, "is already an admin.");
      process.exit(0);
    }
    console.error("Failed to add admin:", insertError.message);
    process.exit(1);
  }
  console.log("Added", email, "as admin.");
}

main();
