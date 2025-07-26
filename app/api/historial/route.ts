import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (user.rol === "empleado") {
      return NextResponse.json({ error: "No tienes permisos para ver el historial" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const historial = await sql`
      SELECT h.*, u.nombre_completo, u.username
      FROM historial_acciones h
      JOIN usuarios u ON h.usuario_id = u.id
      ORDER BY h.fecha_accion DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json(historial)
  } catch (error) {
    console.error("Error obteniendo historial:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
