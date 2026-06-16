# RoG Student Leadership Development Programme Website

Next.js 14 (App Router) site for the RoG Student Leadership Development Programme, with Tailwind CSS, NextAuth.js, and brand colours (Lime Green `#76BC43`, Teal Blue `#42889A`).

**Repository:** [github.com/rogslp26website/SLDP-WEB](https://github.com/rogslp26website/SLDP-WEB)  
**Live site:** [rog-slp.vercel.app](https://rog-slp.vercel.app)
## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`.
   - Set `NEXTAUTH_SECRET` (required for production and sign-in; run `npx auth secret` or use any random string).
   - Set `NEXTAUTH_URL` to `http://localhost:3000` for local dev. For `npm run start` (production mode), both must be set or you’ll see `NO_SECRET` errors.

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Home** – Hero, programme intro, Register / Sign in CTAs
- **About** – Mission, outcomes, who it’s for
- **Register** – Registration form (in-memory store for v1)
- **Sign in** – Login; redirects to Resources when successful
- **Resources** – Protected; programme materials and download links (sign-in required)
- **Gallery** – Image grid with lightbox
- **Contact** – Contact info and enquiry form

## Tech

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS (brand colours and font stack)
- NextAuth.js (Credentials provider; users stored in memory for v1)
- Middleware protects `/resources` (and optional `/dashboard`)

## Data

- **Resources**: `lib/resources.ts` – titles, descriptions, file URLs. Replace with API or DB later.
- **Gallery**: `lib/gallery.ts` – image list. Replace with CMS/API later.
- **Users**: In-memory in `lib/users.ts`; add Supabase/Firebase for production.
