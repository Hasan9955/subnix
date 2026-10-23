import { SubmissionStatus } from "@prisma/client";

export interface ICreateSubmissionInput {
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
}

export interface IReviewSubmissionInput {
  status: SubmissionStatus; // APPROVED or REJECTED
  feedback?: string;
}

export interface ISubmissionFilterQuery {
  page?: number | string;
  limit?: number | string;
  status?: SubmissionStatus | "ALL";
  search?: string;
  sortBy?: "createdAt" | "projectName" | "status";
  sortOrder?: "asc" | "desc";
}

export interface ISubmissionStats {
  totalSubmissions: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  approvalRatePercentage: number;
}
