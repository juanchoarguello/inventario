import { type NextRequest, NextResponse } from "next/server"
import { PartesRepository } from "@/lib/partes"
import { HistorialRepository } from "@/lib/historial"
import { withAuthParams } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import { sql } from "@/lib/database"
import type { UpdateParteData } from "@/lib/index"

export const GET = withAuthParams(async (request: NextRequest, user, context) => {
  try {
    const params = await context.params
    const id = Number.parseInt(params.id as string)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de parte inválido" }, { status: 400 })
    }

    const parte = await PartesRepository.findById(id)

    if (!parte) {
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    return NextResponse.json(parte)
  } catch (error) {
    console.error("Error fetching parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const PUT = withAuthParams(async (request: NextRequest, user, context) => {
  try {
    const params = await context.params
    const id = Number.parseInt(params.id as string)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de parte inválido" }, { status: 400 })
    }

    // Obtener datos anteriores para el historial
    const parteAnterior = await PartesRepository.findById(id)
    if (!parteAnterior) {
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    const data = await request.json()

    // Actualizar parte básica
    const parteData: Partial<UpdateParteData> = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria,
      marca: data.marca,
      modelo_compatible: data.modelo_compatible,
      stock: data.stock,
      stock_minimo: data.stock_minimo,
      precio: data.precio || data.precio_venta,
      proveedor: data.proveedor,
      ubicacion: data.ubicacion,
    }

    const parteActualizada = await PartesRepository.update(id, parteData, user.id)

    if (!parteActualizada) {
      return NextResponse.json({ error: "Error al actualizar la parte" }, { status: 500 })
    }

    // Actualizar precios específicos de compra/venta si vienen
    if (data.precio_compra !== undefined || data.precio_venta !== undefined) {
      await sql`
        UPDATE partes 
        SET 
          precio_compra = COALESCE(${data.precio_compra || null}, precio_compra),
          precio_venta = COALESCE(${data.precio_venta || null}, precio_venta),
          precio = COALESCE(${data.precio_venta || data.precio || null}, precio),
          fecha_actualizacion = NOW(),
          usuario_actualizacion = ${user.id}
        WHERE id = ${id}
      `
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
        {
          ...parteActualizada,
          precio_compra: data.precio_compra,
          precio_venta: data.precio_venta,
          origen: data.origen || 'manual'
        },
        ip,
        userAgent,
      )
      console.log(`Historial registrado: ACTUALIZAR_PARTE para parte ${id}`)
    } catch (historialError) {
      console.error("Error registrando historial de actualización:", historialError)
      // No fallar la actualización por error de historial
    }

    // Obtener parte final con todos los campos actualizados
    const parteFinal = await PartesRepository.findById(id)

    return NextResponse.json(parteFinal || parteActualizada)
  } catch (error: any) {
    console.error("Error updating parte:", error)

    if (error.message?.includes("duplicate key") || error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "El código de la parte ya existe" }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al actualizar la parte: " + (error.message || "Error desconocido") }, 
      { status: 500 }
    )
  }
})

export const DELETE = withAuthParams(async (request: NextRequest, user, context) => {
  try {
    console.log("DELETE request recibido", { user: user.id })

    const params = await context.params
    const id = Number.parseInt(params.id as string)

    console.log(`Procesando eliminación de parte ID: ${id}`)

    if (isNaN(id)) {
      console.error(`ID de parte inválido: ${params.id}`)
      return NextResponse.json({ error: "ID de parte inválido" }, { status: 400 })
    }

    // Solo admin puede eliminar
    if (user.rol !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar partes" }, 
        { status: 403 }
      )
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
      success: true,
      message: "Parte eliminada exitosamente",
      parte: parteAEliminar.nombre,
    })
  } catch (error) {
    console.error("Error deleting parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})