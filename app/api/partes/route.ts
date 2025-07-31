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

    const parts = await sql`
      SELECT * FROM partes 
      ORDER BY fecha_creacion DESC
    `

    return createSuccessResponse(parts)
  } catch (error) {
    console.error("Error fetching parts:", error)
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

    // Validaciones
    if (!numero_parte || !nombre || !categoria) {
      return createErrorResponse("Campos requeridos: numero_parte, nombre, categoria", 400)
    }

    // Verificar si el número de parte ya existe
    const existingPart = await sql`
      SELECT id FROM partes WHERE numero_parte = ${numero_parte}
    `

    if (existingPart.length > 0) {
      return createErrorResponse("El número de parte ya existe", 400)
    }

    const newPart = await sql`
      INSERT INTO partes (
        numero_parte, nombre, descripcion, categoria, ubicacion,
        cantidad_stock, stock_minimo, precio_unitario, proveedor
      )
      VALUES (
        ${numero_parte}, ${nombre}, ${descripcion || ""}, ${categoria}, ${ubicacion || ""},
        ${cantidad_stock || 0}, ${stock_minimo || 0}, ${precio_unitario || 0}, ${proveedor || ""}
      )
      RETURNING *
    `

    // Registrar actividad
    try {
      await sql`
        INSERT INTO historial_acciones (usuario_id, accion, tabla_afectada, registro_id, detalles)
        VALUES (${user.id}, 'CREATE', 'partes', ${newPart[0].id}, ${"Parte creada: " + nombre})
      `
    } catch (error) {
      console.error("Error logging activity:", error)
    }

    return createSuccessResponse(newPart[0], 201)
  } catch (error) {
    console.error("Error creating part:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
