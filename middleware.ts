import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = ["/login", "/register", "/api/auth"]

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req

  // Lecture directe du JWT depuis le cookie — sans requête HTTP interne
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  })

  const isLoggedIn = !!token
  const isPublicPath =
    publicPaths.some((path) => nextUrl.pathname.startsWith(path)) ||
    nextUrl.pathname === "/"

  // 1. Déjà connecté → pas besoin d'afficher /login ou /register
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // 2. Non connecté → protège les routes privées
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 3. Restriction rôle Doctor
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard/doctor")) {
    const userRole = (token as any)?.role
    if (userRole !== "DOCTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
