import { type NextRequest, NextResponse } from "next/server"
import { PartesRepository } from "@/lib/partes"
import { HistorialRepository } from "@/lib/historial"
import { withAuth } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import type { UpdateParteData } from "@/lib/types"

export const PUT = withAuth(async (request: NextRequest, user, context) => {
  try {
    const params = context?.params ? await context.params : {}
    const id = Number.parseInt(params.id as string)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de parte inválido" }, { status: 400 })
    }

    // Obtener datos anteriores para el historial
    const parteAnterior = await PartesRepository.findById(id)
    if (!parteAnterior) {
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    const parteData: Partial<UpdateParteData> = await request.json()
    const parteActualizada = await PartesRepository.update(id, parteData, user.id)

    if (!parteActualizada) {
      return NextResponse.json({ error: "Error al actualizar la parte" }, { status: 500 })
    }

    // Registrar en historial
    try {
      const { ip, userAgent } = extractRequestInfo(request)
      await HistorialRepository.registrarAccion(
        user.id,
        "ACTUALIZAR_PARTE",
        "partes",
        id.toString(),
        parteAnterior,
        parteActualizada,
        ip,
        userAgent,
      )
      console.log(`Historial registrado: ACTUALIZAR_PARTE para parte ${id}`)
    } catch (historialError) {
      console.error("Error registrando historial de actualización:", historialError)
    }

    return NextResponse.json(parteActualizada)
  } catch (error) {
    console.error("Error updating parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, user, context) => {
  try {
    console.log("DELETE request recibido", { context, user: user.id })

    const params = context?.params ? await context.params : {}
    const id = Number.parseInt(params.id as string)

    console.log(`Procesando eliminación de parte ID: ${id}`)

    if (isNaN(id)) {
      console.error(`ID de parte inválido: ${params.id}`)
      return NextResponse.json({ error: "ID de parte inválido" }, { status: 400 })
    }

    // Obtener datos antes de eliminar para el historial
    console.log(`Buscando parte con ID ${id} antes de eliminar...`)
    const parteAEliminar = await PartesRepository.findById(id)

    if (!parteAEliminar) {
      console.error(`Parte con ID ${id} no encontrada`)
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    console.log(`Parte encontrada:`, parteAEliminar.nombre)

    // Eliminar la parte
    console.log(`Eliminando parte con ID ${id}...`)
    const deleted = await PartesRepository.delete(id)

    if (!deleted) {
      console.error(`Error al eliminar parte con ID ${id}`)
      return NextResponse.json({ error: "Error al eliminar la parte" }, { status: 500 })
    }

    console.log(`Parte eliminada exitosamente: ${parteAEliminar.nombre}`)

    // Registrar en historial
    try {
      const { ip, userAgent } = extractRequestInfo(request)
      console.log(`Registrando en historial: ELIMINAR_PARTE para ${id}`)

      await HistorialRepository.registrarAccion(
        user.id,
        "ELIMINAR_PARTE",
        "partes",
        id.toString(),
        parteAEliminar,
        null,
        ip,
        userAgent,
      )

      console.log(`Historial registrado exitosamente para eliminación de parte ${id}`)
    } catch (historialError) {
      console.error("Error registrando historial de eliminación:", historialError)
      // No fallar la eliminación por error de historial
    }

    return NextResponse.json({
      message: "Parte eliminada exitosamente",
      parte: parteAEliminar.nombre,
    })
  } catch (error) {
    console.error("Error deleting parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
