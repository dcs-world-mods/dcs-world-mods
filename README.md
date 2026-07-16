# DCS World Mods — Community Hub

The community website for DCS World modifications, developers and aviation enthusiasts.

Full-stack app built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Prisma**.

## Features

- **Users & auth** — registration, login (bcrypt + JWT httpOnly cookie sessions), profiles with avatar & bio, three roles: Member / Mod Developer / Site Admin
- **Mods library** — upload (archive or external link + preview image), categories (Aircraft, Weapons, Maps, Missions, Other), search, sorting, download counter, 1–5 star ratings, comments, admin approval workflow
- **Community forum** — 7 categories, threads, replies, likes, pin/lock/delete moderation, full-text search
- **Developer Hub** — guides grouped by topic (Getting Started, Lua Scripting, Tools, Community Projects)
- **Admin dashboard** — site statistics, user role management, mod approval queue, content reports
- **Design** — dark HUD-inspired military aviation theme, responsive (mobile + desktop)

## Local development

```bash
npm install          # also runs `prisma generate`
npm run db:push      # create the SQLite database (dev.db)
npm run db:seed      # forum categories, bootstrap admin + demo content
npm run dev          # http://localhost:3000
```

Demo accounts: `ViperDev` / `Maverick` (password `demo12345`).

## Owner / roles

Roles: **Member**, **Mod Developer**, **Owner**. Only Owners can access the
admin dashboard, manage users, approve mods and moderate content.

There is deliberately **no UI or API path to become an Owner**. The dashboard
can only switch users between Member and Developer. Owner is granted manually
on the server:

```bash
npm run set-owner <username>              # grant Owner
npm run set-owner <username> -- --revoke  # demote to Member
```

The `dcsworldmods` account is the site Owner.

## Branding

The site logo lives at `public/logo.svg` and is used in the header, homepage
hero and footer. To use your official logo, replace that file (any square
SVG/PNG works — if you use a PNG, name it `logo.svg` anyway or update the
three `<img src="/logo.svg">` references).

## Production deployment

1. **Database** — switch `prisma/schema.prisma` datasource to PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Then run `npx prisma db push` (or set up `prisma migrate`) against your Postgres instance.
2. **Environment variables** (never commit real values):
   - `DATABASE_URL` — Postgres connection string
   - `AUTH_SECRET` — long random secret, e.g. `openssl rand -base64 32`
3. **Uploads** — files are stored in `./uploads` and served by `/api/files/*`. Mount a persistent volume there (or swap `src/lib/uploads.ts` for S3/R2 storage).
4. Build & run:
   ```bash
   npm run build
   npm start
   ```

## Project structure

```
prisma/schema.prisma     # data model (User, Mod, Thread, Post, Report, ...)
prisma/seed.ts           # seed script
src/lib/                 # db client, auth (JWT sessions), uploads, constants
src/app/api/             # REST route handlers (auth, mods, forum, admin, files)
src/app/                 # pages: home, mods, forum, developers, profile, admin
src/components/          # shared UI (Navbar, ModCard, Avatar, ...)
uploads/                 # runtime file storage (gitignored)
```

## Community links

- YouTube: https://youtube.com/@dcsworldmods
- Discord: https://discord.gg/RAdwkaAWma
