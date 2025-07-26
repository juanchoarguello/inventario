import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken, logAction, invalidateSession } from "@/lib/auth"

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

    await invalidateSession(token)

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "LOGOUT", "usuarios", user.id, null, { username: user.username }, ipAddress, userAgent)

    return NextResponse.json({ message: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
