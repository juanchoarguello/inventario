import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL = "your_database_url_here" // Declare DATABASE_URL variable

async function changeBulkPasswords() {
  const sql = neon(DATABASE_URL)

  // Definir nuevas contraseñas por usuario
  const newPasswords = {
    admin: "admin_seguro_2024",
    supervisor1: "supervisor_123",
    empleado1: "empleado_abc",
    empleado2: "empleado_xyz",
  }

  for (const [username, password] of Object.entries(newPasswords)) {
    const hash = await bcrypt.hash(password, 10)

    await sql`
      UPDATE usuarios 
      SET password_hash = ${hash}
      WHERE username = ${username}
    `

    console.log(`✅ ${username}: nueva contraseña configurada`)
  }
}
