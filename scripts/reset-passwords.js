import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function resetPasswords() {
  try {
    console.log("🔄 Reseteando contraseñas de usuarios...")

    const sql = neon(DATABASE_URL)

    // Generar nuevo hash para "admin123"
    const newPasswordHash = await bcrypt.hash("admin123", 10)
    console.log(`🔑 Nuevo hash generado: ${newPasswordHash.substring(0, 20)}...`)

    // Verificar que el hash funciona
    const testVerification = await bcrypt.compare("admin123", newPasswordHash)
    console.log(`✅ Verificación del hash: ${testVerification ? "EXITOSA" : "FALLIDA"}`)

    if (!testVerification) {
      throw new Error("El hash generado no es válido")
    }

    // Actualizar todos los usuarios con el nuevo hash
    const result = await sql`
      UPDATE usuarios 
      SET password_hash = ${newPasswordHash}
      WHERE username IN ('admin', 'supervisor1', 'empleado1', 'empleado2')
      RETURNING username, id
    `

    console.log(`✅ Contraseñas actualizadas para ${result.length} usuarios:`)
    result.forEach((user) => {
      console.log(`  - ${user.username} (ID: ${user.id})`)
    })

    // Invalidar todas las sesiones activas
    await sql`
      UPDATE sesiones 
      SET activa = false 
      WHERE activa = true
    `

    console.log("🧹 Todas las sesiones han sido invalidadas")
    console.log("\n🎉 Reset completado. Todos los usuarios pueden usar la contraseña: admin123")
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

resetPasswords()
