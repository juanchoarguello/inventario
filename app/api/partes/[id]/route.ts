import type { NextRequest } from "next/server"
import { getUserFromToken } from "@/lib/auth"
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

    const partId = Number.parseInt(params.id)
    if (isNaN(partId)) {
      return createErrorResponse("ID de parte inválido", 400)
    }

    const partData = await request.json()
    const {
      numero_parte,
      nombre,
      descripcion,
      categoria,
      ubicacion,
      cantidad_stock,
      stock_minimo,
      precio_unitario,
      proveedor,
    } = partData

    // Verificar que la parte existe
    const existingPart = await sql`
      SELECT * FROM partes WHERE id = ${partId}
    `

    if (existingPart.length === 0) {
      return createErrorResponse("Parte no encontrada", 404)
    }

    // Verificar si el número de parte ya existe en otra parte
    const duplicatePart = await sql`
      SELECT id FROM partes WHERE numero_parte = ${numero_parte} AND id != ${partId}
    `

    if (duplicatePart.length > 0) {
      return createErrorResponse("El número de parte ya existe", 400)
    }

    const updatedPart = await sql`
      UPDATE partes SET
        numero_parte = ${numero_parte},
        nombre = ${nombre},
        descripcion = ${descripcion || ""},
        categoria = ${categoria},
        ubicacion = ${ubicacion || ""},
        cantidad_stock = ${cantidad_stock || 0},
        stock_minimo = ${stock_minimo || 0},
        precio_unitario = ${precio_unitario || 0},
        proveedor = ${proveedor || ""},
        fecha_actualizacion = NOW()
      WHERE id = ${partId}
      RETURNING *
    `

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'UPDATE', 'partes', ${partId}, ${"Parte actualizada: " + nombre})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse(updatedPart[0])
  } catch (error) {
    console.error("Error updating part:", error)
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

    // Solo admin y supervisor pueden eliminar
    if (user.rol === "empleado") {
      return createErrorResponse("No tienes permisos para eliminar partes", 403)
    }

    const partId = Number.parseInt(params.id)
    if (isNaN(partId)) {
      return createErrorResponse("ID de parte inválido", 400)
    }

    // Verificar que la parte existe
    const existingPart = await sql`
      SELECT nombre FROM partes WHERE id = ${partId}
    `

    if (existingPart.length === 0) {
      return createErrorResponse("Parte no encontrada", 404)
    }

    await sql`DELETE FROM partes WHERE id = ${partId}`

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_actividades (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'DELETE', 'partes', ${partId}, ${"Parte eliminada: " + existingPart[0].nombre})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse({ message: "Parte eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting part:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
