"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendPrescriptionEmail } from "@/lib/email"
import { generateQRCodeDataUrl } from "@/lib/qrcode"

// ─── Schéma de validation pour la création d'une prescription ─────────────────
const createPrescriptionSchema = z.object({
  patientEmail: z.string().email({ message: "Email patient invalide." }),
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  description: z.string().optional(),
  scheduledDate: z.string().optional(),
})

export type PrescriptionActionState = { error?: string; success?: string; prescriptionId?: string }

// ─── Créer une prescription (réservé aux DOCTOR) ──────────────────────────────
export async function createPrescription(
  prevState: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "DOCTOR") {
      return { error: "Accès refusé. Réservé aux prestataires médicaux." }
    }

    const rawData = Object.fromEntries(formData.entries())
    const { patientEmail, title, description, scheduledDate } = createPrescriptionSchema.parse(rawData)

    // Rechercher le patient par email
    const patient = await prisma.user.findUnique({
      where: { email: patientEmail },
    })
    if (!patient || patient.role !== "PATIENT") {
      return { error: "Aucun patient trouvé avec cet email. Le patient doit d'abord créer son compte." }
    }

    // Créer la prescription en base
    const prescription = await prisma.prescription.create({
      data: {
        title,
        description: description || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        doctorId: session.user.id,
        patientId: patient.id,
        status: "PENDING",
      },
    })

    // Traçabilité médicale
    await prisma.auditLog.create({
      data: {
        action: "PRESCRIPTION_CREATED",
        entity: "Prescription",
        entityId: prescription.id,
        details: { doctorId: session.user.id, patientId: patient.id, title },
        userId: session.user.id,
      },
    })

    // Générer le QR Code (encode le qrCodeId unique)
    const qrCodeDataUrl = await generateQRCodeDataUrl(prescription.qrCodeId)

    // Envoyer email de notification au patient
    await sendPrescriptionEmail({
      patientName: patient.name || "Patient",
      patientEmail: patient.email!,
      doctorName: session.user.name || "Médecin",
      prescription: {
        id: prescription.id,
        qrCodeId: prescription.qrCodeId,
        title: prescription.title,
        description: prescription.description,
        scheduledDate: prescription.scheduledDate,
        createdAt: prescription.createdAt,
      },
      qrCodeDataUrl,
    })

    revalidatePath("/dashboard/doctor/prescriptions")
    revalidatePath("/dashboard")

    return { success: "Prescription créée et envoyée au patient.", prescriptionId: prescription.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("Erreur createPrescription:", error)
    return { error: "Une erreur est survenue lors de la création de la prescription." }
  }
}

// ─── Créer une prescription depuis l'OCR (réservé aux PATIENT) ───────────────
const ocrPrescriptionSchema = z.object({
  title: z.string().min(3, { message: "Le titre est obligatoire." }),
  description: z.string().optional(),
  extractedText: z.string().optional(),
})

export async function createOCRPrescription(
  prevState: PrescriptionActionState,
  formData: FormData
): Promise<PrescriptionActionState> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "PATIENT") {
      return { error: "Accès refusé." }
    }

    const rawData = Object.fromEntries(formData.entries())
    const { title, description, extractedText } = ocrPrescriptionSchema.parse(rawData)

    const prescription = await prisma.prescription.create({
      data: {
        title,
        description: description || null,
        extractedText: extractedText || null,
        patientId: session.user.id,
        status: "PENDING",
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "PRESCRIPTION_OCR_CREATED",
        entity: "Prescription",
        entityId: prescription.id,
        details: { patientId: session.user.id, source: "OCR" },
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/patient/prescriptions")
    revalidatePath("/dashboard")

    return { success: "Ordonnance enregistrée avec succès.", prescriptionId: prescription.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("Erreur createOCRPrescription:", error)
    return { error: "Une erreur est survenue lors de l'enregistrement." }
  }
}

// ─── Récupérer les prescriptions d'un patient ────────────────────────────────
export async function getPatientPrescriptions() {
  const session = await auth()
  if (!session?.user) return []

  return prisma.prescription.findMany({
    where: { patientId: session.user.id, deletedAt: null },
    include: { doctor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
}

// ─── Récupérer les prescriptions créées par un médecin ───────────────────────
export async function getDoctorPrescriptions() {
  const session = await auth()
  if (!session?.user || session.user.role !== "DOCTOR") return []

  return prisma.prescription.findMany({
    where: { doctorId: session.user.id, deletedAt: null },
    include: { patient: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
}
