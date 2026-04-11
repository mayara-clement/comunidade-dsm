import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  if (isDashboard && req.auth?.user) {
    const path = req.nextUrl.pathname;
    const u = req.auth.user;

    if (path.startsWith("/dashboard/founder") && !u.isPlatformFounder) {
      if (u.ownedCommunityId) {
        return NextResponse.redirect(new URL("/dashboard/community-owner", req.nextUrl.origin));
      }
      if (u.memberCommunityId) {
        return NextResponse.redirect(new URL("/dashboard/member", req.nextUrl.origin));
      }
      return NextResponse.redirect(new URL("/login?error=pending_approval", req.nextUrl.origin));
    }

    if (path.startsWith("/dashboard/community-owner") && !u.ownedCommunityId) {
      if (u.isPlatformFounder) {
        return NextResponse.redirect(new URL("/dashboard/founder", req.nextUrl.origin));
      }
      if (u.memberCommunityId) {
        return NextResponse.redirect(new URL("/dashboard/member", req.nextUrl.origin));
      }
      return NextResponse.redirect(new URL("/login?error=pending_approval", req.nextUrl.origin));
    }

    if (path.startsWith("/dashboard/member") && !u.memberCommunityId) {
      if (u.ownedCommunityId) {
        return NextResponse.redirect(new URL("/dashboard/community-owner", req.nextUrl.origin));
      }
      if (u.isPlatformFounder) {
        return NextResponse.redirect(new URL("/dashboard/founder", req.nextUrl.origin));
      }
      return NextResponse.redirect(new URL("/login?error=pending_approval", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
