import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../config";
import prisma from "../lib/prisma";

const seedUsers = async () => {
  try {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 12;

    // 1. Seed Super Admin
    const adminEmail = (config.super_admin_email as string) || "admin@subnix.com";
    const isAdminExists = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!isAdminExists) {
      const hashedPassword = await bcrypt.hash(
        (config.super_admin_password as string) || "admin123",
        saltRounds
      );

      await prisma.user.create({
        data: {
          fullName: "System Admin",
          email: adminEmail,
          password: hashedPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          isVerified: true,
        },
      });
      console.log("✅ Super Admin seeded successfully:", adminEmail);
    }

    // 2. Seed Lead Mentor
    const mentorEmail = "mentor@subnix.com";
    const isMentorExists = await prisma.user.findUnique({
      where: { email: mentorEmail },
    });

    if (!isMentorExists) {
      const hashedPassword = await bcrypt.hash("mentor123", saltRounds);

      await prisma.user.create({
        data: {
          fullName: "Lead Mentor",
          email: mentorEmail,
          password: hashedPassword,
          role: UserRole.MENTOR,
          status: UserStatus.ACTIVE,
          isVerified: true,
        },
      });
      console.log("✅ Lead Mentor seeded successfully:", mentorEmail);
    }
  } catch (error) {
    console.error("❌ Error seeding initial users:", error);
  }
};

export default seedUsers;
