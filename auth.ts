import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"
// On utilisera bcryptjs car il compile mieux dans certains environnements Next.js
import bcrypt from "bcryptjs"
// On importera le client Prisma ultérieurement via un fichier lib, pour l'instant on mock
import { PrismaClient } from "@prisma/client"

// Note: En production on utiliserait un singleton pour lib/prisma.ts.
const prisma = new PrismaClient()

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
             // On retourne un objet User compatible NextAuth (sans hash)
             return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
             } 
          }
        }

        console.log("Invalid credentials")
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
        // user objet est dispo SEULEMENT à la connexion
        if (user) {
            token.role = user.role;
            token.id = user.id;
        }
        return token
    },
    async session({ session, token }) {
        if (token && session.user) {
            session.user.role = token.role as string;
            session.user.id = token.id as string;
        }
        return session
    }
  },
  session: {
      strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  }
})
