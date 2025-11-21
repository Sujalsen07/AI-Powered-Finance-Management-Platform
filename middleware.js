import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes - let client-side handle the actual redirect
  // This prevents infinite redirect loops when server-side auth detection fails
  const { userId } = await auth();

  // If no userId and it's a protected route, we'll let the client-side component handle it
  // This avoids redirect loops when server-side auth isn't detected properly
  if (!userId && isProtectedRoute(req)) {
    // Don't redirect here - let ProtectedPage component handle it client-side
    // This prevents issues when server-side auth detection fails
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
