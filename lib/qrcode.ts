/**
 * Génération de QR Code côté serveur
 * Retourne un data URL base64 embarquable dans les emails et pages
 */
import QRCode from "qrcode"

/**
 * Génère un QR Code à partir d'un identifiant de prescription
 * @param qrCodeId - L'UUID unique de la prescription
 * @returns data URL (image/png base64)
 */
export async function generateQRCodeDataUrl(qrCodeId: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(qrCodeId, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#0a3d74",  // Medical Blue foncé
        light: "#ffffff",
      },
    })
    return dataUrl
  } catch (error) {
    console.error("Erreur génération QR Code:", error)
    // Retourne un QR code vide en cas d'erreur
    return ""
  }
}
