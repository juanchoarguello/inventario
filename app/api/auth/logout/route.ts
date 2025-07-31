import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (token) {
      const user = await getUserFromToken(token)

      if (user) {
        // Registrar actividad de logout
        try {
          await sql`
            INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
            VALUES (${user.id}, 'LOGOUT', 'usuarios', ${user.id}, 'Usuario cerró sesión')
          `
        } catch (error) {
          console.error("Error logging logout activity:", error)
        }
      }
    }

    return createSuccessResponse({ message: "Logout exitoso" })
  } catch (error) {
    console.error("Logout error:", error)
    return createSuccessResponse({ message: "Logout completado" })
  }
}
