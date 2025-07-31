import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql } from "./database"
import type { Usuario } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export interface TokenPayload {
  id: number
  username: string
  rol: string
}

export function generateToken(user: Usuario): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      rol: user.rol,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  )
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserFromToken(token: string): Promise<Usuario | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const users = await sql`
      SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion
      FROM usuarios 
      WHERE id = ${decoded.id} AND activo = true
    `

    if (users.length === 0) return null

    return users[0] as Usuario
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

export async function authenticateUser(username: string, password: string): Promise<Usuario | null> {
  try {
    const users = await sql`
      SELECT id, username, email, nombre_completo, rol, activo, fecha_creacion, password_hash
      FROM usuarios 
      WHERE username = ${username} AND activo = true
    `

    if (users.length === 0) return null

    const user = users[0] as Usuario & { password_hash: string }
    const isValidPassword = await comparePassword(password, user.password_hash)

    if (!isValidPassword) return null

    // Remover password_hash del objeto retornado
    const { password_hash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function logAction(
  userId: number,
  accion: string,
  tabla: string,
  registroId: number | null,
  datosAnteriores: Record<string, unknown> | null,
  datosNuevos: Record<string, unknown> | null,
  ipAddress: string,
  userAgent: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO historial_acciones (
        usuario_id, 
        accion, 
        tabla_afectada, 
        registro_id, 
        datos_anteriores, 
        datos_nuevos, 
        ip_address, 
        user_agent
      ) VALUES (
        ${userId}, 
        ${accion}, 
        ${tabla}, 
        ${registroId}, 
        ${datosAnteriores ? JSON.stringify(datosAnteriores) : null}, 
        ${datosNuevos ? JSON.stringify(datosNuevos) : null}, 
        ${ipAddress}, 
        ${userAgent}
      )
    `
  } catch (error) {
    console.error("Error logging action:", error)
  }
}
