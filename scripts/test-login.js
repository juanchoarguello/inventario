import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function testLogin() {
  try {
    console.log("🧪 Probando login de usuarios...")

    const sql = neon(DATABASE_URL)

    // Obtener todos los usuarios
    const users = await sql`
      SELECT id, username, email, password_hash, nombre_completo, rol, activo
      FROM usuarios 
      WHERE activo = true
      ORDER BY id
    `

    console.log(`\n👥 Probando ${users.length} usuarios activos:`)
    console.log("=" * 60)

    const testPassword = "admin123"

    for (const user of users) {
      console.log(`\n🔸 Probando: ${user.username}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Rol: ${user.rol}`)
      console.log(`  Hash: ${user.password_hash.substring(0, 25)}...`)

      try {
        const isValid = await bcrypt.compare(testPassword, user.password_hash)

        if (isValid) {
          console.log(`  ✅ LOGIN EXITOSO con contraseña "${testPassword}"`)
        } else {
          console.log(`  ❌ LOGIN FALLIDO con contraseña "${testPassword}"`)

          // Probar otras contraseñas comunes
          const otherPasswords = ["123456", "password", "admin", user.username]
          for (const pwd of otherPasswords) {
            const works = await bcrypt.compare(pwd, user.password_hash)
            if (works) {
              console.log(`  🔍 Funciona con: "${pwd}"`)
              break
            }
          }
        }
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`)
      }
    }

    // Estadísticas
    const workingUsers = []
    for (const user of users) {
      try {
        const works = await bcrypt.compare(testPassword, user.password_hash)
        if (works) workingUsers.push(user.username)
      } catch (error) {
        // ignore
      }
    }

    console.log(`\n📊 RESUMEN:`)
    console.log(`  Total usuarios: ${users.length}`)
    console.log(`  Funcionan con "admin123": ${workingUsers.length}`)
    console.log(`  Usuarios funcionales: ${workingUsers.join(", ")}`)

    if (workingUsers.length === 0) {
      console.log("\n⚠️  NINGÚN USUARIO FUNCIONA - Ejecuta fix-user-passwords.js")
    } else if (workingUsers.length < users.length) {
      console.log("\n⚠️  ALGUNOS USUARIOS NO FUNCIONAN - Ejecuta fix-user-passwords.js")
    } else {
      console.log("\n🎉 TODOS LOS USUARIOS FUNCIONAN CORRECTAMENTE")
    }
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testLogin()
