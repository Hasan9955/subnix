import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { submissionLimiter } from "../../middlewares/rateLimiter";
import { submissionValidation } from "./submission.validation";
import { SubmissionControllers } from "./submission.controller";

const router = express.Router();

// 1. Submit project details (Student only, rate limited, robust Zod validation)
router.post(
  "/",
  auth(UserRole.STUDENT),
  submissionLimiter,
  validateRequest(submissionValidation.createSubmissionZodSchema),
  SubmissionControllers.createSubmission
);

// 2. Student views their own submitted projects
router.get(
  "/my-submissions",
  auth(UserRole.STUDENT),
  SubmissionControllers.getMySubmissions
);

// 3. Aggregated statistics for mentor dashboard (Total pending, approved, rejected, etc.)
router.get(
  "/stats",
  auth(UserRole.MENTOR, UserRole.ADMIN),
  SubmissionControllers.getSubmissionStats
);

// 4. Paginated data table with server-side filtering and search (Mentor & Admin)
router.get(
  "/",
  auth(UserRole.MENTOR, UserRole.ADMIN),
  validateRequest(submissionValidation.submissionQueryZodSchema),
  SubmissionControllers.getAllSubmissions
);

// 5. Get details of a single submission
router.get(
  "/:id",
  auth(UserRole.STUDENT, UserRole.MENTOR, UserRole.ADMIN),
  SubmissionControllers.getSingleSubmission
);

// 6. Mentor approval and rejection action with feedback
router.patch(
  "/:id/review",
  auth(UserRole.MENTOR, UserRole.ADMIN),
  validateRequest(submissionValidation.reviewSubmissionZodSchema),
  SubmissionControllers.reviewSubmission
);

export const SubmissionRouters = router;
