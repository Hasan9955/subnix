import httpStatus from "http-status";
import { Prisma, SubmissionStatus, UserRole } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import {
  ICreateSubmissionInput,
  IReviewSubmissionInput,
  ISubmissionFilterQuery,
  ISubmissionStats,
} from "./submission.interface";

// 1. Create a new submission (Student) with duplicate detection
const createSubmission = async (
  studentId: string,
  payload: ICreateSubmissionInput
) => {
  const normalizedRepoUrl = payload.repoUrl.trim().toLowerCase();

  // Defensive Check: Prevent duplicate submissions for the same repository
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      studentId,
      repoUrl: {
        equals: normalizedRepoUrl,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingSubmission) {
    if (existingSubmission.status === SubmissionStatus.PENDING) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "You already have a pending submission for this repository URL. Please wait for mentor review before resubmitting."
      );
    }
    if (existingSubmission.status === SubmissionStatus.APPROVED) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This project repository has already been approved by a mentor."
      );
    }
    // Note: If previous submission was REJECTED, the student is allowed to resubmit!
  }

  const submission = await prisma.submission.create({
    data: {
      projectName: payload.projectName.trim(),
      repoUrl: normalizedRepoUrl,
      liveLink: payload.liveLink.trim(),
      description: payload.description.trim(),
      status: SubmissionStatus.PENDING,
      studentId,
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return submission;
};

// 2. Get student's own submissions
const getMySubmissions = async (studentId: string) => {
  const submissions = await prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return submissions;
};

// 3. Get all submissions with server-side pagination, status filter & search (Mentor & Admin View)
const getAllSubmissions = async (filters: ISubmissionFilterQuery) => {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const { status, search, sortBy = "createdAt", sortOrder = "desc" } = filters;

  const andConditions: Prisma.SubmissionWhereInput[] = [];

  // Server-side status filter
  if (status && status !== "ALL") {
    andConditions.push({ status: status as SubmissionStatus });
  }

  // Server-side search filter across project name, description, and student name
  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();
    andConditions.push({
      OR: [
        { projectName: { contains: trimmedSearch, mode: "insensitive" } },
        { description: { contains: trimmedSearch, mode: "insensitive" } },
        {
          student: {
            fullName: { contains: trimmedSearch, mode: "insensitive" },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.SubmissionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Execute data query and total count query concurrently
  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 1, // Latest review feedback
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.submission.count({ where: whereConditions }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data,
  };
};

// 4. Get a single submission by ID with authorization check
const getSingleSubmission = async (
  submissionId: string,
  user: { id: string; role: UserRole }
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project submission not found.");
  }

  // Students can only view their own submissions
  if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this submission."
    );
  }

  return submission;
};

// 5. Review action (Approve or Reject with feedback)
const reviewSubmission = async (
  submissionId: string,
  mentorId: string,
  payload: IReviewSubmissionInput
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project submission not found.");
  }

  // Execute status update and review log atomically in a transaction
  const updatedSubmission = await prisma.$transaction(async (tx) => {
    const updated = await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: payload.status,
      },
    });

    await tx.review.create({
      data: {
        submissionId,
        reviewerId: mentorId,
        status: payload.status,
        feedback: payload.feedback?.trim() || null,
      },
    });

    return updated;
  });

  return updatedSubmission;
};

// 6. Aggregated Dashboard Statistics
const getSubmissionStats = async (): Promise<ISubmissionStats> => {
  const [totalSubmissions, totalPending, totalApproved, totalRejected] =
    await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({
        where: { status: SubmissionStatus.PENDING },
      }),
      prisma.submission.count({
        where: { status: SubmissionStatus.APPROVED },
      }),
      prisma.submission.count({
        where: { status: SubmissionStatus.REJECTED },
      }),
    ]);

  const approvalRatePercentage =
    totalSubmissions > 0
      ? Number(((totalApproved / totalSubmissions) * 100).toFixed(1))
      : 0;

  return {
    totalSubmissions,
    totalPending,
    totalApproved,
    totalRejected,
    approvalRatePercentage,
  };
};

export const SubmissionServices = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSingleSubmission,
  reviewSubmission,
  getSubmissionStats,
};
