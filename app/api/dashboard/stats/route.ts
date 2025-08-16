import { NextResponse } from "next/server"
import { PartesRepository } from "@/lib/partes"
import { UsuariosRepository } from "@/lib/usuarios"
import { withAuth } from "@/lib/auth"
import type { DashboardStats } from "@/lib/types"

export const GET = withAuth(async (request, user) => {
  try {
    const [totalPartes, stockBajo, totalUsuarios, valorInventario] = await Promise.all([
      PartesRepository.count(),
      PartesRepository.findStockBajo().then((partes) => partes.length),
      user.rol === "admin" ? UsuariosRepository.count() : Promise.resolve(0),
      PartesRepository.getTotalValue(),
    ])

    const stats: DashboardStats = {
      totalPartes,
      stockBajo,
      totalUsuarios,
      valorInventario,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
