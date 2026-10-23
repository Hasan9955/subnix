import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { UserRole, UserStatus } from "@prisma/client";
import { IAuthResponse, IRegisterStudent, IUserLogin } from "./auth.interface";

const signupStudent = async (payload: IRegisterStudent): Promise<IAuthResponse> => {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "An account with this email address already exists."
    );
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      isVerified: true,
    },
  });

  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };

  const accessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

const loginUser = async (payload: IUserLogin): Promise<IAuthResponse> => {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password combination."
    );
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated. Please contact support."
    );
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password combination."
    );
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User profile not found.");
  }

  return user;
};

export const AuthServices = {
  signupStudent,
  loginUser,
  getProfile,
};
