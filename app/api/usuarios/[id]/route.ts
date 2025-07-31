import type { NextRequest } from "next/server"
import { getUserFromToken, hashPassword } from "@/lib/auth"
import { sql } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Solo admin puede editar usuarios
    if (user.rol !== "admin") {
      return createErrorResponse("No tienes permisos para editar usuarios", 403)
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createErrorResponse("ID de usuario inválido", 400)
    }

    const userData = await request.json()
    const { username, email, nombre_completo, rol, password, activo } = userData

    // Verificar que el usuario existe
    const existingUser = await sql`
      SELECT * FROM usuarios WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return createErrorResponse("Usuario no encontrado", 404)
    }

    // Verificar si el username o email ya existe en otro usuario
    const duplicateUser = await sql`
      SELECT id FROM usuarios 
      WHERE (username = ${username} OR email = ${email}) AND id != ${userId}
    `

    if (duplicateUser.length > 0) {
      return createErrorResponse("El usuario o email ya existe", 400)
    }

    let updateQuery = `
      UPDATE usuarios SET
        username = $1,
        email = $2,
        nombre_completo = $3,
        rol = $4,
        activo = $5
    `
    const queryParams = [username, email, nombre_completo, rol, activo !== false]

    // Si se proporciona nueva contraseña, incluirla en la actualización
    if (password && password.trim() !== "") {
      const hashedPassword = await hashPassword(password)
      updateQuery += `, password_hash = $6`
      queryParams.push(hashedPassword)
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion`
    queryParams.push(userId)

    const updatedUser = await sql.query(updateQuery, queryParams)

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'UPDATE', 'usuarios', ${userId}, ${"Usuario actualizado: " + username})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse(updatedUser.rows[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Solo admin puede eliminar usuarios
    if (user.rol !== "admin") {
      return createErrorResponse("No tienes permisos para eliminar usuarios", 403)
    }

    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return createErrorResponse("ID de usuario inválido", 400)
    }

    // No permitir que el admin se elimine a sí mismo
    if (userId === user.id) {
      return createErrorResponse("No puedes eliminarte a ti mismo", 400)
    }

    // Verificar que el usuario existe
    const existingUser = await sql`
      SELECT username FROM usuarios WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return createErrorResponse("Usuario no encontrado", 404)
    }

    // En lugar de eliminar, desactivar el usuario
    await sql`
      UPDATE usuarios SET activo = false WHERE id = ${userId}
    `

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'DELETE', 'usuarios', ${userId}, ${"Usuario desactivado: " + existingUser[0].username})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse({ message: "Usuario desactivado exitosamente" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
