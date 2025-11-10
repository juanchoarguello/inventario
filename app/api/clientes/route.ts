import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { ClientesRepository } from "@/lib/facturas"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    let clientes
    if (query) {
      clientes = await ClientesRepository.search(query)
    } else {
      clientes = await ClientesRepository.findAll()
    }

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
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
      const clientes = await ClientesRepository.findAll()
      data.codigo = `CLI-${String(clientes.length + 1).padStart(3, '0')}`
    }

    const cliente = await ClientesRepository.create(data, user.id)
    return NextResponse.json(cliente, { status: 201 })
  } catch (error: any) {
    console.error('Error creando cliente:', error)
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: "El código del cliente ya existe" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}