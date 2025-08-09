// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Public routes - allow these without authentication
  const publicRoutes = [
    "/",
    "/sign-in",
    "/form",
    "/privacy-policy",
    "/api/generate-object-id",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, we'll let Firebase handle authentication on the client side
  // This middleware now only handles routing logic
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
