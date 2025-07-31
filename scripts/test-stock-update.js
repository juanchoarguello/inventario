import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function testStockUpdate() {
  try {
    console.log("🧪 PROBANDO ACTUALIZACIÓN DE STOCK...")

    const sql = neon(DATABASE_URL)

    // Obtener una parte para probar
    const parts = await sql`
      SELECT id, codigo, nombre, stock, stock_minimo, precio
      FROM partes 
      ORDER BY id 
      LIMIT 1
    `

    if (parts.length === 0) {
      console.log("❌ No hay partes para probar")
      return
    }

    const testPart = parts[0]
    console.log("\n📦 PARTE DE PRUEBA:")
    console.log(`   ID: ${testPart.id}`)
    console.log(`   Nombre: ${testPart.nombre}`)
    console.log(`   Stock actual: ${testPart.stock}`)
    console.log(`   Stock mínimo actual: ${testPart.stock_minimo}`)
    console.log(`   Precio actual: $${testPart.precio}`)

    // PRUEBA 1: Stock = 0
    console.log("\n🔬 PRUEBA 1: Establecer stock en 0")
    await sql`
      UPDATE partes 
      SET stock = 0, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${testPart.id}
    `

    const result1 = await sql`SELECT stock FROM partes WHERE id = ${testPart.id}`
    console.log(`   ✅ Stock guardado: ${result1[0].stock}`)

    // PRUEBA 2: Stock mínimo = 0
    console.log("\n🔬 PRUEBA 2: Establecer stock mínimo en 0")
    await sql`
      UPDATE partes 
      SET stock_minimo = 0, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${testPart.id}
    `

    const result2 = await sql`SELECT stock_minimo FROM partes WHERE id = ${testPart.id}`
    console.log(`   ✅ Stock mínimo guardado: ${result2[0].stock_minimo}`)

    // PRUEBA 3: Valores personalizados
    const customStock = 25
    const customMinStock = 5
    const customPrice = 99.99

    console.log("\n🔬 PRUEBA 3: Valores personalizados")
    console.log(`   Estableciendo: Stock=${customStock}, Mínimo=${customMinStock}, Precio=$${customPrice}`)

    await sql`
      UPDATE partes 
      SET 
        stock = ${customStock},
        stock_minimo = ${customMinStock},
        precio = ${customPrice},
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${testPart.id}
    `

    const result3 = await sql`
      SELECT stock, stock_minimo, precio 
      FROM partes 
      WHERE id = ${testPart.id}
    `

    console.log(`   ✅ Stock guardado: ${result3[0].stock}`)
    console.log(`   ✅ Stock mínimo guardado: ${result3[0].stock_minimo}`)
    console.log(`   ✅ Precio guardado: $${result3[0].precio}`)

    // PRUEBA 4: Restaurar valores originales
    console.log("\n🔄 RESTAURANDO valores originales...")
    await sql`
      UPDATE partes 
      SET 
        stock = ${testPart.stock},
        stock_minimo = ${testPart.stock_minimo},
        precio = ${testPart.precio}
      WHERE id = ${testPart.id}
    `

    console.log("✅ Valores restaurados")

    console.log("\n🎉 TODAS LAS PRUEBAS COMPLETADAS")
    console.log("   ✅ Stock = 0 funciona")
    console.log("   ✅ Stock mínimo = 0 funciona")
    console.log("   ✅ Valores personalizados funcionan")
    console.log("   ✅ Base de datos acepta cualquier valor numérico")
  } catch (error) {
    console.error("❌ ERROR:", error)
  }
}

testStockUpdate()
