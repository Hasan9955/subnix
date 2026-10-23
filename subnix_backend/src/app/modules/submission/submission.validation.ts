import { z } from "zod";
import { SubmissionStatus } from "@prisma/client";

const createSubmissionZodSchema = z.object({
  body: z.object({
    projectName: z
      .string({ required_error: "Project name is required" })
      .min(3, "Project name must be at least 3 characters")
      .max(120, "Project name cannot exceed 120 characters")
      .trim(),
    repoUrl: z
      .string({ required_error: "Repository URL is required" })
      .url("Invalid URL format for repository")
      .regex(
        /^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/.+/i,
        "Repository URL must be a valid GitHub, GitLab, or Bitbucket link"
      )
      .trim(),
    liveLink: z
      .string({ required_error: "Live demo link is required" })
      .url("Invalid URL format for live deployment link")
      .trim(),
    description: z
      .string({ required_error: "Project description is required" })
      .min(15, "Description must be at least 15 characters to explain your project")
      .max(3000, "Description cannot exceed 3000 characters")
      .trim(),
  }),
});

const reviewSubmissionZodSchema = z.object({
  body: z
    .object({
      status: z.enum([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED], {
        required_error: "Review status must be either APPROVED or REJECTED",
      }),
      feedback: z
        .string()
        .max(2000, "Feedback cannot exceed 2000 characters")
        .optional(),
    })
    .refine(
      (data) => {
        // If rejected, mentor must provide at least 10 characters of constructive feedback
        if (data.status === SubmissionStatus.REJECTED) {
          return !!data.feedback && data.feedback.trim().length >= 10;
        }
        return true;
      },
      {
        message:
          "Constructive feedback (minimum 10 characters) is required when rejecting a project submission",
        path: ["feedback"],
      }
    ),
});

const submissionQueryZodSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      status: z
        .enum([
          "ALL",
          SubmissionStatus.PENDING,
          SubmissionStatus.APPROVED,
          SubmissionStatus.REJECTED,
        ])
        .optional(),
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "projectName", "status"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
});

export const submissionValidation = {
  createSubmissionZodSchema,
  reviewSubmissionZodSchema,
  submissionQueryZodSchema,
};
