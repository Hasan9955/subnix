import express from "express";
import { UserControllers } from "./user.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

// Admin: Get all users (filterable by role, search, pagination)
router.get("/", auth(UserRole.ADMIN), UserControllers.getAllUsers);

// Admin & Mentor: Get single user details by ID
router.get("/:id", auth(UserRole.ADMIN, UserRole.MENTOR), UserControllers.getUserById);

// Admin: Update user status (ACTIVE, BLOCKED)
router.patch("/:id/status", auth(UserRole.ADMIN), UserControllers.updateUserStatus);

export const UserRouters = router;
