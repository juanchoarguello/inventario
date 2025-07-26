import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql } from "./database"
import type { Usuario } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_EXPIRY = "24h"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): { userId: number; iat: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; iat: number }
    return decoded
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<Usuario | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const sessions = await sql`
      SELECT s.*, u.*
      FROM sesiones s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.token = ${token} 
      AND s.activa = true 
      AND s.fecha_expiracion > NOW()
      AND u.activo = true
    `

    if (sessions.length === 0) return null

    const session = sessions[0]
    return {
      id: session.usuario_id,
      username: session.username,
      email: session.email,
      password_hash: session.password_hash,
      nombre_completo: session.nombre_completo,
      rol: session.rol,
      activo: session.activo,
      fecha_creacion: session.fecha_creacion,
      ultimo_acceso: session.ultimo_acceso,
    } as Usuario
  } catch (error) {
    return null
  }
}

export async function createSession(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
  const token = generateToken(userId)
  const expirationDate = new Date()
  expirationDate.setHours(expirationDate.getHours() + 24)

  await sql`
    UPDATE sesiones 
    SET activa = false 
    WHERE usuario_id = ${userId} AND fecha_expiracion < NOW()
  `

  await sql`
    INSERT INTO sesiones (usuario_id, token, fecha_expiracion, ip_address, user_agent)
    VALUES (${userId}, ${token}, ${expirationDate.toISOString()}, ${ipAddress}, ${userAgent})
  `

  return token
}

export async function invalidateSession(token: string): Promise<void> {
  await sql`
    UPDATE sesiones 
    SET activa = false 
    WHERE token = ${token}
  `
}

export async function logAction(
  usuarioId: number,
  accion: string,
  tablaAfectada: string,
  registroId?: number,
  datosAnteriores?: any,
  datosNuevos?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await sql`
      INSERT INTO historial_acciones 
      (usuario_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos, ip_address, user_agent)
      VALUES (
        ${usuarioId}, 
        ${accion}, 
        ${tablaAfectada}, 
        ${registroId}, 
        ${JSON.stringify(datosAnteriores)}, 
        ${JSON.stringify(datosNuevos)}, 
        ${ipAddress}, 
        ${userAgent}
      )
    `
  } catch (error) {
    console.error("Error logging action:", error)
  }
}
