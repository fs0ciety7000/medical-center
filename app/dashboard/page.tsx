/**
 * Dashboard principal — contenu adaptatif selon le rôle (PATIENT / DOCTOR)
 */
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileScan,
  LogOut,
  Plus,
  ShieldCheck,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react"

const statusConfig = {
  PENDING: { label: "En attente", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  SCHEDULED: { label: "Planifié", icon: CalendarDays, color: "text-blue-600 bg-blue-50 border-blue-200" },
  COMPLETED: { label: "Terminé", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  CANCELLED: { label: "Annulé", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { user } = session
  const isDoctor = user.role === "DOCTOR"

  // Récupération des prescriptions selon le rôle
  const prescriptions = isDoctor
    ? await prisma.prescription.findMany({
        where: { doctorId: user.id, deletedAt: null },
        include: { patient: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : await prisma.prescription.findMany({
        where: { patientId: user.id, deletedAt: null },
        include: { doctor: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

  // Compteurs pour les stats
  const total = prescriptions.length
  const pending = prescriptions.filter((p) => p.status === "PENDING").length
  const scheduled = prescriptions.filter((p) => p.status === "SCHEDULED").length
  const completed = prescriptions.filter((p) => p.status === "COMPLETED").length

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Barre de navigation */}
      <nav className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-lg">Espace Médical</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de bienvenue */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Bonjour, {user.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {isDoctor
                ? "Gérez vos prescriptions radiologiques et vos patients."
                : "Consultez vos examens et gérez vos ordonnances."}
            </p>
          </div>
          <div className="flex gap-3">
            {isDoctor ? (
              <Link
                href="/dashboard/doctor/encode"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nouvelle prescription
              </Link>
            ) : (
              <Link
                href="/dashboard/patient/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <FileScan className="w-4 h-4" />
                Scanner une ordonnance
              </Link>
            )}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
            >
              {isDoctor ? (
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <User className="w-4 h-4 text-emerald-600" />
              )}
              {isDoctor ? "Médecin" : "Patient"}
            </Link>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Total", value: total, icon: Activity, color: "text-blue-600" },
            { label: "En attente", value: pending, icon: Clock, color: "text-amber-600" },
            { label: "Planifiés", value: scheduled, icon: CalendarDays, color: "text-blue-600" },
            { label: "Terminés", value: completed, icon: CheckCircle2, color: "text-emerald-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Liste des prescriptions récentes */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">
              {isDoctor ? "Prescriptions récentes" : "Mes examens récents"}
            </h2>
            <Link
              href={isDoctor ? "/dashboard/doctor/prescriptions" : "/dashboard/patient/prescriptions"}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout
            </Link>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isDoctor ? (
                  <Stethoscope className="w-7 h-7 text-zinc-400" />
                ) : (
                  <FileScan className="w-7 h-7 text-zinc-400" />
                )}
              </div>
              <p className="text-zinc-500 text-sm font-medium">Aucune prescription pour le moment</p>
              <p className="text-zinc-400 text-xs mt-1">
                {isDoctor
                  ? "Créez votre première prescription en cliquant sur le bouton ci-dessus."
                  : "Scannez une ordonnance ou attendez qu'un médecin en encode une pour vous."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {prescriptions.map((prescription) => {
                const status = statusConfig[prescription.status]
                const StatusIcon = status.icon
                return (
                  <li key={prescription.id} className="px-6 py-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {prescription.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {isDoctor
                            ? `Patient : ${"patient" in prescription && prescription.patient?.name || "Inconnu"}`
                            : `Dr. ${"doctor" in prescription && prescription.doctor?.name || "Non assigné"}`}
                          {" · "}
                          {new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(
                            prescription.createdAt
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
