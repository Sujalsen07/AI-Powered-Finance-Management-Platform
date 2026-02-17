import { clerkMiddleware } from "@clerk/nextjs/server";

// Keep middleware very small so it fits Vercel's Edge size limits.
// Heavy logic (Arcjet, database, etc.) should run in API routes or
// server components, not in middleware.
export default clerkMiddleware();

// Run on all routes (including API), except Next.js internals/static assets.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
