import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return createErrorResponse("Token de autorización requerido", 401)
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return createErrorResponse("Token inválido", 401)
    }

    // Solo admin y supervisor pueden ver el historial
    if (user.rol === "empleado") {
      return createErrorResponse("No tienes permisos para ver el historial", 403)
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const activities = await sql`
      SELECT 
        h.*,
        u.nombre_completo as usuario_nombre
      FROM historial_acciones h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      ORDER BY h.fecha_accion DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return createSuccessResponse(activities)
  } catch (error) {
    console.error("Error fetching activity history:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
