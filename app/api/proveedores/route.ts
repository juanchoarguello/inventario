import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { ProveedoresRepository } from "@/lib/facturas"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    let proveedores
    if (query) {
      proveedores = await ProveedoresRepository.search(query)
    } else {
      proveedores = await ProveedoresRepository.findAll()
    }

    return NextResponse.json(proveedores)
  } catch (error) {
    console.error('Error obteniendo proveedores:', error)
    return NextResponse.json(
      { error: "Error al obtener proveedores" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Generar código automático si no viene
    if (!data.codigo) {
      const proveedores = await ProveedoresRepository.findAll()
      data.codigo = `PROV-${String(proveedores.length + 1).padStart(3, '0')}`
    }

    const proveedor = await ProveedoresRepository.create(data, user.id)
    return NextResponse.json(proveedor, { status: 201 })
  } catch (error: any) {
    console.error('Error creando proveedor:', error)
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: "El código del proveedor ya existe" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    )
  }
}