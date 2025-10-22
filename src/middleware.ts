// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Pages/api that should NOT require auth:
  publicRoutes: [
    "/", // landing
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/clerk", // webhook must stay public
    "/api/questions", // if you allow guest practice fetch
    // "/api/dev/(.*)", // any dev probes you created
    "/api/exams/(.*)",
  ],
});

export const config = {
  // Run on all routes except static files and _next
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/api/(.*)"],
};
