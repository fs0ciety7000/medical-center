/**
 * Page racine — Redirige vers /login
 * Le middleware intercepte ensuite et redirige vers /dashboard si connecté
 */
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/login")
}
