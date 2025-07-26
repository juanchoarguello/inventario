import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { hashPassword, logAction } from "@/lib/auth"
import { createEmailVerificationToken } from "@/lib/tokens"
import { sendEmail, generateWelcomeEmail } from "@/lib/email"
import {
  handleDatabaseError,
  validateRequired,
  validateEmail,
  validatePassword,
  ErrorMessages,
} from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, nombre_completo, rol = "empleado" } = body

    // Validar campos requeridos
    const validationErrors = validateRequired(body, ["username", "email", "password", "nombre_completo"])
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: validationErrors[0].userMessage,
          type: validationErrors[0].type,
          field: validationErrors[0].field,
        },
        { status: 400 },
      )
    }

    // Validar email
    const emailError = validateEmail(email)
    if (emailError) {
      return NextResponse.json(
        {
          error: emailError.userMessage,
          type: emailError.type,
          field: emailError.field,
        },
        { status: 400 },
      )
    }

    // Validar contraseña
    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json(
        {
          error: passwordError.userMessage,
          type: passwordError.type,
          field: passwordError.field,
        },
        { status: 400 },
      )
    }

    // Verificar si el usuario ya existe
    const existingUsers = await sql`
      SELECT id, username, email FROM usuarios 
      WHERE username = ${username} OR email = ${email}
    `

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      const field = existingUser.username === username ? "usuario" : "email"
      const error = ErrorMessages.DUPLICATE_ENTRY(field)
      return NextResponse.json(
        {
          error: error.userMessage,
          type: error.type,
          field: error.field,
        },
        { status: 409 },
      )
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password)

    // Crear usuario
    const result = await sql`
      INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, email_verified)
      VALUES (${username}, ${email}, ${passwordHash}, ${nombre_completo}, ${rol}, false)
      RETURNING id, username, email, nombre_completo, rol, activo, fecha_creacion
    `

    const newUser = result[0]

    // Crear token de verificación de email
    const verificationToken = await createEmailVerificationToken(newUser.id)
    const verificationLink = `${request.nextUrl.origin}/verify-email?token=${verificationToken}`

    // Enviar email de bienvenida
    await sendEmail(
      email,
      "¡Bienvenido a AutoParts Pro!",
      generateWelcomeEmail(nombre_completo, username, verificationLink),
    )

    // Log de acción
    const ipAddress = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await logAction(
      newUser.id,
      "REGISTER",
      "usuarios",
      newUser.id,
      null,
      { username, email, rol },
      ipAddress,
      userAgent,
    )

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: newUser,
        emailSent: true,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error en registro:", error)

    // Manejar errores de base de datos
    if (error.code) {
      const dbError = handleDatabaseError(error)
      return NextResponse.json(
        {
          error: dbError.userMessage,
          type: dbError.type,
          code: dbError.code,
        },
        { status: 500 },
      )
    }

    // Error genérico
    const serverError = ErrorMessages.SERVER_ERROR
    return NextResponse.json(
      {
        error: serverError.userMessage,
        type: serverError.type,
      },
      { status: 500 },
    )
  }
}
