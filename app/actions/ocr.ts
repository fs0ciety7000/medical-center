"use server"

// En production, nous utiliserions `@google-cloud/vision`.
// Pour le MVP et la légèreté de la stack Edge (Server Actions Next.js), on peut appeler l'API REST Google Cloud.
// POST https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY
import { z } from "zod";

// Schema de protection
const ImageSchema = z.object({
  base64Image: z.string().min(10, { message: "L'image ne peut pas être vide" }),
});

export async function processPrescriptionImage(base64Image: string) {
  try {
    // 1. Validation de l'entrée
    const validated = ImageSchema.parse({ base64Image });
    
    // Nettoyer le préfixe data:image/jpeg;base64, si existant
    const cleanBase64 = validated.base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("L'API Google Vision n'est pas configurée.");
    }

    // 2. Préparation du payload pour Google Cloud Vision (DOCUMENT_TEXT_DETECTION)
    // Utile pour les documents manuscrits denses.
    const requestPayload = {
      requests: [
        {
          image: {
            content: cleanBase64,
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 1 // On a juste besoin de la string consolidée
            },
          ],
        },
      ],
    };

    // 3. Appel à l'API Google
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
        console.error("Google Vision API error", await response.text());
        return { error: "Erreur lors du traitement par reconnaissance de caractères." };
    }

    const data = await response.json();
    
    // 4. Extraction du texte
    // Le premier résultat contient `fullTextAnnotation` qui groupe tout.
    const extractedText = data.responses?.[0]?.fullTextAnnotation?.text;

    if (!extractedText) {
        return { error: "Aucun texte n'a pu être extrait de cette ordonnance." };
    }

    // Ici on pourrait structurer le texte brut via un appel LLM OpenAI/Mistral en 
    // extrayant Medicament A, Nom du médecin, etc.
    // Pour l'instant on retourne brut
    
    return { success: true, text: extractedText };

  } catch (error) {
    if (error instanceof z.ZodError) {
        return { error: error.errors[0].message };
    }
    console.error("OCR Processing error: ", error);
    return { error: "Une erreur réseau est survenue lors de la soumission du fichier." };
  }
}
