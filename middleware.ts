import { auth } from "./auth"

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = ["/login", "/register", "/api/auth"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path)) || nextUrl.pathname === "/"
  
  // 1. Rediriger vers Dashboard si l'utilisateur est déjà connecté et tente d'atteindre /login
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
      return Response.redirect(new URL("/dashboard", nextUrl))
  }

  // 2. Rediriger vers /login si on accède à un chemin protégé en étant déconnecté
  if (!isLoggedIn && !isPublicPath) {
      // Optionnel: On peut stocker l'URL en callback (callbackUrl) pour y revenir après login
      return Response.redirect(new URL("/login", nextUrl))
  }

  // 3. Gestion granulaire du rôle Doctor (Optionnel pour ce MVP, protège un sous-path)
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard/doctor")) {
      const userRole = req.auth?.user?.role
      if (userRole !== "DOCTOR") {
          return Response.redirect(new URL("/dashboard", nextUrl)) // Redirige au dashboard Patient
      }
  }

  return // Laissez Next.js gérer la requête validée
})

// Options de configuration du matcher pour Next.js (ne pas exécuter middleware pour fichiers statiques, images...)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
