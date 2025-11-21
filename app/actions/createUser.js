"use server";

import { db } from "@/lib/prisma";

export async function createUser(userData) {
  try {
    const { clerkUserId, email, name, imageUrl } = userData;

    if (!clerkUserId || !email) {
      return {
        success: false,
        error: "Missing required user data",
      };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (existingUser) {
      return {
        success: true,
        message: "User already exists",
        user: existingUser,
      };
    }

    // Create new user
    const newUser = await db.user.create({
      data: {
        clerkUserId,
        email,
        name: name || null,
        imageUrl: imageUrl || null,
      },
    });

    console.log("createUser: ✅ User created:", newUser.email);

    return {
      success: true,
      message: "User created successfully",
      user: newUser,
    };
  } catch (error) {
    console.error("createUser error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

