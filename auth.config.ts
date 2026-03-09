import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath = ["/login", "/register", "/api/auth"].some((path) => nextUrl.pathname.startsWith(path)) || nextUrl.pathname === "/"

      if (isLoggedIn) {
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (isPublicPath) {
        return true
      }

      return false // Redirige automatiquement vers la page de login configurée
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  providers: [],
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig
