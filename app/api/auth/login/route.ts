import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyPassword, createSession, logAction } from "@/lib/auth"
import type { Usuario } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    const users = await sql`
      SELECT * FROM usuarios 
      WHERE username = ${username} AND activo = true
    `

    const user = users[0] as Usuario

    if (!user) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const token = await createSession(user.id, ipAddress, userAgent)

    await sql`
      UPDATE usuarios 
      SET ultimo_acceso = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `

    await logAction(user.id, "LOGIN", "usuarios", user.id, null, { username: user.username }, ipAddress, userAgent)

    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Inicio de sesión exitoso",
    })
  } catch (error: any) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
