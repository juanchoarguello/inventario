import { type NextRequest, NextResponse } from "next/server"
import { HistorialRepository } from "@/lib/historial"
import { withAdminAuth } from "@/lib/auth"

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const tabla = searchParams.get("tabla")
    const usuarioId = searchParams.get("usuario_id")

    let historial

    if (tabla) {
      historial = await HistorialRepository.findByTabla(tabla, limit)
    } else if (usuarioId) {
      historial = await HistorialRepository.findByUsuario(Number.parseInt(usuarioId), limit)
    } else {
      historial = await HistorialRepository.findAll(limit)
    }

    return NextResponse.json(historial)
  } catch (error) {
    console.error("Error fetching historial:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
