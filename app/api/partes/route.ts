import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getUserFromToken, logAction } from "@/lib/auth"
import type { Parte } from "@/lib/database"

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

    const partes = await sql`
      SELECT p.*, u1.nombre_completo as usuario_creacion_nombre, u2.nombre_completo as usuario_actualizacion_nombre
      FROM partes p
      LEFT JOIN usuarios u1 ON p.usuario_creacion = u1.id
      LEFT JOIN usuarios u2 ON p.usuario_actualizacion = u2.id
      ORDER BY p.fecha_actualizacion DESC
    `

    const partesFormateadas = partes.map((parte) => ({
      ...parte,
      precio: Number(parte.precio),
      stock: Number(parte.stock),
      stock_minimo: Number(parte.stock_minimo),
    }))

    return NextResponse.json(partesFormateadas)
  } catch (error) {
    console.error("Error obteniendo partes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const parteData = await request.json()

    const cleanedData = {
      codigo: parteData.codigo?.trim(),
      nombre: parteData.nombre?.trim(),
      categoria: parteData.categoria,
      marca: parteData.marca?.trim(),
      modelo_compatible: parteData.modelo || parteData.modelo_compatible || null,
      precio: Number(parteData.precio) || 0,
      stock: Number(parteData.stock) || 0,
      stock_minimo: Number(parteData.stockMinimo) || Number(parteData.stock_minimo) || 0,
      ubicacion: parteData.ubicacion?.trim() || null,
      proveedor: parteData.proveedor?.trim() || null,
      descripcion: parteData.descripcion?.trim() || null,
    }

    if (!cleanedData.codigo || !cleanedData.nombre || !cleanedData.categoria || !cleanedData.marca) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (cleanedData.precio < 0 || cleanedData.stock < 0 || cleanedData.stock_minimo < 0) {
      return NextResponse.json({ error: "Los valores numéricos no pueden ser negativos" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO partes (
        codigo, nombre, categoria, marca, modelo_compatible, precio, 
        stock, stock_minimo, ubicacion, proveedor, descripcion, usuario_creacion
      ) VALUES (
        ${cleanedData.codigo}, ${cleanedData.nombre}, ${cleanedData.categoria}, 
        ${cleanedData.marca}, ${cleanedData.modelo_compatible}, ${cleanedData.precio},
        ${cleanedData.stock}, ${cleanedData.stock_minimo}, ${cleanedData.ubicacion},
        ${cleanedData.proveedor}, ${cleanedData.descripcion}, ${user.id}
      ) RETURNING *
    `

    const nuevaParte = result[0] as Parte

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "CREATE", "partes", nuevaParte.id, null, parteData, ipAddress, userAgent)

    return NextResponse.json(nuevaParte, { status: 201 })
  } catch (error: any) {
    console.error("Error creando parte:", error)

    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe una parte con este código" }, { status: 409 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
