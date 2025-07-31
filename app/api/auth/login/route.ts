import type { NextRequest } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"
import { sql } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return createErrorResponse("Usuario y contraseña son requeridos", 400)
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return createErrorResponse("Credenciales inválidas", 401)
    }

    const token = generateToken(user)

    // Registrar actividad de login
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'LOGIN', 'usuarios', ${user.id}, 'Usuario inició sesión')
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse({
      user,
      token,
      message: "Login exitoso",
    })
  } catch (error) {
    console.error("Login error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
