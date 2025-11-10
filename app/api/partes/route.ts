import { type NextRequest, NextResponse } from "next/server"
import { PartesRepository } from "@/lib/partes"
import { HistorialRepository } from "@/lib/historial"
import { withAuth } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import { sql } from "@/lib/database"
import type { CreateParteData } from "@/lib/index"

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
    const data = await request.json()

    // Validaciones básicas
    if (!data.nombre || !data.codigo || !data.categoria) {
      return NextResponse.json({ error: "Nombre, código y categoría son requeridos" }, { status: 400 })
    }

    // Verificar si el código ya existe
    const existingParte = await PartesRepository.findByCodigo(data.codigo)
    if (existingParte) {
      // Si existe, devolver la parte existente en lugar de error
      // Esto permite que el sistema la use en la facturación
      return NextResponse.json(existingParte, { status: 200 })
    }

    // Preparar datos para crear la parte
    const parteData: CreateParteData = {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      codigo: data.codigo,
      categoria: data.categoria,
      marca: data.marca || null,
      modelo_compatible: data.modelo_compatible || null,
      stock: data.stock || 0,
      stock_minimo: data.stock_minimo || 0,
      precio: data.precio || data.precio_venta || 0,
      proveedor: data.proveedor || null,
      ubicacion: data.ubicacion || null,
    }

    // Crear la parte
    const nuevaParte = await PartesRepository.create(parteData, user.id)

    // Si vienen precios específicos de compra/venta, actualizarlos
    if (data.precio_compra !== undefined || data.precio_venta !== undefined) {
      await sql`
        UPDATE partes 
        SET 
          precio_compra = COALESCE(${data.precio_compra || null}, precio_compra),
          precio_venta = COALESCE(${data.precio_venta || null}, precio_venta),
          precio = COALESCE(${data.precio_venta || data.precio || null}, precio)
        WHERE id = ${nuevaParte.id}
      `
    }

    // Registrar en historial
    const { ip, userAgent } = extractRequestInfo(request)
    await HistorialRepository.registrarAccion(
      user.id,
      "CREAR_PARTE",
      "partes",
      nuevaParte.id.toString(),
      null,
      {
        ...nuevaParte,
        precio_compra: data.precio_compra,
        precio_venta: data.precio_venta,
        origen: data.origen || 'manual' // Para identificar si viene de facturación
      },
      ip,
      userAgent,
    )

    // Obtener la parte actualizada con todos los campos
    const parteActualizada = await PartesRepository.findById(nuevaParte.id)

    return NextResponse.json(parteActualizada || nuevaParte, { status: 201 })
  } catch (error: any) {
    console.error("Error creating parte:", error)

    // Manejo de errores específicos
    if (error.message?.includes("duplicate key") || error.message?.includes("unique")) {
      return NextResponse.json(
        { error: "El código de la parte ya existe" }, 
        { status: 400 }
      )
    }

    if (error.message?.includes("violates foreign key constraint")) {
      return NextResponse.json(
        { error: "Usuario no válido" }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear la parte: " + (error.message || "Error desconocido") }, 
      { status: 500 }
    )
  }
})