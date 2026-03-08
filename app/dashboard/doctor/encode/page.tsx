import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DoctorEncodePage() {
    const session = await auth()

    if (!session || session?.user?.role !== "DOCTOR") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 font-sans">
                        Nouvelle Prescription Radiologique
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Encodez les détails de l'examen pour générer un QR Code sécurisé pour le patient.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                    {/* Le traitement se ferait via `action={createPrescription}` (Server action) 
                        Dans un vrai MVP on ajouterait des libs comme react-select pour l'autocomplétion des patients. */}
                    <form className="p-6 md:p-8 space-y-6">
                        
                        {/* Section Patient */}
                        <div className="border-b border-zinc-100 pb-6">
                            <h2 className="text-base font-medium text-zinc-900 mb-4">Informations du Patient</h2>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label htmlFor="patientEmail" className="block text-sm font-medium text-zinc-700">
                                        Email ou Numéro de Dossier
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="email"
                                            name="patientEmail"
                                            id="patientEmail"
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="patient@email.com"
                                        />
                                        <button type="button" className="ml-3 inline-flex justify-center py-2 px-4 border border-zinc-300 shadow-sm text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50">
                                            Rechercher
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Examen */}
                        <div className="pt-2">
                            <h2 className="text-base font-medium text-zinc-900 mb-4">Détails de l'Examen</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
                                        Type d'examen (Titre)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Ex: IRM Genou Droit"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
                                        Justificatif Clinique (Description)
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Indiquez les symptômes, antécédents et la zone précise à imager..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-zinc-700">
                                        Date souhaitée (Optionnel)
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="date"
                                            name="scheduledDate"
                                            id="scheduledDate"
                                            className="block w-max px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
                            <button
                                type="button"
                                className="bg-white py-2 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Générer & Envoyer au Patient
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
