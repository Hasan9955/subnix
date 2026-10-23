import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Student registration
router.post(
  "/signup",
  validateRequest(authValidation.studentSignupSchema),
  AuthControllers.signupStudent
);

// User login (Student, Mentor, Admin)
router.post(
  "/login",
  validateRequest(authValidation.userLoginSchema),
  AuthControllers.loginUser
);

// Get current user profile
router.get("/me", auth(), AuthControllers.getProfile);

export const AuthRouters = router;
