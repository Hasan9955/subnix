# Subnix Project Submission & Review API — Testing Guide

**Base URL**: `http://localhost:8090/api/v1`  
**Postman Collection File**: [`subnix/postman_collection.json`](file:///d:/Hasan/All%20projects/omnia/subnix/postman_collection.json) *(Ready to import directly into Postman)*

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@subnix.com` | `admin123` | Full system access, mentor review, dashboard |
| **Mentor** | `mentor@subnix.com` | `mentor123` | View dashboard, filter submissions, approve/reject, stats |
| **Student** | Registered via `/auth/signup` | Custom | Submit project, view own submissions & feedback |

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### 1.1 Student Signup
* **Method**: `POST`
* **URL**: `http://localhost:8090/api/v1/auth/signup`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "fullName": "Rahim Ahmed",
  "email": "student@subnix.com",
  "password": "student123"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Student registered successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "c138f6d8-...",
      "fullName": "Rahim Ahmed",
      "email": "student@subnix.com",
      "role": "STUDENT"
    }
  }
}
```

---

### 1.2 User Login (Student, Mentor, or Admin)
* **Method**: `POST`
* **URL**: `http://localhost:8090/api/v1/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body (Student)**:
```json
{
  "email": "student@subnix.com",
  "password": "student123"
}
```
* **Request Body (Mentor)**:
```json
{
  "email": "mentor@subnix.com",
  "password": "mentor123"
}
```
* **Response (200 OK)**: Returns `accessToken`, `refreshToken`, and user details.

---

### 1.3 Get Current Profile (`/me`)
* **Method**: `GET`
* **URL**: `http://localhost:8090/api/v1/auth/me`
* **Headers**:
  * `Authorization`: `Bearer <ACCESS_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "c138f6d8-...",
    "fullName": "Lead Mentor",
    "email": "mentor@subnix.com",
    "role": "MENTOR",
    "status": "ACTIVE",
    "createdAt": "2026-10-23T11:20:00.000Z"
  }
}
```

---

## 2. Student Submission Endpoints (`/api/v1/submissions`)

### 2.1 Create Project Submission
* **Method**: `POST`
* **URL**: `http://localhost:8090/api/v1/submissions`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <STUDENT_ACCESS_TOKEN>`
* **Rate Limit**: Max 5 submissions per hour per student.
* **Request Body**:
```json
{
  "projectName": "Full-Stack Analytics Dashboard",
  "repoUrl": "https://github.com/rahim/analytics-dashboard",
  "liveLink": "https://analytics-dashboard.vercel.app",
  "description": "Comprehensive full-stack dashboard featuring real-time charts, role-based access control, and PostgreSQL queries."
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Project submitted successfully!",
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "projectName": "Full-Stack Analytics Dashboard",
    "repoUrl": "https://github.com/rahim/analytics-dashboard",
    "liveLink": "https://analytics-dashboard.vercel.app",
    "description": "Comprehensive full-stack dashboard...",
    "status": "PENDING",
    "studentId": "c138f6d8-...",
    "createdAt": "2026-10-23T11:25:00.000Z",
    "student": {
      "id": "c138f6d8-...",
      "fullName": "Rahim Ahmed",
      "email": "student@subnix.com"
    }
  }
}
```

> **Testing Duplicate Submission**:  
> Send this exact same request a second time. The server will catch the duplicate and respond with:  
> `409 Conflict: "You already have a pending submission for this repository URL. Please wait for mentor review before resubmitting."`

---

### 2.2 Get My Submissions (Student View)
* **Method**: `GET`
* **URL**: `http://localhost:8090/api/v1/submissions/my-submissions`
* **Headers**:
  * `Authorization`: `Bearer <STUDENT_ACCESS_TOKEN>`
* **Response (200 OK)**: Returns an array of submissions submitted by the calling student along with mentor review feedback.

---

## 3. Mentor Dashboard & Reviews (`/api/v1/submissions`)

### 3.1 Aggregated Dashboard Statistics
* **Method**: `GET`
* **URL**: `http://localhost:8090/api/v1/submissions/stats`
* **Headers**:
  * `Authorization`: `Bearer <MENTOR_ACCESS_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Submission statistics retrieved successfully.",
  "data": {
    "totalSubmissions": 12,
    "totalPending": 5,
    "totalApproved": 6,
    "totalRejected": 1,
    "approvalRatePercentage": 50.0
  }
}
```

---

### 3.2 Get All Submissions (Paginated & Server-Side Filters)
* **Method**: `GET`
* **URL**: `http://localhost:8090/api/v1/submissions?page=1&limit=10&status=ALL&sortBy=createdAt&sortOrder=desc`
* **Headers**:
  * `Authorization`: `Bearer <MENTOR_ACCESS_TOKEN>`
* **Query Parameters**:
  * `page`: integer (default `1`)
  * `limit`: integer (default `10`)
  * `status`: `ALL` | `PENDING` | `APPROVED` | `REJECTED`
  * `search`: keyword matching project name, description, or student name
  * `sortBy`: `createdAt` | `projectName` | `status`
  * `sortOrder`: `desc` | `asc`

#### Example Filter URLs:
1. **Show only Pending**:  
   `GET http://localhost:8090/api/v1/submissions?status=PENDING&page=1&limit=10`
2. **Show only Approved**:  
   `GET http://localhost:8090/api/v1/submissions?status=APPROVED&page=1&limit=10`
3. **Show only Rejected**:  
   `GET http://localhost:8090/api/v1/submissions?status=REJECTED&page=1&limit=10`
4. **Search by keyword**:  
   `GET http://localhost:8090/api/v1/submissions?search=dashboard`

* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Submissions retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "projectName": "Full-Stack Analytics Dashboard",
      "repoUrl": "https://github.com/rahim/analytics-dashboard",
      "liveLink": "https://analytics-dashboard.vercel.app",
      "description": "Comprehensive full-stack dashboard...",
      "status": "PENDING",
      "student": {
        "id": "c138f6d8-...",
        "fullName": "Rahim Ahmed",
        "email": "student@subnix.com"
      },
      "reviews": []
    }
  ]
}
```

---

### 3.3 Get Single Submission by ID
* **Method**: `GET`
* **URL**: `http://localhost:8090/api/v1/submissions/:id`
* **Headers**:
  * `Authorization`: `Bearer <MENTOR_OR_STUDENT_ACCESS_TOKEN>`

---

### 3.4 Mentor Action: Approve Submission
* **Method**: `PATCH`
* **URL**: `http://localhost:8090/api/v1/submissions/:id/review`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <MENTOR_ACCESS_TOKEN>`
* **Request Body**:
```json
{
  "status": "APPROVED",
  "feedback": "Outstanding project! Clean TypeScript implementation and great README documentation."
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Submission status updated to APPROVED successfully.",
  "data": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "projectName": "Full-Stack Analytics Dashboard",
    "status": "APPROVED"
  }
}
```

---

### 3.5 Mentor Action: Reject Submission
* **Method**: `PATCH`
* **URL**: `http://localhost:8090/api/v1/submissions/:id/review`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer <MENTOR_ACCESS_TOKEN>`
* **Request Body**:
```json
{
  "status": "REJECTED",
  "feedback": "Please fix the database connection timeout and verify your live deployment link before resubmitting."
}
```
> **Validation Rule**: Rejection requires at least 10 characters of constructive feedback explaining the decision to the student!

---

## ⚡ Recommended Testing Sequence in Postman

1. **Step 1 — Mentor Login**: Call `POST /auth/login` with `mentor@subnix.com` / `mentor123` to get `mentorToken`.
2. **Step 2 — Student Signup**: Call `POST /auth/signup` with `student@subnix.com` / `student123` to get `studentToken`.
3. **Step 3 — Submit Project**: Call `POST /submissions` using `studentToken`.
4. **Step 4 — Test Duplicate**: Immediately send the same project again with `studentToken` and confirm `409 Conflict`.
5. **Step 5 — Check Statistics**: Call `GET /submissions/stats` using `mentorToken` and check `totalPending: 1`.
6. **Step 6 — Filter Data**: Call `GET /submissions?status=PENDING` using `mentorToken`.
7. **Step 7 — Review Project**: Call `PATCH /submissions/:id/review` with `"status": "APPROVED"` using `mentorToken`.
8. **Step 8 — Student Checks Status**: Call `GET /submissions/my-submissions` using `studentToken` and confirm status changed to `APPROVED` with mentor feedback.
