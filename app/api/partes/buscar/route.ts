import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { FacturasRepository } from "@/lib/facturas"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json([])
    }

    const partes = await FacturasRepository.buscarPartes(query)
    return NextResponse.json(partes)
  } catch (error) {
    console.error('Error en búsqueda de partes:', error)
    return NextResponse.json(
      { error: "Error al buscar partes" },
      { status: 500 }
    )
  }
}