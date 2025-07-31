import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function testConnection() {
  try {
    console.log("🔄 Probando conexión a la base de datos...")

    const sql = neon(DATABASE_URL)

    // Probar conexión básica
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("✅ Conexión exitosa!")
    console.log("⏰ Hora actual:", result[0].current_time)
    console.log("🗄️ Versión de PostgreSQL:", result[0].db_version.split(" ")[0])

    // Verificar si existen las tablas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    console.log("\n📋 Tablas encontradas:")
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`)
    })

    // Verificar usuarios
    const users = await sql`SELECT username, rol, activo FROM usuarios ORDER BY id`
    console.log("\n👥 Usuarios en la base de datos:")
    users.forEach((user) => {
      console.log(`  - ${user.username} (${user.rol}) - ${user.activo ? "Activo" : "Inactivo"}`)
    })

    // Verificar partes
    const partsCount = await sql`SELECT COUNT(*) as total FROM partes`
    console.log(`\n📦 Total de partes en inventario: ${partsCount[0].total}`)
  } catch (error) {
    console.error("❌ Error de conexión:", error.message)
    console.error("💡 Verifica que:")
    console.error("  1. La URL de la base de datos sea correcta")
    console.error("  2. Las tablas hayan sido creadas")
    console.error("  3. Los datos iniciales hayan sido insertados")
  }
}

testConnection()
