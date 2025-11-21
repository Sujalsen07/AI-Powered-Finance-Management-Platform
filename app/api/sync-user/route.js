import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Use auth() first to check authentication - pass the request
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      console.error("API sync-user: No userId found in auth()");
      return NextResponse.json(
        { error: "Not authenticated", details: "No userId in auth result" },
        { status: 401 }
      );
    }

    console.log("API sync-user: User authenticated, userId:", userId);

    // Then get full user details
    const user = await currentUser();
    
    if (!user) {
      console.error("API sync-user: currentUser() returned null despite userId existing");
      return NextResponse.json(
        { error: "User not found", details: "currentUser returned null" },
        { status: 404 }
      );
    }

    console.log("API sync-user: User found:", user.emailAddresses[0]?.emailAddress);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) {
      return NextResponse.json({
        message: "User already exists",
        user: existingUser,
      });
    }

    // Create new user
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User has no email" },
        { status: 400 }
      );
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("API sync-user error:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: error.message,
        code: error.code,
        meta: error.meta,
      },
      { status: 500 }
    );
  }
}

