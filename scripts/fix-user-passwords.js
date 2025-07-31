import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function fixUserPasswords() {
  try {
    console.log("🔧 Arreglando contraseñas de usuarios...")

    const sql = neon(DATABASE_URL)

    // Generar hash correcto para "admin123"
    console.log("🔑 Generando hash para 'admin123'...")
    const correctHash = await bcrypt.hash("admin123", 10)
    console.log(`✅ Hash generado: ${correctHash}`)

    // Verificar que el hash funciona
    const verification = await bcrypt.compare("admin123", correctHash)
    console.log(`🔍 Verificación: ${verification ? "✅ CORRECTA" : "❌ INCORRECTA"}`)

    if (!verification) {
      throw new Error("El hash generado no es válido")
    }

    // Obtener usuarios actuales
    const currentUsers = await sql`
      SELECT id, username, password_hash FROM usuarios 
      ORDER BY id
    `

    console.log("\n📋 Usuarios actuales:")
    for (const user of currentUsers) {
      console.log(`  ${user.id}. ${user.username} - Hash: ${user.password_hash.substring(0, 30)}...`)

      // Probar si la contraseña actual funciona
      try {
        const works = await bcrypt.compare("admin123", user.password_hash)
        console.log(`     Contraseña "admin123": ${works ? "✅ FUNCIONA" : "❌ NO FUNCIONA"}`)
      } catch (error) {
        console.log(`     ❌ Error verificando: ${error.message}`)
      }
    }

    // Actualizar usuarios con el hash correcto
    console.log("\n🔄 Actualizando contraseñas...")

    const updateResult = await sql`
      UPDATE usuarios 
      SET password_hash = ${correctHash}
      WHERE username IN ('admin', 'supervisor1', 'empleado1', 'empleado2')
      RETURNING id, username
    `

    console.log(`✅ Actualizados ${updateResult.length} usuarios del sistema:`)
    updateResult.forEach((user) => {
      console.log(`  - ${user.username} (ID: ${user.id})`)
    })

    // También actualizar los usuarios que creaste manualmente
    const manualUsers = await sql`
      SELECT id, username FROM usuarios 
      WHERE username IN ('administrador', 'admin3', 'administrador2')
    `

    if (manualUsers.length > 0) {
      console.log("\n🔄 Actualizando usuarios creados manualmente...")

      const manualUpdateResult = await sql`
        UPDATE usuarios 
        SET password_hash = ${correctHash}
        WHERE username IN ('administrador', 'admin3', 'administrador2')
        RETURNING id, username
      `

      console.log(`✅ Actualizados ${manualUpdateResult.length} usuarios manuales:`)
      manualUpdateResult.forEach((user) => {
        console.log(`  - ${user.username} (ID: ${user.id})`)
      })
    }

    // Limpiar sesiones activas para forzar nuevo login
    await sql`UPDATE sesiones SET activa = false WHERE activa = true`
    console.log("🧹 Sesiones activas limpiadas")

    console.log("\n🎉 ¡ARREGLADO! Ahora todos los usuarios pueden usar:")
    console.log("   👤 Usuario: admin, supervisor1, empleado1, empleado2, administrador, admin3, administrador2")
    console.log("   🔑 Contraseña: admin123")

    // Verificación final
    console.log("\n🔍 Verificación final:")
    const finalUsers = await sql`
      SELECT id, username, password_hash FROM usuarios 
      ORDER BY id
    `

    for (const user of finalUsers) {
      const works = await bcrypt.compare("admin123", user.password_hash)
      console.log(`  ${user.username}: ${works ? "✅ FUNCIONA" : "❌ NO FUNCIONA"}`)
    }
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

fixUserPasswords()
