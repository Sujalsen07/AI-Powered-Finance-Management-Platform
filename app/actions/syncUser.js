"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function syncUser() {
  try {
    console.log("syncUser: Starting sync process...");
    
    // Try currentUser() first - sometimes this works better
    let user = await currentUser();
    
    // If currentUser() doesn't work, try auth()
    if (!user) {
      console.log("syncUser: currentUser() returned null, trying auth()...");
      const { userId } = await auth();
      
      if (!userId) {
        console.log("syncUser: No authentication found");
        return {
          success: false,
          error: "Not authenticated - please sign in and try again. Make sure you're signed in and refresh the page.",
        };
      }
      
      // Try currentUser() again after auth()
      user = await currentUser();
      
      if (!user) {
        console.error("syncUser: currentUser() still null after auth()");
        return {
          success: false,
          error: "User not found - authentication issue. Try signing out and signing back in.",
        };
      }
    }

    console.log("syncUser: User found:", {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) {
      return {
        success: true,
        message: "User already exists",
        user: existingUser,
      };
    }

    // Create new user
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return {
        success: false,
        error: "User has no email",
      };
    }

    console.log("syncUser: Creating user in database...");
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    console.log("syncUser: ✅ User created successfully:", {
      id: newUser.id,
      email: newUser.email,
    });

    return {
      success: true,
      message: "User created successfully",
      user: newUser,
    };
  } catch (error) {
    console.error("syncUser error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

