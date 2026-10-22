import * as bcrypt from "bcrypt";
import { UserRole, UserStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

interface IUserQueryOptions {
  page?: number | string;
  limit?: number | string;
  role?: UserRole;
  search?: string;
}

const getAllUsers = async (options: IUserQueryOptions) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  const whereConditions: any = {};

  if (options.role) {
    whereConditions.role = options.role;
  }

  if (options.search) {
    whereConditions.OR = [
      { fullName: { contains: options.search, mode: "insensitive" } },
      { email: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { submissions: true, reviews: true },
        },
      },
    }),
    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      submissions: {
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUserStatus,
};
