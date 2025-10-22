// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 👇 routes that SHOULD be public
const isPublicRoute = createRouteMatcher([
  "/", // landing
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/questions",
  "/api/exams/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // if NOT public -> protect (redirects to sign-in when unauthenticated)
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// ✅ Recommended matcher from Clerk docs
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
