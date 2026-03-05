# Contract Manager

A full-stack contract management dashboard built with Next.js 15, TypeScript, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (httpOnly JWT sessions) |
| Validation | Zod (server + client) |
| File Storage | AWS S3 (presigned URLs) |
| Deployment | Vercel |

## Features

- 🔐 **Secure authentication** — httpOnly cookies, password hashing (bcrypt), session management
- 📄 **Contract CRUD** — create, view, edit, delete contracts
- 📁 **PDF upload** — via S3 presigned URLs (files never pass through the server)
- 📊 **Dashboard** — contract stats, expiring soon alerts
- 🔍 **Search & filter** — by status, counterparty, date range
- 👥 **RBAC** — Admin / User / Viewer roles
- 📋 **Audit log** — who accessed/modified what and when
- ✅ **Input validation** — Zod schemas, server-side enforced

## Security Measures

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT stored in httpOnly, SameSite=Strict, Secure cookies
- All inputs validated with Zod before hitting the database
- S3 files accessed via short-lived presigned URLs (not public)
- File uploads: PDF-only, max 10MB, MIME type + magic bytes validation
- RBAC enforced at API route level
- No sensitive data in error responses (generic client errors)
- Environment variables for all secrets (never committed)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/dobro-de/contract-manager.git
cd contract-manager
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — from [neon.tech](https://neon.tech) (Frankfurt region recommended)
- `AUTH_SECRET` — generate with: `openssl rand -base64 32`
- AWS credentials (optional for local dev — S3 upload can be skipped)

### 3. Database setup

```bash
npm run db:push   # Push schema to Neon (development)
# or
npm run db:migrate  # Run migrations (production)
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── contracts/   # Contract list + detail
│   │   └── dashboard/   # Stats overview
│   └── api/             # API Route Handlers
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── contracts/       # Contract-specific components
│   └── dashboard/       # Dashboard widgets
├── lib/
│   ├── db/              # Drizzle schema + client
│   ├── auth/            # Auth.js config
│   ├── s3/              # S3 upload helpers
│   └── validations/     # Zod schemas
└── types/               # Shared TypeScript types
```

## Architecture Decisions

**Why Neon?** Serverless PostgreSQL with zero cold-start penalty on Vercel. Frankfurt region for GDPR compliance.

**Why presigned S3 URLs?** Files never pass through the server — client uploads directly to S3. Reduces server load and avoids storing sensitive PDFs in memory.

**Why httpOnly cookies over localStorage?** Protection against XSS attacks. JWT in localStorage is accessible via JavaScript; httpOnly cookies are not.

**Why Drizzle over Prisma?** Lighter, faster, fully type-safe SQL without a separate binary. Schema-as-code in TypeScript.
