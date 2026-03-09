import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicPath = ["/login", "/register", "/api/auth"].some((path) => nextUrl.pathname.startsWith(path)) || nextUrl.pathname === "/"

  if (isLoggedIn) {
    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
