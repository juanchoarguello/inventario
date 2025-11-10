import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { FacturasRepository } from "@/lib/facturas"
import { registrarAccion } from "@/lib/historial"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filters = {
      tipo: searchParams.get('tipo') as 'COMPRA' | 'VENTA' | undefined,
      estado: searchParams.get('estado') || undefined,
      desde: searchParams.get('desde') || undefined,
      hasta: searchParams.get('hasta') || undefined,
    }

    const facturas = await FacturasRepository.findAll(filters)
    return NextResponse.json(facturas)
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    return NextResponse.json(
      { error: "Error al obtener facturas" },
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

    if (!data.tipo || !['COMPRA', 'VENTA'].includes(data.tipo)) {
      return NextResponse.json(
        { error: "Tipo de factura inválido" },
        { status: 400 }
      )
    }

    if (data.tipo === 'VENTA' && !data.cliente_id) {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente para ventas" },
        { status: 400 }
      )
    }

    if (data.tipo === 'COMPRA' && !data.proveedor_id) {
      return NextResponse.json(
        { error: "Debe seleccionar un proveedor para compras" },
        { status: 400 }
      )
    }

    if (!data.detalles || data.detalles.length === 0) {
      return NextResponse.json(
        { error: "La factura debe tener al menos un item" },
        { status: 400 }
      )
    }

    const factura = await FacturasRepository.create(data, user.id)

    await registrarAccion({
      usuario_id: user.id,
      accion: `Creó factura ${data.tipo}`,
      tabla_afectada: 'facturas',
      registro_id: factura.id.toString(),
      datos_nuevos: {
        numero_factura: factura.numero_factura,
        total: factura.total,
        items: data.detalles.length
      }
    })

    return NextResponse.json(factura, { status: 201 })
  } catch (error: any) {
    console.error('Error creando factura:', error)
    
    if (error.message?.includes('stock insuficiente') || error.message?.includes('Stock insuficiente')) {
      return NextResponse.json(
        { error: "Stock insuficiente para completar la venta" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Error al crear factura" },
      { status: 500 }
    )
  }
}