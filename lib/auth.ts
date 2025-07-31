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
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}
