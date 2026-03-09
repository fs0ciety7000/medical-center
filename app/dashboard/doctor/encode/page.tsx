"use client"

/**
 * Page d'encodage de prescription pour les médecins (rôle DOCTOR)
 * Formulaire structuré → Server Action → QR Code + Email patient
 */
import { useFormState, useFormStatus } from "react-dom"
import { createPrescription } from "@/app/actions/prescriptions"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Stethoscope } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Génération en cours…
        </>
      ) : (
        <>
          <Stethoscope className="w-4 h-4" />
          Générer & Envoyer au Patient
        </>
      )}
    </button>
  )
}

export default function DoctorEncodePage() {
  const [state, formAction] = useFormState(createPrescription, {})

  if (state?.success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Prescription envoyée !</h2>
          <p className="text-zinc-500 text-sm mb-6">{state.success}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/doctor/encode"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nouvelle prescription
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Nouvelle Prescription Radiologique</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Encodez les détails de l'examen. Un QR Code sécurisé sera généré et envoyé par email au patient.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          {state?.error && (
            <div className="mx-6 mt-6 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="p-6 md:p-8 space-y-6">
            {/* Section Patient */}
            <div className="border-b border-zinc-100 pb-6">
              <h2 className="text-base font-semibold text-zinc-900 mb-4">Informations du Patient</h2>
              <div>
                <label htmlFor="patientEmail" className="block text-sm font-medium text-zinc-700">
                  Email du patient *
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="patientEmail"
                    id="patientEmail"
                    required
                    className="block w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="patient@email.com"
                  />
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Le patient doit avoir un compte sur la plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Examen */}
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-zinc-900">Détails de l'Examen</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
                  Type d'examen *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: IRM Genou Droit, Scanner thoraco-abdominal…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
                  Justificatif clinique
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Symptômes, antécédents, zone précise à imager, urgence clinique…"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-zinc-700">
                  Date souhaitée (optionnel)
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="scheduledDate"
                    id="scheduledDate"
                    min={new Date().toISOString().split("T")[0]}
                    className="block w-max px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
              <Link
                href="/dashboard"
                className="py-2.5 px-4 border border-zinc-300 rounded-lg shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors"
              >
                Annuler
              </Link>
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
