import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function debugUsers() {
  try {
    console.log("🔍 Verificando estado de usuarios...")

    const sql = neon(DATABASE_URL)

    // Obtener todos los usuarios
    const users = await sql`
      SELECT id, username, email, password_hash, nombre_completo, rol, activo, fecha_creacion, ultimo_acceso
      FROM usuarios 
      ORDER BY id
    `

    console.log(`\n👥 Usuarios encontrados: ${users.length}`)
    console.log("=" * 50)

    for (const user of users) {
      console.log(`\n🔸 Usuario: ${user.username}`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Nombre: ${user.nombre_completo}`)
      console.log(`  Rol: ${user.rol}`)
      console.log(`  Activo: ${user.activo}`)
      console.log(`  Hash: ${user.password_hash.substring(0, 20)}...`)
      console.log(`  Último acceso: ${user.ultimo_acceso || "Nunca"}`)

      // Verificar si la contraseña "admin123" funciona
      try {
        const isValid = await bcrypt.compare("admin123", user.password_hash)
        console.log(`  ✅ Contraseña "admin123": ${isValid ? "VÁLIDA" : "INVÁLIDA"}`)
      } catch (error) {
        console.log(`  ❌ Error verificando contraseña: ${error.message}`)
      }
    }

    // Verificar sesiones activas
    const sessions = await sql`
      SELECT s.*, u.username 
      FROM sesiones s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.activa = true
      ORDER BY s.fecha_inicio DESC
    `

    console.log(`\n🔐 Sesiones activas: ${sessions.length}`)
    console.log("=" * 50)

    for (const session of sessions) {
      const now = new Date()
      const expiration = new Date(session.fecha_expiracion)
      const isExpired = now > expiration

      console.log(`\n🔸 Sesión: ${session.usuario_id} (${session.username})`)
      console.log(`  Token: ${session.token.substring(0, 20)}...`)
      console.log(`  Inicio: ${session.fecha_inicio}`)
      console.log(`  Expira: ${session.fecha_expiracion}`)
      console.log(`  Estado: ${isExpired ? "❌ EXPIRADA" : "✅ VÁLIDA"}`)
    }

    // Limpiar sesiones expiradas
    const cleanupResult = await sql`
      UPDATE sesiones 
      SET activa = false 
      WHERE fecha_expiracion < NOW() AND activa = true
    `

    console.log(`\n🧹 Sesiones expiradas limpiadas: ${cleanupResult.length}`)
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

debugUsers()
