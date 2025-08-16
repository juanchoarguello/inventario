import { type NextRequest, NextResponse } from "next/server"
import { JwtService } from "@/lib/jwt"
import type { AuthUser } from "@/lib/types"

// Tipo para el contexto de Next.js 15
type RouteContext = {
  params: Promise<Record<string, string | string[]>>
}

export function withAuth(
  handler: (request: NextRequest, user: AuthUser, context?: RouteContext) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: RouteContext) => {
    try {
      const token = request.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }

      const user = JwtService.verify(token)
      if (!user) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 })
      }

      return handler(request, user, context)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Error de autenticación" }, { status: 401 })
    }
  }
}

export function withAdminAuth(
  handler: (request: NextRequest, user: AuthUser, context?: RouteContext) => Promise<NextResponse>,
) {
  return withAuth(async (request: NextRequest, user: AuthUser, context?: RouteContext) => {
    if (user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado. Se requieren permisos de administrador" }, { status: 403 })
    }

    return handler(request, user, context)
  })
}
