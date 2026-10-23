import express from "express";
import { AuthRouters } from "../modules/auth/auth.routes";
import { SubmissionRouters } from "../modules/submission/submission.routes";
import { UserRouters } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/submissions",
    route: SubmissionRouters,
  },
  {
    path: "/users",
    route: UserRouters,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
