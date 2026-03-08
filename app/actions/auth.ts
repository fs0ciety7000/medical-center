"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { AuthError } from "next-auth"

// Singleton pour contourner les comportements HMR de Next en dev (hors scope MVP, on garde simple)
const prisma = new PrismaClient()

// Schémas de validation avec Zod pour garantir la sécurité à l'entrée
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir 6 caractères min." }),
})

const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom est trop court" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir 6 caractères min." }),
  role: z.enum(["PATIENT", "DOCTOR"]).default("PATIENT"),
})

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = loginSchema.parse(rawData)

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirectTo: "/dashboard", // Redirigé par le middleware si besoin
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides." }
        default:
          return { error: "Une erreur d'authentification est survenue." }
      }
    }
    throw error // Re-throw error pour permettre à Next de la gérer as a boundary
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const { name, email, password, role } = registerSchema.parse(rawData)

    // Vérifier si l'utilisateur existe déjà
    const userExists = await prisma.user.findUnique({
      where: { email },
    })

    if (userExists) {
        return { error: "Un utilisateur avec cet email existe déjà." }
    }

    // Hasher le mot de passe avant insertion (bcryptjs)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // En vrai MVP, on laisserait l'user choisir, 
        // ou un process d'admin pour `DOCTOR`
        role: role as any, 
      },
    })

    // Logger l'action pour la sécurité médicale
    await prisma.auditLog.create({
      data: {
         action: "USER_REGISTERED",
         entity: "User",
         entityId: user.id,
         details: { role: user.role }
      }
    })

    // Login immédiat 
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
        return { error: error.errors[0].message }
    }
    return { error: "Une erreur empêche la création du compte." }
  }
}
