import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    // First check if user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      // User not signed in - this is normal, not an error
      return null;
    }

    // Then get full user details
    const user = await currentUser();

    if (!user) {
      console.error("checkUser: auth() returned userId but currentUser() returned null");
      return null;
    }

    console.log("checkUser: Clerk user found:", {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    });

    // Check if user already exists in database
    let existingUser;
    try {
      existingUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
      });
    } catch (dbError) {
      console.error("checkUser: Database connection error when checking user:", dbError);
      throw dbError;
    }

    if (existingUser) {
      console.log("checkUser: User already exists in DB:", existingUser.id);
      return existingUser;
    }

    // Create new user in database
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("checkUser: Clerk user has no email, cannot create DB user");
      return null;
    }

    console.log("checkUser: Creating new user in database...");
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    console.log("checkUser: ✅ Successfully created new DB user:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      clerkUserId: newUser.clerkUserId,
    });
    return newUser;
  } catch (error) {
    // Log detailed error information
    console.error("checkUser: ❌ Error syncing user to database:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return null;
  }
};
