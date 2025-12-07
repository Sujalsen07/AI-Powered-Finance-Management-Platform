import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    // First check if user is authenticated
    let userId;
    try {
      const authResult = await auth();
      userId = authResult?.userId;
    } catch (authError) {
      console.error("checkUser: Error calling auth():", {
        error: authError?.message || String(authError),
        name: authError?.name,
      });
      // If auth fails, user is not authenticated - this is normal
      return null;
    }
    
    if (!userId) {
      // User not signed in - this is normal, not an error
      return null;
    }

    // Then get full user details
    let user;
    try {
      user = await currentUser();
    } catch (userError) {
      console.error("checkUser: Error calling currentUser():", {
        error: userError?.message || String(userError),
        name: userError?.name,
      });
      return null;
    }

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

    // Create or link user in database
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("checkUser: Clerk user has no email, cannot create DB user");
      return null;
    }

    // Handle pre-existing records created outside Clerk by linking on email
    let emailUser;
    try {
      emailUser = await db.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error("checkUser: Database error when checking email:", {
        error: dbError?.message || String(dbError),
        code: dbError?.code,
      });
      throw dbError;
    }

    if (emailUser) {
      console.log("checkUser: Found existing DB user with same email, linking Clerk account:", emailUser.id);
      try {
        const updatedUser = await db.user.update({
          where: { id: emailUser.id },
          data: {
            clerkUserId: user.id,
            name,
            imageUrl: user.imageUrl,
          },
        });

        console.log("checkUser: ✅ Linked Clerk user to existing DB record:", {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          clerkUserId: updatedUser.clerkUserId,
        });
        return updatedUser;
      } catch (updateError) {
        console.error("checkUser: Database error when updating user:", {
          error: updateError?.message || String(updateError),
          code: updateError?.code,
          meta: updateError?.meta,
        });
        throw updateError;
      }
    }

    console.log("checkUser: Creating new user in database...");
    try {
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
    } catch (createError) {
      console.error("checkUser: Database error when creating user:", {
        error: createError?.message || String(createError),
        code: createError?.code,
        meta: createError?.meta,
      });
      throw createError;
    }
  } catch (error) {
    // Log detailed error information with better error handling
    const errorDetails = {
      message: error?.message || "Unknown error",
      name: error?.name || "Error",
      code: error?.code || undefined,
      meta: error?.meta || undefined,
      stack: error?.stack || undefined,
    };

    // Try to stringify for better logging, fallback to error object
    try {
      console.error("checkUser: ❌ Error syncing user to database:", errorDetails);
      
      // Also log the raw error for debugging
      if (error && typeof error === 'object') {
        console.error("checkUser: Raw error object:", error);
      }
    } catch (logError) {
      // If logging fails, at least log something
      console.error("checkUser: ❌ Error syncing user to database (logging failed):", String(error));
    }
    
    return null;
  }
};
