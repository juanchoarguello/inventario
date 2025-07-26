import { type NextRequest, NextResponse } from "next/server"
import { validateEmailVerificationToken, markEmailAsVerified } from "@/lib/tokens"
import { logAction } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token es requerido" }, { status: 400 })
    }

    // Validar token
    const tokenData = await validateEmailVerificationToken(token)

    if (!tokenData) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Marcar email como verificado
    await markEmailAsVerified(tokenData.user_id, token)

    // Log de acción
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(
      tokenData.user_id,
      "EMAIL_VERIFIED",
      "usuarios",
      tokenData.user_id,
      null,
      { email: tokenData.email },
      ipAddress,
      userAgent,
    )

    return NextResponse.json({
      message: "Email verificado exitosamente",
    })
  } catch (error) {
    console.error("Error en verify email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
