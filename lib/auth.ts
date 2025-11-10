import { type NextRequest, NextResponse } from "next/server"
import { JwtService } from "@/lib/jwt"
import type { AuthUser } from "@/lib/types"

// Tipo para el contexto de Next.js 15
type RouteContext = {
  params: Promise<Record<string, string | string[]>>
}

// Función helper para verificar autenticación (usada en clientes/proveedores)
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const user = JwtService.verify(token)
    return user
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

// Middleware para rutas SIN parámetros dinámicos
export function withAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const token = request.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }

      const user = JwtService.verify(token)
      if (!user) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 })
      }

      return handler(request, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Error de autenticación" }, { status: 401 })
    }
  }
}

// Middleware para rutas CON parámetros dinámicos
export function withAuthParams(
  handler: (request: NextRequest, user: AuthUser, context: RouteContext) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: RouteContext) => {
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

// Middleware admin SIN parámetros
export function withAdminAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: AuthUser) => {
    if (user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado. Se requieren permisos de administrador" }, { status: 403 })
    }

    return handler(request, user)
  })
}

// Middleware admin CON parámetros
export function withAdminAuthParams(
  handler: (request: NextRequest, user: AuthUser, context: RouteContext) => Promise<NextResponse>,
) {
  return withAuthParams(async (request: NextRequest, user: AuthUser, context: RouteContext) => {
    if (user.rol !== "admin") {
      return NextResponse.json({ error: "Acceso denegado. Se requieren permisos de administrador" }, { status: 403 })
    }

    return handler(request, user, context)
  })
}