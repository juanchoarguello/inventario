import { type NextRequest, NextResponse } from "next/server"
import { UsuariosRepository } from "@/lib/usuarios"
import { HistorialRepository } from "@/lib/historial"
import { PasswordService } from "@/lib/password"
import { withAdminAuth } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import type { CreateUserData } from "@/lib/index"

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const usuarios = await UsuariosRepository.findAll()
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error fetching usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const userData: CreateUserData = await request.json()

    // Validaciones
    if (!userData.nombre || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    // Validar contraseña
    const passwordValidation = PasswordService.validate(userData.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors.join(", ") }, { status: 400 })
    }

    // Verificar que el email no exista
    const existingUser = await UsuariosRepository.findByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 400 })
    }

    // Hashear contraseña
    const hashedPassword = await PasswordService.hash(userData.password)

    const nuevoUsuario = await UsuariosRepository.create({
      ...userData,
      password: hashedPassword,
    })

    // Registrar en historial (sin incluir la contraseña)
    const { ip, userAgent } = extractRequestInfo(request)
    const usuarioParaHistorial = { ...nuevoUsuario }
    delete usuarioParaHistorial.password

    await HistorialRepository.registrarAccion(
      user.id,
      "CREAR_USUARIO",
      "usuarios",
      nuevoUsuario.id.toString(),
      null,
      usuarioParaHistorial,
      ip,
      userAgent,
    )

    return NextResponse.json(nuevoUsuario, { status: 201 })
  } catch (error) {
    console.error("Error creating usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
