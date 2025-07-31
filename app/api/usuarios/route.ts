import type { NextRequest } from "next/server"
import { getUserFromToken, hashPassword } from "@/lib/auth"
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

    // Solo admin puede ver usuarios
    if (user.rol !== "admin") {
      return createErrorResponse("No tienes permisos para ver usuarios", 403)
    }

    const users = await sql`
      SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion
      FROM usuarios 
      ORDER BY fecha_creacion DESC
    `

    return createSuccessResponse(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

export async function POST(request: NextRequest) {
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

    // Solo admin puede crear usuarios
    if (user.rol !== "admin") {
      return createErrorResponse("No tienes permisos para crear usuarios", 403)
    }

    const userData = await request.json()
    const { username, email, nombre_completo, rol, password } = userData

    // Validaciones
    if (!username || !email || !nombre_completo || !rol || !password) {
      return createErrorResponse("Todos los campos son requeridos", 400)
    }

    if (!["admin", "supervisor", "empleado"].includes(rol)) {
      return createErrorResponse("Rol inválido", 400)
    }

    // Verificar si el usuario ya existe
    const existingUser = await sql`
      SELECT id FROM usuarios WHERE username = ${username} OR email = ${email}
    `

    if (existingUser.length > 0) {
      return createErrorResponse("El usuario o email ya existe", 400)
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await sql`
      INSERT INTO usuarios (username, email, nombre_completo, rol, password_hash, activo)
      VALUES (${username}, ${email}, ${nombre_completo}, ${rol}, ${hashedPassword}, true)
      RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion
    `

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'CREATE', 'usuarios', ${newUser[0].id}, ${"Usuario creado: " + username})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse(newUser[0], 201)
  } catch (error) {
    console.error("Error creating user:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
