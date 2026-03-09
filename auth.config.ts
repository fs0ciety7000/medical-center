import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath =
        ["/login", "/register", "/api/auth"].some((path) => nextUrl.pathname.startsWith(path)) ||
        nextUrl.pathname === "/"

      if (isLoggedIn) {
        // Rediriger la page d'accueil ou les pages d'auth vers le dashboard
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        // Restreindre le dashboard médecin
        if (nextUrl.pathname.startsWith("/dashboard/doctor") && (auth.user as any)?.role !== "DOCTOR") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      // Autoriser les pages publiques si non connecté
      if (isPublicPath) {
        return true
      }

      // Rediriger tout le reste vers /login
      return false
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
  providers: [], // Configuré dynamiquement dans auth.ts pour éviter d'importer Prisma dans le Middleware
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig
