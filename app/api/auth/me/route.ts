import { type NextRequest, NextResponse } from "next/server"
import { JwtService } from "@/lib/jwt"
import { UsuariosRepository } from "@/lib/usuarios"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = JwtService.verify(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const usuario = await UsuariosRepository.findById(decoded.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
