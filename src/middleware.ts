import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  if (isDashboard && req.auth?.user) {
    const path = req.nextUrl.pathname;
    const role = req.auth.user.role;
    if (path.startsWith("/dashboard/founder") && role !== "FOUNDER") {
      return NextResponse.redirect(new URL("/dashboard/member", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
