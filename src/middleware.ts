import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.JWT_SECRET });
    console.log('token: ', token);
    const url = request.nextUrl;

    // Redirect logged-in users away from auth pages
    if (token && (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up") || url.pathname.startsWith("/verify") || url.pathname === "/")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users away from dashboard
    if (!token && url.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // ✅ Attach user ID to API requests
    console.log('token: ', token);
    if (token && url.pathname.startsWith("/api/")) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("X-User-Id", token.user._id);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    return NextResponse.next();
}

//Apply middleware to authentication pages, dashboard, and API routes
export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/",
        "/dashboard/:path*",
        "/api/prayers/:path*", // Protect all prayer tracking API routes
    ],
};
