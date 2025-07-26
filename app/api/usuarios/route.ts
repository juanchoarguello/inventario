import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getUserFromToken, hashPassword, logAction } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (user.rol !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para ver usuarios" }, { status: 403 })
    }

    const usuarios = await sql`
      SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso
      FROM usuarios
      ORDER BY fecha_creacion DESC
    `

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

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

    if (user.rol !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para crear usuarios" }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, password, nombre_completo, rol = "empleado" } = body

    if (!username || !email || !password || !nombre_completo) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const existingUsers = await sql`
      SELECT id, username, email FROM usuarios 
      WHERE username = ${username} OR email = ${email}
    `

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      const field = existingUser.username === username ? "usuario" : "email"
      return NextResponse.json({ error: `Ya existe un ${field} con este valor` }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, created_by)
      VALUES (${username}, ${email}, ${passwordHash}, ${nombre_completo}, ${rol}, ${user.id})
      RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion
    `

    const newUser = result[0]

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(
      user.id,
      "CREATE",
      "usuarios",
      newUser.id,
      null,
      { username, email, rol, nombre_completo },
      ipAddress,
      userAgent,
    )

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: newUser,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creando usuario:", error)

    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un usuario con estos datos" }, { status: 409 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
