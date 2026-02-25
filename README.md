# SecureBlog — Production-Grade Blog Platform

A production-grade, full-stack blog platform built with **NestJS**, **Next.js 15**, **PostgreSQL**, and **Prisma** — designed to reflect **senior-level engineering practices**.

## Architecture Overview

```
┌─────────────────────┐     ┌──────────────────────────────────┐
│   Next.js 15        │────▶│   NestJS Backend (REST API)      │
│   (App Router)      │     │                                  │
│   Port: 3000        │     │   Port: 3001                     │
│                     │     │                                  │
│   ● Feed Page       │     │   ● Auth Module (JWT + Bcrypt)   │
│   ● Blog Detail     │     │   ● Blogs Module (CRUD + Slug)   │
│   ● Dashboard       │     │   ● Likes Module                 │
│   ● Auth Pages      │     │   ● Comments Module              │
│   ● Optimistic UI   │     │   ● Public Module (Feed + Slug)  │
└─────────────────────┘     │   ● Rate Limiting (Throttler)    │
                            │   ● Structured Logging (Pino)    │
                            └──────────┬───────────────────────┘
                                       │
                            ┌──────────▼───────────────────────┐
                            │   PostgreSQL                     │
                            │   (Prisma ORM)                   │
                            │                                  │
                            │   ● Users (UUID, bcrypt hash)    │
                            │   ● Blogs (slug, indexes)        │
                            │   ● Likes (unique constraint)    │
                            │   ● Comments (indexed)           │
                            └──────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (latest), TypeScript (strict) |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT (passport-jwt), bcrypt |
| **Validation** | class-validator, class-transformer |
| **Rate Limiting** | @nestjs/throttler |
| **Logging** | Pino (nestjs-pino) |
| **Frontend** | Next.js 15 (App Router), TypeScript |
| **UI** | Vanilla CSS (dark mode, glassmorphism) |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |

## Features

### Backend
- **JWT Authentication** — Register/login with bcrypt hashing, JWT tokens
- **Blog CRUD** — Create, edit, delete blogs with auto-generated unique slugs
- **Like System** — DB-level unique constraint prevents duplicate likes
- **Comment System** — Paginated, sorted newest first, indexed queries
- **Public Feed** — Paginated, optimized with `_count` to avoid N+1 queries
- **Rate Limiting** — Global throttling via `@nestjs/throttler`
- **Structured Logging** — Pino JSON logs, pretty-print in dev
- **Global Exception Filter** — Clean, structured error responses

### Frontend
- **Optimistic UI** — Like button updates instantly, rolls back on failure
- **Paginated Feed** — Server-side paginated with page controls
- **Inline Comments** — Submit and immediately see new comments
- **Auth Flow** — Cookie-based tokens, middleware-protected dashboard routes
- **Premium Dark Mode** — Glassmorphism navbar, gradient hero, animated cards
- **Responsive Design** — Mobile-first with breakpoints at 768px and 480px
- **Loading & Error States** — Spinners, empty states, 404 pages, toast notifications

## Setup Instructions

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** running locally (or any accessible instance)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Database

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/secureblog?schema=public"
JWT_SECRET="change-this-to-a-strong-secret"
JWT_EXPIRATION="7d"
PORT=3001
```

Create the database:
```bash
createdb secureblog
# OR via psql:
# CREATE DATABASE secureblog;
```

### 3. Run Migrations

```bash
cd backend
npx prisma db push
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login |

### Blogs (Protected)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/blogs` | ✅ | Create blog |
| GET | `/blogs` | ✅ | Get user's blogs |
| GET | `/blogs/:id` | ✅ | Get blog by ID |
| PATCH | `/blogs/:id` | ✅ | Update blog (owner only) |
| DELETE | `/blogs/:id` | ✅ | Delete blog (owner only) |
| POST | `/blogs/:id/like` | ✅ | Like/toggle |
| DELETE | `/blogs/:id/like` | ✅ | Remove like |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/blogs/:id/comments` | ✅ | Create comment |
| GET | `/blogs/:id/comments` | ❌ | List comments (paginated) |

### Public
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public/feed?page=1&limit=10` | ❌ | Paginated feed |
| GET | `/public/blogs/:slug` | ❌ | Blog by slug |

## Architecture Decisions & Tradeoffs

### Why Prisma over Raw SQL?
- Type-safe queries with auto-generated client
- Schema-first approach keeps DB modeling declarative
- `include` and `_count` avoid N+1 queries efficiently
- **Tradeoff**: Less control over complex query optimization vs raw SQL

### Why JWT over Sessions?
- Stateless — no server-side session storage needed
- Horizontally scalable — any server can validate tokens
- **Tradeoff**: Can't instantly revoke tokens (would need a token blocklist or refresh token rotation)

### Why Vanilla CSS over Tailwind?
- Full control over design system and animations
- No build-time dependency or class string bloat
- Easier to maintain consistent design tokens via CSS variables
- **Tradeoff**: More verbose than utility classes for rapid prototyping

### Why Page-Based Pagination over Cursor?
- Simpler implementation, adequate for blog feed use case
- Users can jump to specific pages
- **Tradeoff**: Page drift on frequently updated feeds (cursor-based would fix but adds complexity)

### Slug Generation
- Uses `slugify` with automatic conflict resolution (appends `-1`, `-2`, etc.)
- Ensures URL-friendly, unique slugs for SEO

## Scaling to 1M Users

### Database Layer
- **Indexing**: Composite indexes on `(isPublished, createdAt)` for feed queries, indexes on `blogId` and `createdAt` for comments
- **Read Replicas**: Route read queries (feed, blog detail) to replicas; writes to primary
- **Connection Pooling**: Use PgBouncer in front of PostgreSQL

### Caching
- **Redis Cache**: Cache the public feed (invalidate on publish), blog detail pages, and like counts
- **CDN**: Serve frontend via Vercel/Cloudflare Edge for static content

### Application Layer
- **Horizontal Scaling**: NestJS is stateless (JWT), deploy multiple instances behind a load balancer
- **Queue Workers**: Move summary generation, email notifications to BullMQ workers on separate processes
- **API Gateway**: Nginx or AWS ALB for rate limiting at the network edge

### Monitoring & Observability
- **Structured Logging**: Pino logs ship to ELK/Datadog for searchability
- **Metrics**: Prometheus + Grafana for request latency, error rates, DB query times
- **Alerting**: PagerDuty/Opsgenie for P0 incidents

### Security
- **Rate Limiting**: Already implemented at application level; add WAF at gateway
- **CORS**: Strict origin policy
- **Input Validation**: Global validation pipe rejects malformed requests early

## Improvements Roadmap

- [ ] Refresh token rotation for better security
- [ ] Role-based access control (admin, author, reader)
- [ ] Markdown/rich text editor for blog content
- [ ] Full-text search with PostgreSQL `tsvector`
- [ ] Image upload with S3/Cloudinary
- [ ] Email notifications on new comments
- [ ] BullMQ async job processing for summary generation
- [ ] WebSocket for real-time comment updates
- [ ] OpenAPI/Swagger documentation
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Docker Compose for local development

## Project Structure

```
Secure Blog Platform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── src/
│   │   ├── auth/                 # JWT auth, register/login
│   │   ├── users/                # User service
│   │   ├── blogs/                # Blog CRUD, likes
│   │   ├── comments/             # Comment CRUD
│   │   ├── public/               # Public feed + blog endpoints
│   │   ├── prisma/               # Prisma service (singleton)
│   │   ├── common/               # Guards, decorators, filters
│   │   ├── app.module.ts         # Root module
│   │   └── main.ts               # Bootstrap with pipes, CORS, logger
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout + navbar + toasts
│   │   │   ├── page.tsx          # Landing / hero
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Register page
│   │   │   ├── feed/             # Public feed (paginated)
│   │   │   ├── blog/[slug]/      # Blog detail
│   │   │   ├── dashboard/        # Protected dashboard
│   │   │   │   ├── new/          # Create blog
│   │   │   │   └── edit/[id]/    # Edit blog
│   │   │   └── globals.css       # Design system
│   │   ├── components/           # BlogCard, LikeButton, CommentSection, Navbar
│   │   ├── hooks/                # useAuth
│   │   ├── lib/                  # api.ts, auth.ts, types.ts
│   │   └── middleware.ts         # Route protection
│   ├── .env.local
│   └── package.json
└── README.md
```

---

Built with ❤️ as a production-ready SaaS MVP.
