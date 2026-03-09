"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect"

// Schémas de validation Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
})

const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom est trop court (min. 2 caractères)." }),
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  role: z.enum(["PATIENT", "DOCTOR"]).default("PATIENT"),
})

export type ActionState = { error?: string; success?: string }

export async function loginUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = loginSchema.parse(rawData)

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirectTo: "/dashboard",
    })

    return { success: "Connexion réussie." }
  } catch (error) {
    // Next.js lance une erreur de redirection interne — il faut la laisser passer
    if (isRedirectError(error)) throw error

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides. Vérifiez votre email et mot de passe." }
        default:
          return { error: "Une erreur d'authentification est survenue." }
      }
    }
    return { error: "Une erreur inattendue est survenue." }
  }
}

export async function registerUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const { name, email, password, role } = registerSchema.parse(rawData)

    // Vérifier si l'email est déjà utilisé
    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return { error: "Un compte avec cet email existe déjà." }
    }

    // Hashage sécurisé du mot de passe (bcrypt, coût 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    })

    // Traçabilité médicale obligatoire
    await prisma.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        details: { role: user.role },
      },
    })

    // Connexion automatique après inscription
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })

    return { success: "Compte créé avec succès." }
  } catch (error) {
    if (isRedirectError(error)) throw error

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Une erreur est survenue lors de la création du compte." }
  }
}
