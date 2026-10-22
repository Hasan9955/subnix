import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../config";
import httpStatus from "http-status";
import { jwtHelpers } from "../helpers/jwtHelpers";
import prisma from "../lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import ApiError from "../errors/ApiError";

const auth = (...roles: (UserRole | string)[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const headersAuth = req.headers.authorization;

      if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authorization header missing or invalid format (Bearer token expected)"
        );
      }

      const token: string | undefined = headersAuth.split(" ")[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "No token provided!");
      }

      // 1. Verify JWT signature & validity
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret
      ) as JwtPayload;

      if (!verifiedUser || !verifiedUser.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token!");
      }

      // 2. Fetch user from database to ensure fresh status & role
      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User account no longer exists!");
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked!");
      }

      // 3. Verify Role-Based Access Control (RBAC)
      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access forbidden: requires ${roles.join(" or ")} privileges!`
        );
      }

      // Attach authenticated user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
