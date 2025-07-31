import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL = "tu-database-url"

async function changeUserPassword(username, newPassword) {
  try {
    const sql = neon(DATABASE_URL)

    // Generar nuevo hash
    const newHash = await bcrypt.hash(newPassword, 10)

    // Actualizar usuario específico
    const result = await sql`
      UPDATE usuarios 
      SET password_hash = ${newHash}
      WHERE username = ${username}
      RETURNING username
    `

    if (result.length > 0) {
      console.log(`✅ Contraseña cambiada para: ${username}`)
    } else {
      console.log(`❌ Usuario no encontrado: ${username}`)
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

// Ejemplos de uso:
// changeUserPassword("admin", "nueva_contraseña_super_segura")
// changeUserPassword("empleado1", "empleado123")
