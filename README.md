# Notice Board

A simple Notice Board app built with Next.js (Pages Router), Prisma, and a hosted MySQL-compatible database.
Supports full create, read, update, and delete of notices, with Urgent notices always sorted to the top.

## Tech stack

- **Framework:** Next.js (Pages Router)
- **Database access:** Prisma
- **Database:** TiDB Cloud (MySQL-compatible, free tier)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (Hobby / free tier)

## Running locally

1. Clone the repo and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd notice-board
   npm install
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your own hosted database
   connection string (see "Database setup" below):
   ```bash
   cp .env.example .env
   ```

3. Push the Prisma schema to your database (creates the `Notice` table):
   ```bash
   npx prisma db push
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Database setup (TiDB Cloud)

1. Create a free account at [tidbcloud.com](https://tidbcloud.com) and spin up a free **Serverless** cluster.
2. Click **Connect**, choose the "Prisma" or general connection option, and copy the connection string.
3. Paste it into `.env` as `DATABASE_URL` (make sure `sslaccept=strict` is included).
4. Run `npx prisma db push` to create the schema.

## Deploying to Vercel

1. Push this repo to a **public** GitHub repository.
2. Import the repo into Vercel.
3. Add the `DATABASE_URL` environment variable in the Vercel project settings (same value as your `.env`).
4. Deploy. Vercel runs `prisma generate` automatically via the `postinstall` script.
5. Make sure the deployment is public (no login/password protection).

## Project structure

- `pages/index.js` – notice list (server-rendered, Urgent-first ordering done in the Prisma query)
- `pages/notices/new.js` / `pages/notices/[id]/edit.js` – shared form for create/edit
- `pages/api/notices/index.js` – `GET` (list) / `POST` (create)
- `pages/api/notices/[id].js` – `GET` (single) / `PUT` (update) / `DELETE`
- `lib/validateNotice.js` – server-side validation, run inside the API routes
- `prisma/schema.prisma` – database schema

## One thing I'd improve with more time

I'd move image storage out of the database (currently stored as a base64 string in a `LongText`
column, which is simple but not ideal for a production app) and instead upload images to a proper
object store (e.g. Vercel Blob or S3), storing only the URL in the database. I'd also add optimistic
UI updates and pagination for the notice list once it grows large.

## Where and how AI was used

AI (Claude) was used to scaffold the project structure, write the Prisma schema, API routes,
server-side validation, and React components, and to draft this README. All code was reviewed
and tested manually before submission — [describe here what you personally tested/changed, e.g.
"I tested create/edit/delete locally against my TiDB database and adjusted the date formatting."]
