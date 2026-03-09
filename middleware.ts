import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Exporte uniquement l'instance NextAuth utilisant la config sans Prisma
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
