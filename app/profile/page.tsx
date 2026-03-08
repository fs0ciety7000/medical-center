import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { ShieldCheck, User, Mail, Hash, Stethoscope, FileScan, LogOut } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-zinc-900 font-sans flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-500" />
              Profil Utilisateur
            </h3>
            {user.role === "DOCTOR" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Prestataire Médical
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <User className="w-3.5 h-3.5" />
                    Patient
                </span>
            )}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nom complet
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900 pl-6">{user.name || "Non renseigné"}</dd>
                </div>
                <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Adresse Email
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900 pl-6">{user.email}</dd>
                </div>
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        ID Unique (UUID)
                    </dt>
                    <dd className="mt-2 text-xs text-zinc-600 font-mono bg-zinc-100 p-3 rounded-md border border-zinc-200">
                        {user.id}
                    </dd>
                </div>
            </dl>
        </div>

        {/* Actions conditionnelles selon le Rôle */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
             {user.role === "DOCTOR" && (
                <a 
                    href="/dashboard/doctor/encode" 
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                >
                    <Stethoscope className="w-4 h-4" />
                    Créer une prescription
                </a>
             )}
             
             {user.role === "PATIENT" && (
                 <a 
                    href="/dashboard/patient/upload" 
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
                 >
                    <FileScan className="w-4 h-4" />
                    Scanner une ordonnance
                 </a>
             )}

            <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
            }} className="flex-none w-full sm:w-auto">
                <button type="submit" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                </button>
            </form>
        </div>
      </div>
    </div>
  )
}
