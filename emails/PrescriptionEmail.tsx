/**
 * Template d'email React Email pour la notification de prescription
 * Envoyé au patient après création d'une prescription par un médecin
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components"

interface PrescriptionEmailProps {
  patientName: string
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

export function PrescriptionEmailTemplate({
  patientName,
  doctorName,
  prescription,
  qrCodeDataUrl,
}: PrescriptionEmailProps) {
  const formattedDate = prescription.scheduledDate
    ? new Intl.DateTimeFormat("fr-BE", { dateStyle: "full" }).format(prescription.scheduledDate)
    : "À définir"

  const createdAt = new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(prescription.createdAt)

  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre prescription radiologique : {prescription.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* En-tête */}
          <Section style={header}>
            <Text style={logoText}>🏥 Espace Médical</Text>
          </Section>

          {/* Corps */}
          <Section style={body}>
            <Heading style={h1}>Nouvelle prescription</Heading>
            <Text style={paragraph}>Bonjour {patientName},</Text>
            <Text style={paragraph}>
              Le Dr. <strong>{doctorName}</strong> vous a adressé une prescription radiologique via la
              plateforme <em>Espace Médical</em>.
            </Text>

            {/* Bloc prescription */}
            <Section style={prescriptionBox}>
              <Text style={prescriptionTitle}>{prescription.title}</Text>
              {prescription.description && (
                <Text style={prescriptionDesc}>{prescription.description}</Text>
              )}
              <Row>
                <Column>
                  <Text style={metaLabel}>Date souhaitée</Text>
                  <Text style={metaValue}>{formattedDate}</Text>
                </Column>
                <Column>
                  <Text style={metaLabel}>Prescrit le</Text>
                  <Text style={metaValue}>{createdAt}</Text>
                </Column>
              </Row>
            </Section>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <Text style={paragraph}>
                  Présentez ce QR Code lors de votre examen :
                </Text>
                <Img
                  src={qrCodeDataUrl}
                  alt="QR Code prescription"
                  width={180}
                  height={180}
                  style={{ margin: "0 auto", display: "block" }}
                />
                <Text style={qrCodeId}>ID : {prescription.qrCodeId}</Text>
              </Section>
            )}

            <Hr style={divider} />
            <Text style={footer}>
              Ce document est confidentiel et généré automatiquement par la plateforme Espace Médical.
              Ne pas répondre à cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles inline (requis par React Email pour compatibilité client mail) ────
const main = {
  backgroundColor: "#f4f7fb",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "560px",
}

const header = {
  backgroundColor: "#006ccf",
  borderRadius: "8px 8px 0 0",
  padding: "20px 32px",
}

const logoText = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
}

const body = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 8px 8px",
  padding: "32px",
  border: "1px solid #e4e9f2",
}

const h1 = {
  color: "#0a3d74",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
}

const paragraph = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
}

const prescriptionBox = {
  backgroundColor: "#f0f7ff",
  borderRadius: "8px",
  border: "1px solid #bae0fe",
  padding: "16px",
  margin: "16px 0",
}

const prescriptionTitle = {
  color: "#0a3d74",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 8px",
}

const prescriptionDesc = {
  color: "#4b5563",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px",
}

const metaLabel = {
  color: "#6b7280",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 2px",
}

const metaValue = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
}

const qrCodeId = {
  color: "#9ca3af",
  fontSize: "10px",
  fontFamily: "monospace",
  marginTop: "8px",
  textAlign: "center" as const,
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
}

const footer = {
  color: "#9ca3af",
  fontSize: "11px",
  lineHeight: "18px",
  textAlign: "center" as const,
}
