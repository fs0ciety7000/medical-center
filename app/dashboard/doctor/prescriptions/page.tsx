/**
 * Page de liste de toutes les prescriptions créées par le médecin
 */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  User,
  XCircle,
} from "lucide-react"

const statusConfig = {
  PENDING: { label: "En attente", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  SCHEDULED: { label: "Planifié", icon: CalendarDays, color: "text-blue-600 bg-blue-50 border-blue-200" },
  COMPLETED: { label: "Terminé", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  CANCELLED: { label: "Annulé", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
}

export default async function DoctorPrescriptionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "DOCTOR") redirect("/dashboard")

  const prescriptions = await prisma.prescription.findMany({
    where: { doctorId: session.user.id, deletedAt: null },
    include: { patient: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900">Mes Prescriptions</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} émise{prescriptions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard/doctor/encode"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle prescription
          </Link>
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
            <p className="text-zinc-500 font-medium">Aucune prescription pour le moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-zinc-100">
              {prescriptions.map((prescription) => {
                const status = statusConfig[prescription.status]
                const StatusIcon = status.icon
                return (
                  <li key={prescription.id} className="px-6 py-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{prescription.title}</p>
                        {prescription.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{prescription.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {prescription.patient?.name || prescription.patient?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(
                              prescription.createdAt
                            )}
                          </span>
                          {prescription.scheduledDate && (
                            <span className="flex items-center gap-1 text-blue-500">
                              <CalendarDays className="w-3 h-3" />
                              {new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(
                                prescription.scheduledDate
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
