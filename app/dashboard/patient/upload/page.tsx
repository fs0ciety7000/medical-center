"use client"

/**
 * Page d'upload OCR pour les patients
 * Flux : Photo ordonnance → base64 → Google Vision → Vérification → Enregistrement
 */
import { useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { processPrescriptionImage } from "@/app/actions/ocr"
import { createOCRPrescription } from "@/app/actions/prescriptions"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Loader2,
  ScanLine,
  Upload,
} from "lucide-react"
import Link from "next/link"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      {pending ? "Enregistrement…" : "Valider et enregistrer"}
    </button>
  )
}

type OcrStep = "upload" | "processing" | "verify" | "done"

export default function PatientUploadPage() {
  const [step, setStep] = useState<OcrStep>("upload")
  const [extractedText, setExtractedText] = useState("")
  const [ocrError, setOcrError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saveState, saveAction] = useFormState(createOCRPrescription, {})

  // Gestion de la sélection du fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setOcrError("Veuillez sélectionner un fichier image (JPG, PNG, etc.).")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setOcrError("L'image ne doit pas dépasser 8 Mo.")
      return
    }

    setOcrError("")
    setPreviewUrl(URL.createObjectURL(file))
    setStep("processing")

    // Convertir en base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const base64 = reader.result as string
      try {
        const result = await processPrescriptionImage(base64)
        if (result.error) {
          setOcrError(result.error)
          setStep("upload")
        } else if (result.text) {
          setExtractedText(result.text)
          setStep("verify")
        }
      } catch {
        setOcrError("Une erreur réseau est survenue. Réessayez.")
        setStep("upload")
      }
    }
    reader.onerror = () => {
      setOcrError("Impossible de lire le fichier.")
      setStep("upload")
    }
  }

  if (step === "done" || saveState?.success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Ordonnance enregistrée !</h2>
          <p className="text-zinc-500 text-sm mb-6">{saveState.success}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Numériser une ordonnance</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Photographiez ou importez votre ordonnance manuscrite. Notre IA extraira le texte automatiquement.
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { key: "upload", label: "Import" },
            { key: "processing", label: "Analyse" },
            { key: "verify", label: "Vérification" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.key
                    ? "bg-blue-600 text-white"
                    : step === "verify" && i < 2
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {step === "verify" && i < 2 ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium text-zinc-500">{s.label}</span>
              {i < 2 && <div className="w-8 h-px bg-zinc-200" />}
            </div>
          ))}
        </div>

        {/* Étape 1 : Zone d'upload */}
        {step === "upload" && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
            {ocrError && (
              <div className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{ocrError}</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-300 rounded-xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-zinc-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-700">Importer une ordonnance</p>
                <p className="text-sm text-zinc-400 mt-1">Glissez-déposez ou cliquez pour parcourir</p>
                <p className="text-xs text-zinc-400 mt-2">JPG, PNG, HEIC — max. 8 Mo</p>
              </div>
            </button>
          </div>
        )}

        {/* Étape 2 : Traitement en cours */}
        {step === "processing" && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">Analyse en cours…</h3>
            <p className="text-sm text-zinc-500">Google Cloud Vision analyse votre ordonnance.</p>
            {previewUrl && (
              <div className="mt-6 max-h-48 overflow-hidden rounded-lg border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Aperçu ordonnance" className="w-full object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Étape 3 : Vérification et correction */}
        {step === "verify" && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-600" />
                Vérifiez et complétez les informations
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Corrigez les champs si nécessaire avant de valider.
              </p>
            </div>

            {previewUrl && (
              <div className="p-4 border-b border-zinc-100">
                <div className="max-h-40 overflow-hidden rounded-lg border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Ordonnance analysée" className="w-full object-contain" />
                </div>
              </div>
            )}

            {saveState?.error && (
              <div className="mx-6 mt-4 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{saveState.error}</span>
              </div>
            )}

            <form action={saveAction} className="p-6 space-y-5">
              <input type="hidden" name="extractedText" value={extractedText} />

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">
                  Type d'examen (titre)
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Ex: Radiographie thorax, IRM genou…"
                  className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
                  Texte extrait par l'IA (vérifiez et corrigez)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={extractedText}
                  className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => { setStep("upload"); setExtractedText(""); setPreviewUrl(null) }}
                  className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  ← Nouvelle image
                </button>
                <SaveButton />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
