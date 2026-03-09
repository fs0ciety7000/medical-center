import { auth } from "@/auth"

const publicPaths = ["/login", "/register", "/api/auth"]

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path)) || nextUrl.pathname === "/"
  
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
      return Response.redirect(new URL("/dashboard", nextUrl))
  }

  if (!isLoggedIn && !isPublicPath) {
      return Response.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard/doctor")) {
      const userRole = req.auth?.user?.role
      if (userRole !== "DOCTOR") {
          return Response.redirect(new URL("/dashboard", nextUrl))
      }
  }

  return
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
