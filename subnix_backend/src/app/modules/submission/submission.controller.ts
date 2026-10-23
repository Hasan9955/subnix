import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { SubmissionServices } from "./submission.service";

// 1. Create submission (Student)
const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.id;
  const result = await SubmissionServices.createSubmission(
    studentId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Project submitted successfully!",
    data: result,
  });
});

// 2. Get student's own submissions
const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.id;
  const result = await SubmissionServices.getMySubmissions(studentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Your submissions retrieved successfully.",
    data: result,
  });
});

// 3. Get all submissions with pagination & filters (Mentor/Admin)
const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await SubmissionServices.getAllSubmissions(filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Submissions retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

// 4. Get a single submission by ID
const getSingleSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await SubmissionServices.getSingleSubmission(id, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Submission details retrieved successfully.",
    data: result,
  });
});

// 5. Mentor review action (Approve or Reject with feedback)
const reviewSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const mentorId = req.user.id;
  const result = await SubmissionServices.reviewSubmission(
    id,
    mentorId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `Submission status updated to ${req.body.status} successfully.`,
    data: result,
  });
});

// 6. Aggregated Dashboard Statistics
const getSubmissionStats = catchAsync(async (req: Request, res: Response) => {
  const result = await SubmissionServices.getSubmissionStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Submission statistics retrieved successfully.",
    data: result,
  });
});

export const SubmissionControllers = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSingleSubmission,
  reviewSubmission,
  getSubmissionStats,
};
