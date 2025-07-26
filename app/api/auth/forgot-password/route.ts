import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { createPasswordResetToken } from "@/lib/tokens"
import { sendEmail, generatePasswordResetEmail } from "@/lib/email"
import { logAction } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Buscar usuario por email
    const users = await sql`
      SELECT id, email, nombre_completo, activo 
      FROM usuarios 
      WHERE email = ${email}
    `

    const user = users[0]

    // Siempre devolver éxito por seguridad (no revelar si el email existe)
    if (!user || !user.activo) {
      return NextResponse.json({
        message: "Si el email existe en nuestro sistema, recibirás un enlace de recuperación",
      })
    }

    // Crear token de recuperación
    const resetToken = await createPasswordResetToken(user.id)
    const resetLink = `${request.nextUrl.origin}/reset-password?token=${resetToken}`

    // Enviar email
    await sendEmail(
      user.email,
      "Recuperar Contraseña - AutoParts Pro",
      generatePasswordResetEmail(user.nombre_completo, resetLink),
    )

    // Log de acción
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "PASSWORD_RESET_REQUEST", "usuarios", user.id, null, { email }, ipAddress, userAgent)

    return NextResponse.json({
      message: "Si el email existe en nuestro sistema, recibirás un enlace de recuperación",
    })
  } catch (error) {
    console.error("Error en forgot password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
