import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getUserFromToken, logAction } from "@/lib/auth"
import type { Parte } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { id } = await params
    const parteId = Number.parseInt(id)
    const parteData = await request.json()

    const partesAnteriores = await sql`
      SELECT * FROM partes WHERE id = ${parteId}
    `
    const parteAnterior = partesAnteriores[0] as Parte

    if (!parteAnterior) {
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    const codigo = parteData.codigo?.toString().trim() || parteAnterior.codigo
    const nombre = parteData.nombre?.toString().trim() || parteAnterior.nombre
    const categoria = parteData.categoria || parteAnterior.categoria
    const marca = parteData.marca?.toString().trim() || parteAnterior.marca
    const modelo_compatible = parteData.modelo_compatible || parteData.modelo || parteAnterior.modelo_compatible
    const ubicacion = parteData.ubicacion?.toString().trim() || parteAnterior.ubicacion
    const proveedor = parteData.proveedor?.toString().trim() || parteAnterior.proveedor
    const descripcion = parteData.descripcion?.toString().trim() || parteAnterior.descripcion

    let precio = Number(parteData.precio)
    let stock = Number(parteData.stock)
    let stock_minimo = Number(parteData.stock_minimo || parteData.stockMinimo)

    if (isNaN(precio)) precio = Number(parteAnterior.precio)
    if (isNaN(stock)) stock = Number(parteAnterior.stock)
    if (isNaN(stock_minimo)) stock_minimo = Number(parteAnterior.stock_minimo)

    const result = await sql`
      UPDATE partes SET
        codigo = ${codigo},
        nombre = ${nombre},
        categoria = ${categoria},
        marca = ${marca},
        modelo_compatible = ${modelo_compatible},
        precio = ${precio},
        stock = ${stock},
        stock_minimo = ${stock_minimo},
        ubicacion = ${ubicacion},
        proveedor = ${proveedor},
        descripcion = ${descripcion},
        fecha_actualizacion = CURRENT_TIMESTAMP,
        usuario_actualizacion = ${user.id}
      WHERE id = ${parteId}
      RETURNING *
    `

    const parteActualizada = result[0] as Parte

    const parteFormateada = {
      ...parteActualizada,
      precio: Number(parteActualizada.precio),
      stock: Number(parteActualizada.stock),
      stock_minimo: Number(parteActualizada.stock_minimo),
    }

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "UPDATE", "partes", parteId, parteAnterior, parteData, ipAddress, userAgent)

    return NextResponse.json(parteFormateada)
  } catch (error: any) {
    console.error("Error actualizando parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "No tienes permisos para eliminar partes" }, { status: 403 })
    }

    const { id } = await params
    const parteId = Number.parseInt(id)

    const partesAnteriores = await sql`
      SELECT * FROM partes WHERE id = ${parteId}
    `
    const parteAnterior = partesAnteriores[0] as Parte

    if (!parteAnterior) {
      return NextResponse.json({ error: "Parte no encontrada" }, { status: 404 })
    }

    await sql`DELETE FROM partes WHERE id = ${parteId}`

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "DELETE", "partes", parteId, parteAnterior, null, ipAddress, userAgent)

    return NextResponse.json({ message: "Parte eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando parte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
