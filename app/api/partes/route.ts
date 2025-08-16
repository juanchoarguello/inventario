import { type NextRequest, NextResponse } from "next/server"
import { PartesRepository } from "@/lib/partes"
import { HistorialRepository } from "@/lib/historial"
import { withAuth } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import type { CreateParteData } from "@/lib/types"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const partes = await PartesRepository.findAll()
    return NextResponse.json(partes)
  } catch (error) {
    console.error("Error fetching partes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const parteData: CreateParteData = await request.json()

    // Validaciones básicas
    if (!parteData.nombre || !parteData.codigo || !parteData.categoria) {
      return NextResponse.json({ error: "Nombre, código y categoría son requeridos" }, { status: 400 })
    }

    // Verificar que el código no exista
    const existingParte = await PartesRepository.findByCodigo(parteData.codigo)
    if (existingParte) {
      return NextResponse.json({ error: "Ya existe una parte con este código" }, { status: 400 })
    }

    const nuevaParte = await PartesRepository.create(parteData, user.id)

    // Registrar en historial
    const { ip, userAgent } = extractRequestInfo(request)
    await HistorialRepository.registrarAccion(
      user.id,
      "CREAR_PARTE",
      "partes",
      nuevaParte.id.toString(),
      null,
      nuevaParte,
      ip,
      userAgent,
    )

    return NextResponse.json(nuevaParte, { status: 201 })
  } catch (error) {
    console.error("Error creating parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
