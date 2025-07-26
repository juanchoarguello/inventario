import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { hashPassword, logAction } from "@/lib/auth"
import { validatePasswordResetToken, markPasswordResetTokenAsUsed } from "@/lib/tokens"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token y nueva contraseña son requeridos" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Validar token
    const tokenData = await validatePasswordResetToken(token)

    if (!tokenData) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Hashear nueva contraseña
    const passwordHash = await hashPassword(newPassword)

    // Actualizar contraseña
    await sql`
      UPDATE usuarios 
      SET password_hash = ${passwordHash}
      WHERE id = ${tokenData.user_id}
    `

    // Marcar token como usado
    await markPasswordResetTokenAsUsed(token)

    // Log de acción
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(
      tokenData.user_id,
      "PASSWORD_RESET",
      "usuarios",
      tokenData.user_id,
      null,
      { email: tokenData.email },
      ipAddress,
      userAgent,
    )

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error en reset password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
