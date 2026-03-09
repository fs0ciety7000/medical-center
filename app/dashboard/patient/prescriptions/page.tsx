/**
 * Page de liste de toutes les prescriptions du patient
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
  FileScan,
  Stethoscope,
  XCircle,
} from "lucide-react"

const statusConfig = {
  PENDING: { label: "En attente", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  SCHEDULED: { label: "Planifié", icon: CalendarDays, color: "text-blue-600 bg-blue-50 border-blue-200" },
  COMPLETED: { label: "Terminé", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  CANCELLED: { label: "Annulé", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
}

export default async function PatientPrescriptionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "PATIENT") redirect("/dashboard")

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: session.user.id, deletedAt: null },
    include: { doctor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Mes Examens</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Historique de toutes vos prescriptions radiologiques.
          </p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
            <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileScan className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-medium">Aucune prescription</p>
            <p className="text-zinc-400 text-sm mt-1 mb-6">
              Scannez une ordonnance ou attendez qu'un médecin en encode une pour vous.
            </p>
            <Link
              href="/dashboard/patient/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileScan className="w-4 h-4" />
              Scanner une ordonnance
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const status = statusConfig[prescription.status]
              const StatusIcon = status.icon
              return (
                <div
                  key={prescription.id}
                  className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900">{prescription.title}</h3>
                      {prescription.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{prescription.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          Dr. {prescription.doctor?.name || "Non assigné"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(
                            prescription.createdAt
                          )}
                        </span>
                        {prescription.scheduledDate && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <CalendarDays className="w-3 h-3" />
                            {new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(
                              prescription.scheduledDate
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400 truncate">
                      QR: {prescription.qrCodeId}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
