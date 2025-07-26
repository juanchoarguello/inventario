import crypto from "crypto"
import { sql } from "./database"

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function createPasswordResetToken(usuarioId: number): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Expira en 1 hora

  await sql`
    INSERT INTO password_reset_tokens (usuario_id, token, expires_at)
    VALUES (${usuarioId}, ${token}, ${expiresAt.toISOString()})
  `

  return token
}

export async function createEmailVerificationToken(usuarioId: number): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

  await sql`
    INSERT INTO email_verification_tokens (usuario_id, token, expires_at)
    VALUES (${usuarioId}, ${token}, ${expiresAt.toISOString()})
  `

  return token
}

export async function validatePasswordResetToken(token: string) {
  const results = await sql`
    SELECT prt.*, u.id as user_id, u.email, u.nombre_completo
    FROM password_reset_tokens prt
    JOIN usuarios u ON prt.usuario_id = u.id
    WHERE prt.token = ${token} 
    AND prt.expires_at > NOW() 
    AND prt.used = false
    AND u.activo = true
  `

  return results[0] || null
}

export async function validateEmailVerificationToken(token: string) {
  const results = await sql`
    SELECT evt.*, u.id as user_id, u.email, u.nombre_completo
    FROM email_verification_tokens evt
    JOIN usuarios u ON evt.usuario_id = u.id
    WHERE evt.token = ${token} 
    AND evt.expires_at > NOW() 
    AND evt.verified = false
    AND u.activo = true
  `

  return results[0] || null
}

export async function markPasswordResetTokenAsUsed(token: string) {
  await sql`
    UPDATE password_reset_tokens 
    SET used = true 
    WHERE token = ${token}
  `
}

export async function markEmailAsVerified(usuarioId: number, token: string) {
  await sql`
    UPDATE email_verification_tokens 
    SET verified = true 
    WHERE token = ${token} AND usuario_id = ${usuarioId}
  `

  await sql`
    UPDATE usuarios 
    SET email_verified = true 
    WHERE id = ${usuarioId}
  `
}
