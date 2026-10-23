# Comprehensive Backend Architecture Plan
## Project: Submission & Review Dashboard (Subnix)
**Role Evaluation**: Associate Web Instructor (Engineering Ability, Architectural Judgment, Pedagogical Clarity)  
**Target Stack**: Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT (RBAC), Zod, Express Rate Limit

---

## 1. Executive Summary & Assessment Alignment

This architecture plan is specifically designed for the **Project Submission and Review Dashboard**. It fulfills all functional specifications, resolves intentional ambiguities with senior engineering judgment, and is intentionally structured to serve as primary teaching material for the instructor video assessments.

### Alignment with Video Lesson Categories:
* **Category 1 (Theoretical)**:
  * **Topic 1A (N+1 Query Problem)**: Clearly demonstrated via Prisma relations when querying Submissions with Student and Review data (`include` vs loop queries).
  * **Topic 1B (Caching Architecture)**: Demonstrated in the Dashboard Statistics endpoint (`/submissions/stats`), explaining why calculating aggregates on every request requires caching (Redis/Memory) with invalidation hooks.
  * **Topic 1C (AuthN vs AuthZ / RBAC)**: Demonstrated in the JWT token authentication middleware vs role authorization guards (`STUDENT` vs `MENTOR`/`ADMIN`).
* **Category 2 (Hands-on Demonstration)**:
  * **Topic 2A (Securing a Route)**: Live-coding the review status update route handler (`PATCH /api/v1/submissions/:id/review`), extracting token payload, fetching resource from DB, verifying role and state machine transitions.
  * **Topic 2B (Database Schema & Relations)**: Live-coding the PostgreSQL Prisma schema showing 1-to-many relations (`User` -> `Submission` and `Submission` -> `Review`).
  * **Topic 2D (Defensive Form Validation)**: Live-coding Zod schemas for submission payload, URL sanitization, and server-side duplicate checks.

---

## 2. Analysis of Existing `subnix_backend` & Necessary Transitions

The existing boilerplate in `subnix_backend` contains a solid foundation, including:
1. **Modular architecture**: Controller -> Service -> Route -> Validation -> Interface.
2. **Global Error Handling**: Custom `ApiError`, `globalErrorHandler`, and standardized responses.
3. **JWT helpers & Auth middleware**: `jwtHelpers`, token verification, and role-checking functions.
4. **Validation Pipeline**: `validateRequest` middleware using Zod.

### Critical Transition: MongoDB to PostgreSQL
* **Current Issue**: The boilerplate is configured with `provider = "mongodb"` and `@db.ObjectId` mappings. MongoDB does not support standard relational foreign keys or relational constraints required for PostgreSQL.
* **Mandated Stack**: The assessment explicitly demands **PostgreSQL via Prisma ORM**.
* **Transition Plan**:
  1. Change `datasource db` in `prisma/schema.prisma` from `mongodb` to `postgresql`.
  2. Replace MongoDB `ObjectId` types with standard relational primary keys (`String @id @default(uuid())` or `cuid()`).
  3. Replace MongoDB-style embedded arrays with relational tables and foreign keys (`@relation`).
  4. Update `.env` to point to a PostgreSQL connection URL (`postgresql://user:password@localhost:5432/subnix_db?schema=public`).
  5. Run `npx prisma migrate dev --name init_postgres`.

---

## 3. Resolution of Intentional Ambiguities

The assessment intentionally leaves key operational ambiguities. Below are the engineering decisions made to resolve them:

| Ambiguity | Assessment Question | Architectural Decision & Rationale |
| :--- | :--- | :--- |
| **Duplicate Submissions** | What constitutes a "duplicate"? Can a student resubmit if rejected? | **Two-Tier Rule**: (1) A student cannot have multiple `PENDING` submissions for the same project or repository URL. (2) If a previous submission is `REJECTED`, the student **is allowed** to submit an updated revision (real-world educational workflow). This is enforced via an application-level pre-flight check and a database composite index. |
| **Role Taxonomy** | How do Student, Mentor, and Admin roles differ? | Define three distinct roles in Prisma enum: `STUDENT` (submits projects, views own status), `MENTOR` (views all submissions, filters, approves/rejects with feedback, views stats), `ADMIN` (super-set: manages users, system config, mentors). |
| **Review Feedback** | Is approval/rejection a single boolean or accompanied by feedback? | A dedicated `Review` entity or structured fields on `Submission`. When rejecting, a `feedback` or `remarks` note is **mandatory**; for approval, it is optional. Mentors cannot reject without explaining why. |
| **Rate Limiting** | What scope and threshold should be used? | Two-tier rate limiting: (1) General API limiter (100 requests per 15 minutes per IP). (2) Sensitive action limiter on `POST /api/v1/submissions` (e.g., maximum 5 submissions per hour per authenticated student ID/IP) to prevent spam. |
| **Server-Side Filters** | How should filtering, sorting, and pagination be handled? | Query params: `page`, `limit`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `search` (case-insensitive search on `projectName` and `description`), `sortBy`, `sortOrder`. All executed directly in PostgreSQL using Prisma queries. |

---

## 4. Database Schema Design (Prisma + PostgreSQL)

Below is the production-grade PostgreSQL Prisma schema designed for `subnix_backend/prisma/schema.prisma`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  STUDENT
  MENTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
  PENDING
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id           String      @id @default(uuid())
  fullName     String
  email        String      @unique
  password     String
  role         UserRole    @default(STUDENT)
  status       UserStatus  @default(ACTIVE)
  isVerified   Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relational mappings
  submissions  Submission[] @relation("StudentSubmissions")
  reviews      Review[]     @relation("MentorReviews")

  @@map("users")
}

model Submission {
  id           String           @id @default(uuid())
  projectName  String
  repoUrl      String
  liveLink     String
  description  String           @db.Text
  status       SubmissionStatus @default(PENDING)
  
  // Student relation
  studentId    String
  student      User             @relation("StudentSubmissions", fields: [studentId], references: [id], onDelete: Cascade)

  // Review history relation
  reviews      Review[]

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  // Composite indexes for fast server-side filtering, searching & duplicate checking
  @@index([status])
  @@index([studentId])
  @@index([createdAt])
  @@index([studentId, repoUrl, status])
  @@map("submissions")
}

model Review {
  id           String           @id @default(uuid())
  submissionId String
  submission   Submission       @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  reviewerId   String
  reviewer     User             @relation("MentorReviews", fields: [reviewerId], references: [id], onDelete: Restrict)

  status       SubmissionStatus // APPROVED or REJECTED
  feedback     String?          @db.Text

  createdAt    DateTime         @default(now())

  @@index([submissionId])
  @@index([reviewerId])
  @@map("reviews")
}
```

### Relational Schema Explanation (Pedagogical Value for Topic 2B):
1. **User (1) to Submissions (N)**: Each student can submit multiple projects over time, but each submission belongs strictly to one student.
2. **Submission (1) to Reviews (N)**: A submission can have a review history. If rejected and resubmitted, previous feedback remains intact for auditability.
3. **User/Mentor (1) to Reviews (N)**: Tracks which mentor approved or rejected which project, ensuring accountability.
4. **Targeted Indexes**: `@@index([status])` ensures `O(log N)` filtering on the mentor dashboard even with millions of records.

---

## 5. System Directory Structure in `subnix_backend`

We maintain the clean, modular structure already initiated in the repository:

```
subnix_backend/
├── prisma/
│   ├── schema.prisma            <-- Updated PostgreSQL schema
│   ├── migrations/              <-- Prisma migration history
│   └── seed.ts                  <-- Direct database seeding script (Super Admin & Mentor)
├── src/
│   ├── config/
│   │   └── index.ts             <-- Environment variables & constants
│   ├── app/
│   │   ├── errors/              <-- Custom ApiError, Zod error formatter
│   │   ├── helpers/             <-- JWT helper, pagination helper, search filter
│   │   ├── middlewares/
│   │   │   ├── auth.ts          <-- Role-Based Access Control (RBAC) middleware
│   │   │   ├── rateLimiter.ts   <-- Submission rate limiting
│   │   │   ├── validateRequest.ts
│   │   │   └── globalErrorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/            <-- Authentication (Signup, Login, Refresh)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.interface.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── submission/      <-- Student Submission Module
│   │   │   │   ├── submission.controller.ts
│   │   │   │   ├── submission.interface.ts
│   │   │   │   ├── submission.routes.ts
│   │   │   │   ├── submission.service.ts
│   │   │   │   └── submission.validation.ts
│   │   │   └── review/          <-- Mentor Dashboard & Review Actions Module
│   │   │       ├── review.controller.ts
│   │   │       ├── review.interface.ts
│   │   │       ├── review.routes.ts
│   │   │       ├── review.service.ts
│   │   │       └── review.validation.ts
│   │   ├── routes/
│   │   │   └── index.ts         <-- Central route aggregator
│   │   └── seedSuperAdmin/
│   │       └── index.ts         <-- Startup seeder for Admin & Mentor
│   ├── app.ts                   <-- Express app initialization
│   └── server.ts                <-- HTTP server startup
├── .env                         <-- Environment config (PostgreSQL, JWT, Redis)
└── tsconfig.json
```

---

## 6. Detailed API Specification

### 6.1 Authentication Module (`/api/v1/auth`)

#### 1. Student Signup
* **Endpoint**: `POST /api/v1/auth/signup`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "fullName": "Rahim Ahmed",
    "email": "rahim@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Validation (Zod)**: Email format, password min 6 chars, name min 2 chars. Enforces `role: STUDENT`.
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Student registered successfully",
    "data": {
      "id": "uuid-v4",
      "fullName": "Rahim Ahmed",
      "email": "rahim@example.com",
      "role": "STUDENT"
    }
  }
  ```

#### 2. User Login
* **Endpoint**: `POST /api/v1/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "mentor@subnix.com",
    "password": "MentorPassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "User logged in successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "uuid-v4",
        "fullName": "Lead Mentor",
        "email": "mentor@subnix.com",
        "role": "MENTOR"
      }
    }
  }
  ```

#### 3. Database Seeding (Admin & Mentor)
* An automated seed runner in `seedSuperAdmin` initializes:
  * `admin@subnix.com` (Role: `ADMIN`)
  * `mentor@subnix.com` (Role: `MENTOR`)
* This fulfills the requirement: *"For now you can seed the admin directly in the database"*.

---

### 6.2 Submission Module (`/api/v1/submissions`)

#### 1. Create Project Submission (Student Portal)
* **Endpoint**: `POST /api/v1/submissions`
* **Access**: Authenticated (`STUDENT` only)
* **Rate Limit**: Max 5 submissions per hour per user.
* **Request Body**:
  ```json
  {
    "projectName": "E-Commerce App",
    "repoUrl": "https://github.com/rahim/ecommerce-app",
    "liveLink": "https://ecommerce-app.vercel.app",
    "description": "Full-stack Next.js and Express e-commerce application with Stripe integration."
  }
  ```
* **Defensive Validation (Zod)**:
  * `projectName`: string, min 3, max 100 characters.
  * `repoUrl`: string, valid URL format, must point to valid git repository host (e.g. `github.com`, `gitlab.com`).
  * `liveLink`: string, valid URL format (https).
  * `description`: string, min 20, max 2000 characters.
* **Duplicate Prevention Logic**:
  ```typescript
  // Check if student already has a PENDING submission for this repository URL
  const existingPending = await prisma.submission.findFirst({
    where: {
      studentId: user.id,
      repoUrl: payload.repoUrl,
      status: SubmissionStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You already have a pending submission for this repository URL. Please wait for review before resubmitting."
    );
  }
  ```
* **Response (201 Created)**: Returns created submission with `status: "PENDING"`.

#### 2. Get Student's Own Submissions
* **Endpoint**: `GET /api/v1/submissions/my-submissions`
* **Access**: Authenticated (`STUDENT` only)
* **Response**: List of submissions belonging to the calling student, including reviews and feedback.

---

### 6.3 Review Dashboard & Statistics Module (`/api/v1/submissions`)

#### 1. Get Paginated Submissions with Server-Side Filters (Mentor View)
* **Endpoint**: `GET /api/v1/submissions`
* **Access**: Authenticated (`MENTOR`, `ADMIN`)
* **Query Parameters**:
  * `page`: integer (default: 1)
  * `limit`: integer (default: 10)
  * `status`: `PENDING` | `APPROVED` | `REJECTED` | `ALL` (default: `ALL`)
  * `search`: string (matches `projectName` or `description`)
  * `sortBy`: `createdAt` | `projectName` | `status` (default: `createdAt`)
  * `sortOrder`: `asc` | `desc` (default: `desc`)
* **Server-Side Execution Strategy**:
  ```typescript
  const whereConditions: Prisma.SubmissionWhereInput = {
    AND: [
      status && status !== 'ALL' ? { status } : {},
      search ? {
        OR: [
          { projectName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { student: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      } : {},
    ],
  };

  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.submission.count({ where: whereConditions }),
  ]);
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Submissions fetched successfully",
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    },
    "data": [
      {
        "id": "sub-123",
        "projectName": "E-Commerce App",
        "repoUrl": "https://github.com/rahim/ecommerce-app",
        "liveLink": "https://ecommerce-app.vercel.app",
        "description": "Full-stack Next.js and Express...",
        "status": "PENDING",
        "createdAt": "2026-10-23T10:00:00Z",
        "student": {
          "id": "usr-1",
          "fullName": "Rahim Ahmed",
          "email": "rahim@example.com"
        },
        "reviews": []
      }
    ]
  }
  ```

#### 2. Review Action (Approve or Reject Submission)
* **Endpoint**: `PATCH /api/v1/submissions/:id/review`
* **Access**: Authenticated (`MENTOR`, `ADMIN`)
* **Request Body**:
  ```json
  {
    "status": "APPROVED", // or "REJECTED"
    "feedback": "Outstanding code structure, comprehensive README, and clean TypeScript types."
  }
  ```
* **Defensive State Machine & Validation**:
  * If `status === 'REJECTED'`, `feedback` is required (minimum 10 characters).
  * Route checks that submission exists and is not already processed or allows status updates with an audit trail.
  * Executed in a **Prisma Database Transaction** (`$transaction`):
    1. Updates `Submission.status`.
    2. Creates a record in `Review` table with `reviewerId: req.user.id`.
* **Response (200 OK)**: Returns updated submission and recorded review.

#### 3. Aggregated Dashboard Statistics
* **Endpoint**: `GET /api/v1/submissions/stats`
* **Access**: Authenticated (`MENTOR`, `ADMIN`)
* **Aggregations Performed**:
  ```typescript
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: SubmissionStatus.PENDING } }),
    prisma.submission.count({ where: { status: SubmissionStatus.APPROVED } }),
    prisma.submission.count({ where: { status: SubmissionStatus.REJECTED } }),
  ]);
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "totalSubmissions": 120,
      "totalPending": 15,
      "totalApproved": 90,
      "totalRejected": 15,
      "approvalRatePercentage": 75.0
    }
  }
  ```
* **Performance / Caching Integration (Topic 1B)**:
  * For high-traffic systems, this endpoint is wrapped with a 60-second Redis / in-memory cache.
  * When a mentor calls `PATCH /api/v1/submissions/:id/review`, the cache is automatically invalidated (`cache.del('dashboard_stats')`).

---

## 7. Security, Middleware, and Defensive Validation

### 7.1 JWT-Based Role-Based Access Control (RBAC) Middleware
The existing `auth.ts` middleware is enhanced to support strict role hierarchy:

```typescript
export const auth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Missing or invalid authorization token format");
      }

      const token = authHeader.split(" ")[1];
      const verifiedPayload = jwtHelpers.verifyToken(token, config.jwt.access_secret as Secret);

      // Verify user existence and active status in DB
      const user = await prisma.user.findUnique({
        where: { id: verifiedPayload.id },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User account is inactive or not found");
      }

      // Check Role-Based Authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, `Access forbidden: requires ${requiredRoles.join(" or ")} role`);
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

### 7.2 Rate Limiter Configuration
* Installed package: `express-rate-limit`.
* Specific limiter for project submissions:
```typescript
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,                   // Limit each student to 5 submissions per hour
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: "Rate limit exceeded: You can only submit up to 5 projects per hour to prevent spam.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## 8. Video Demonstration & Pedagogical Script Guide (Part 2)

As an Associate Web Instructor candidate, your code should be written so clearly that it speaks for itself in your video lessons. Below is the blueprint for the 2 video topics:

### Recommended Selection:
* **Category 1 (Theoretical)**: **Topic 1C (Authentication vs. Authorization - RBAC)** or **Topic 1B (The Architecture of Caching)**.
* **Category 2 (Hands-on)**: **Topic 2A (Securing a Route)** or **Topic 2B (Database Schema & Relations)**.

### Category 1 Example: Topic 1C (AuthN vs AuthZ / RBAC)
* **Visual Aid**: Diagram showing the Passport Control (AuthN = "Who are you?") vs VIP Lounge Gate (AuthZ = "What are you allowed to do?").
* **Key Concept in Bengali**:
  1. *Authentication*: Verification of identity via signed JWT containing claims (`id`, `role`).
  2. *Authorization*: Inspection of roles at the endpoint gateway before granting access to resources.
  3. *Why RBAC*: Explaining why Mentors should have review permissions while Students can only post submissions.
  4. *Performance vs Security*: Stateless JWT verification vs database re-verification to immediately detect banned/blocked users.

### Category 2 Example: Topic 2A (Securing a Route)
* **Live Coding Walkthrough**:
  1. Open `src/app/modules/submission/submission.routes.ts`.
  2. Apply `auth(UserRole.MENTOR, UserRole.ADMIN)` to the `PATCH /:id/review` route.
  3. Step into `submission.service.ts`:
     - Show extracting `reviewerId` from `req.user.id`.
     - Query the submission by ID from PostgreSQL.
     - Validate that a student cannot review their own submission.
     - Perform atomic update and record the review feedback in a transaction.
  4. Test in Postman/Thunder Client: Demonstrate a `403 Forbidden` when attempting the request with a Student token, and a `200 OK` when using a Mentor token.

---

## 9. Step-by-Step Implementation Roadmap

```mermaid
graph TD
  A[Step 1: Setup PostgreSQL & Prisma] --> B[Step 2: Seed Admin & Mentor Users]
  B --> C[Step 3: Refine Auth & JWT RBAC Middleware]
  C --> D[Step 4: Build Submission Module with Zod & Rate Limit]
  D --> E[Step 5: Build Mentor Review & Filtering Module]
  E --> F[Step 6: Implement Aggregated Stats & Caching]
  F --> G[Step 7: End-to-End API Validation]
```

1. **Step 1: Database Migration to PostgreSQL**:
   - Update `schema.prisma` with the relational schema.
   - Configure local or cloud PostgreSQL `DATABASE_URL` in `.env`.
   - Run `npx prisma db push` or `npx prisma migrate dev`.
2. **Step 2: Database Seeding**:
   - Update `src/app/seedSuperAdmin/index.ts` to seed an `ADMIN` and a `MENTOR`.
3. **Step 3: Auth & RBAC**:
   - Ensure `POST /api/v1/auth/signup` registers students and `POST /api/v1/auth/login` issues typed JWTs.
4. **Step 4: Submission Module**:
   - Implement `submission.validation.ts` (Zod), `submission.service.ts` (duplicate prevention logic), `submission.controller.ts`, and `submission.routes.ts` (with rate limiter).
5. **Step 5: Review & Filtering Module**:
   - Implement paginated `findMany` query with dynamic where-clause filtering by `status`, `search`, and sorting.
   - Implement `PATCH /:id/review` with transaction-safe review creation.
6. **Step 6: Aggregated Statistics**:
   - Implement `GET /api/v1/submissions/stats` using Prisma counts.
7. **Step 7: Verification**:
   - Verify every endpoint with edge cases (duplicate submissions, unauthorized role attempts, invalid URLs).

---

*Document finalized and ready for step-by-step implementation.*
