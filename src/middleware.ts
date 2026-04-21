// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// routes that SHOULD be public
const isPublicRoute = createRouteMatcher([
  "/", // landing
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/profile(.*)", // important for Clerk <UserProfile />
  "/api/webhooks/clerk",
  "/api/stripe/webhook",
  "/api/questions",
  "/api/exams/(.*)",
  "/practice",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
