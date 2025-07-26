import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getUserFromToken, logAction, hashPassword } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "No tienes permisos para modificar usuarios" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number.parseInt(id)
    const updateData = await request.json()

    const usuariosAnteriores = await sql`
      SELECT * FROM usuarios WHERE id = ${userId}
    `
    const usuarioAnterior = usuariosAnteriores[0]

    if (!usuarioAnterior) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (updateData.email && updateData.email !== usuarioAnterior.email) {
      const existingEmail = await sql`
        SELECT id FROM usuarios WHERE email = ${updateData.email} AND id != ${userId}
      `
      if (existingEmail.length > 0) {
        return NextResponse.json({ error: "Este email ya está en uso por otro usuario" }, { status: 409 })
      }
    }

    if (updateData.username && updateData.username !== usuarioAnterior.username) {
      const existingUsername = await sql`
        SELECT id FROM usuarios WHERE username = ${updateData.username} AND id != ${userId}
      `
      if (existingUsername.length > 0) {
        return NextResponse.json({ error: "Este nombre de usuario ya está en uso" }, { status: 409 })
      }
    }

    const updateFields = {
      username: updateData.username || usuarioAnterior.username,
      email: updateData.email || usuarioAnterior.email,
      nombre_completo: updateData.nombre_completo || usuarioAnterior.nombre_completo,
      rol: updateData.rol || usuarioAnterior.rol,
      activo: updateData.activo !== undefined ? updateData.activo : usuarioAnterior.activo,
    }

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
      }
      updateFields.password_hash = await hashPassword(updateData.password)
    }

    const result = await sql`
      UPDATE usuarios SET
        username = ${updateFields.username},
        email = ${updateFields.email},
        nombre_completo = ${updateFields.nombre_completo},
        rol = ${updateFields.rol},
        activo = ${updateFields.activo}
        ${updateFields.password_hash ? sql`, password_hash = ${updateFields.password_hash}` : sql``}
      WHERE id = ${userId}
      RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso
    `

    const usuarioActualizado = result[0]

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "UPDATE", "usuarios", userId, usuarioAnterior, updateData, ipAddress, userAgent)

    return NextResponse.json(usuarioActualizado)
  } catch (error: any) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "No tienes permisos para modificar usuarios" }, { status: 403 })
    }

    const { id } = await params
    const userId = Number.parseInt(id)
    const updateData = await request.json()

    const usuariosAnteriores = await sql`
      SELECT * FROM usuarios WHERE id = ${userId}
    `
    const usuarioAnterior = usuariosAnteriores[0]

    if (!usuarioAnterior) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const result = await sql`
      UPDATE usuarios SET
        activo = ${updateData.activo !== undefined ? updateData.activo : usuarioAnterior.activo}
      WHERE id = ${userId}
      RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso
    `

    const usuarioActualizado = result[0]

    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(user.id, "UPDATE", "usuarios", userId, usuarioAnterior, updateData, ipAddress, userAgent)

    return NextResponse.json(usuarioActualizado)
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
