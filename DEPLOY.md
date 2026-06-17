# Deploy to Vercel

Your project is linked to **rog-slp**. Deploy from the project folder:

**Preview (default):**
```powershell
cd "c:\Users\HomePC\Desktop\ROG\ROG SLP"
npx vercel --yes
```

**Production (live URL):**
```powershell
npx vercel --prod --yes
```

## Gallery images (no more huge uploads)

The `docs and photos` folder is **ignored** on deploy (`.vercelignore`). Gallery images are served from **Supabase Storage** instead, so deploys stay small.

**One-time setup:**

1. In [Supabase Dashboard](https://supabase.com/dashboard) → **Storage** → create a **public** bucket named `Gallery` (case-sensitive).
2. Upload your images there, **or** run the script from project root:
   ```powershell
   node scripts/upload-gallery-to-storage.js
   ```
   (Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.)

Locally, the app still uses `docs and photos` if the Storage bucket is empty, so you can develop as before.

## Resources and Admin Resources (dashboard)

**Two buckets** drive uploads from the dashboard:

- **Resources** – programme resources (visible to students/teachers). Create a bucket named `resources` (or `Resources`; see below).
- **Admin Resources** – admin-only files. Create a bucket named `admin-resources` (or `Admin Resources`; see below).

The **Resource Management** tab has a “Resource type” dropdown: choose “Programme resource” to upload to the Resources bucket, or “Admin only” to upload to the Admin Resources bucket. The **Admin Resources** tab lists and deletes admin-only files.

**Bucket names:** The app uses `resources` and `admin-resources` by default. If your Supabase buckets use different names (e.g. `Resources`, `Admin Resources`), set in Vercel (or `.env`):

- `BUCKET_RESOURCES=Resources`
- `BUCKET_ADMIN_RESOURCES=Admin Resources`

**Admin Resources table** (one-time): In Supabase → **SQL Editor**, run:
   ```sql
   create table if not exists admin_resources (
     id uuid primary key default gen_random_uuid(),
     title text not null,
     description text,
     storage_key text not null,
     file_label text,
     created_at timestamptz default now()
   );
   ```
   Then enable RLS if you use it, and allow service role full access to this table.

## Calendar facilitators (dashboard)

The calendar lets you assign up to 4 **facilitators** per event. One-time setup: run migration `012_facilitators_and_calendar_facilitators.sql` (creates `facilitators` and `calendar_event_facilitators` tables). From project root:

```powershell
node -r dotenv/config scripts/run-migration-one.js 012_facilitators_and_calendar_facilitators.sql
```

**Dashboard access:** Admins and users with profile role **facilitator** can open the dashboard and use the Calendar. Other tabs (User Management, Admin Invites, etc.) remain admin-only.
