import { type NextRequest, NextResponse } from "next/server"
import { UsuariosRepository } from "@/lib/usuarios"
import { PasswordService } from "@/lib/password"
import { JwtService } from "@/lib/jwt"
import type { LoginCredentials } from "@/lib/index"

/**
 * Endpoint de autenticación de usuarios
 * Implementa el principio de responsabilidad única y manejo seguro de errores
 */
export async function POST(request: NextRequest) {
  try {
    // Validación de entrada
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: "Datos de entrada inválidos" }, { status: 400 })
    }

    const { email, password }: LoginCredentials = body

    // Validación de campos requeridos
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const usuario = await UsuariosRepository.findByEmail(email.toLowerCase().trim())

    // Verificar credenciales (mensaje genérico por seguridad)
    if (!usuario || !usuario.password) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return NextResponse.json({ error: "Cuenta desactivada" }, { status: 401 })
    }

    // Verificar contraseña usando bcrypt
    const isValidPassword = await PasswordService.verify(password, usuario.password)

    if (!isValidPassword) {
      // Log del intento fallido (sin exponer información sensible)
      console.warn(`Failed login attempt for email: ${email}`)

      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Actualizar último acceso
    await UsuariosRepository.updateLastAccess(usuario.id)

    // Crear objeto de usuario autenticado (sin contraseña)
    const authUser = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    }

    // Generar token JWT
    const token = JwtService.sign(authUser)

    // Crear respuesta exitosa
    const response = NextResponse.json({
      user: authUser,
      token: token, // Incluir token en la respuesta para el frontend
      message: "Autenticación exitosa",
    })

    // Configurar cookie segura
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    })

    return response
  } catch (error) {
    // Log del error sin exponer detalles al cliente
    console.error("Login error:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
