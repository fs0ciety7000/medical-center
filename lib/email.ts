/**
 * Service d'envoi d'emails via Resend API
 * Utilise React Email pour des templates HTML soignés
 */
import { Resend } from "resend"
import { PrescriptionEmailTemplate } from "@/emails/PrescriptionEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendPrescriptionEmailParams {
  patientName: string
  patientEmail: string
  doctorName: string
  prescription: {
    id: string
    qrCodeId: string
    title: string
    description: string | null
    scheduledDate: Date | null
    createdAt: Date
  }
  qrCodeDataUrl: string
}

/**
 * Envoie un email de notification au patient avec le récapitulatif de prescription et le QR Code.
 * Échoue silencieusement si RESEND_API_KEY n'est pas configuré (permet de fonctionner sans email en dev).
 */
export async function sendPrescriptionEmail(params: SendPrescriptionEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY non configuré — email non envoyé.")
    return
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@espace-medical.fr"

    const { error } = await resend.emails.send({
      from: `Espace Médical <${fromEmail}>`,
      to: [params.patientEmail],
      subject: `Votre prescription : ${params.prescription.title}`,
      react: PrescriptionEmailTemplate({
        patientName: params.patientName,
        doctorName: params.doctorName,
        prescription: params.prescription,
        qrCodeDataUrl: params.qrCodeDataUrl,
      }),
    })

    if (error) {
      console.error("Erreur Resend:", error)
    }
  } catch (error) {
    console.error("Erreur envoi email:", error)
  }
}
