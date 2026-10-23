# Subnix — Project Submission & Review Dashboard
> **Hiring Assessment**: Associate Web Instructor  
> **Tech Stack**: Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Express.js, PostgreSQL (Prisma ORM), JWT (RBAC), Redux Toolkit

---

## 🌟 Overview

**Subnix** is a full-stack project submission and review dashboard designed for technical bootcamps and educational platforms. It provides students with a seamless project handoff portal and mentors with an evaluation dashboard featuring server-side pagination, status filtering, and real-time aggregated metrics.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | TypeScript | End-to-end static typing across both client and server |
| **Frontend** | Next.js 15 (App Router) | Server-rendered pages, client-side interactivity, fast navigation |
| **Styling** | TailwindCSS + ShadCN Tokens | Modern, responsive, accessible design system |
| **State Management** | Redux Toolkit + RTK Query | Cache management, optimistic UI updates, tag invalidations |
| **Backend** | Express.js | Modular REST API (Controller ➔ Service ➔ Routes ➔ Validation) |
| **Database** | PostgreSQL (Neon) via Prisma ORM | Relational schema, composite indexing, transactions |
| **Authentication** | JWT-based RBAC | Distinct roles: `STUDENT`, `MENTOR`, `ADMIN` with route guards |
| **Defensive Validation** | Zod | Strict schema validation for payloads and query parameters |
| **Rate Limiting** | express-rate-limit | Spam prevention (5 submissions/hr per student) |

---

## 🚀 Features Implemented

### 1. Student Submission Portal (`/submit`)
- **Comprehensive Project Form**: Project Name, Repository URL, Live Demo Link, and Technical Description.
- **Defensive Zod Validation**: Strict URL regex validation for GitHub/GitLab links and sanitized input fields.
- **Duplicate Submission Guard**: Prevents students from submitting duplicate pending reviews for the same repository URL.
- **Spam Rate Limiting**: Dedicated rate limiter restricting project creation to 5 submissions per hour.
- **Submission History (`/my-submissions`)**: Students can monitor live status badges (`PENDING`, `APPROVED`, `REJECTED`) and view mentor constructive feedback.

### 2. Mentor Review Dashboard (`/dashboard`)
- **Aggregated Statistics**: Live metrics displaying Total Submissions, Pending in Queue, Approved, Rejected, and Approval Ratio (%).
- **Server-Side Status Filtering**: Filters by `ALL`, `PENDING`, `APPROVED`, and `REJECTED` executed directly in PostgreSQL.
- **Server-Side Search**: Case-insensitive keyword search across project names, descriptions, and student names.
- **Paginated Data Table**: Page and limit navigation powered by `skip` / `take` database queries.
- **Review Evaluation Modal**: Mentors can Approve or Reject projects with **mandatory constructive feedback** on rejection (minimum 10 characters).
- **Instant Cache Synchronization**: Review mutations invalidate RTK Query tags, updating tables and metrics concurrently.

### 3. Authentication & Role-Based Access Control (`/auth`)
- **Student Registration**: Clean signup with bcrypt password hashing and default `STUDENT` role.
- **User Login**: JWT access and refresh token issuance with role identification.
- **Automated Database Seeding**: Automatic seeder initializes Super Admin and Lead Mentor accounts on startup.
- **One-Click Quick-Fill**: Login screen includes demo buttons for instant evaluation.

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Lead Mentor** | `mentor@subnix.com` | `mentor123` | Review dashboard, approve/reject, status filters, stats |
| **Super Admin** | `admin@gmail.com` | `123456` | Full system access, mentor capabilities, user control |
| **Student** | Self-registered via `/auth/signup` | Custom | Project submissions, personal status tracking |

---

## 💡 Resolution of Intentional Ambiguities

As part of the evaluation criteria, key ambiguities in the specification were resolved using senior engineering judgment:

1. **Duplicate Submission Definition**:
   - A student cannot have multiple `PENDING` reviews for the same repository URL.
   - If a previous review was `REJECTED`, the student **is allowed** to resubmit an updated revision, mimicking real-world educational workflows.
2. **Rejection Feedback Policy**:
   - Mentors cannot simply reject a student's work blindly. Rejection strictly requires constructive feedback (minimum 10 characters) explaining what needs improvement before resubmission.
3. **Rate Limiting Scope**:
   - A global limiter protects the server against DDoS (1,000 reqs / 15 mins).
   - A strict limiter on `POST /submissions` prevents student submission spamming (5 submissions / hour).

---

## 🎥 Alignment with Video Teaching Topics (Part 2)

The architecture was intentionally designed to serve as primary teaching material for the instructor assessment:

- **Topic 1A (N+1 Query Problem)**: Demonstrated via Prisma's `include: { student: true, reviews: true }` join queries versus sequential loop queries.
- **Topic 1B (Architecture of Caching)**: Explains why aggregated dashboard metrics should be cached (Redis / in-memory) with mutation invalidation hooks.
- **Topic 1C & 2A (AuthN vs AuthZ / Securing a Route)**: Demonstrated in `auth.ts` middleware by verifying token identity (AuthN) and enforcing role guards (`STUDENT` vs `MENTOR`) before status updates.
- **Topic 2B (Database Schema & Relations)**: Demonstrated in `schema.prisma` with 1-to-many relationships between `User`, `Submission`, and `Review`.
- **Topic 2D (Defensive Form Validation)**: Demonstrated in `submission.validation.ts` using Zod refinements for URL validation and mandatory rejection notes.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Neon Serverless recommended, or local Postgres)

---

### Backend Setup (`subnix_backend`)

1. Navigate to the backend directory:
   ```bash
   cd subnix_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (refer to `.env.example`):
   ```env
   PORT=8090
   DATABASE_URL="postgresql://username:password@host:5432/dbname?sslmode=require"
   JWT_ACCESS_SECRET="your_access_secret_key"
   JWT_REFRESH_SECRET="your_refresh_secret_key"
   ```
4. Push the schema to PostgreSQL:
   ```bash
   node node_modules/prisma/build/index.js db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:8090` and seeds the admin and mentor automatically.*

---

### Frontend Setup (`subnix_frontend`)

1. Navigate to the frontend directory:
   ```bash
   cd subnix_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env.local` points to the backend:
   ```env
   NEXT_PUBLIC_BASE_API_URL="http://localhost:8090/api/v1"
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```
5. Open **`http://localhost:3000`** in your browser.

---

## 🧪 Postman Collection & API Testing

A ready-to-import Postman collection and comprehensive API documentation are included in the repository:
- 📦 **Postman Collection**: [`postman_collection.json`](./postman_collection.json) *(Import directly into Postman)*
- 📖 **API Testing Guide**: [`API_TESTING_GUIDE.md`](./API_TESTING_GUIDE.md)
- 📐 **Detailed Architecture Plan**: [`BACKEND_ARCHITECTURE_PLAN.md`](./BACKEND_ARCHITECTURE_PLAN.md)
