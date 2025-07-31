import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function debugStockStatus() {
  try {
    console.log("🔍 VERIFICANDO ESTADO DEL STOCK...")

    const sql = neon(DATABASE_URL)

    // Obtener todas las partes con sus valores de stock
    const parts = await sql`
      SELECT 
        id, 
        codigo, 
        nombre, 
        stock, 
        stock_minimo,
        categoria,
        marca
      FROM partes 
      ORDER BY stock ASC, stock_minimo ASC
    `

    console.log(`\n📦 ANÁLISIS DE ${parts.length} PARTES:`)
    console.log("=" * 80)

    let stockBajoCount = 0
    let stockCeroCount = 0
    let stockNormalCount = 0

    parts.forEach((part, index) => {
      const stock = Number(part.stock)
      const stockMinimo = Number(part.stock_minimo)
      const esBajo = stock <= stockMinimo

      if (esBajo) stockBajoCount++
      if (stock === 0) stockCeroCount++
      if (!esBajo) stockNormalCount++

      console.log(`\n${index + 1}. ${part.nombre} (${part.codigo})`)
      console.log(`   📊 Stock actual: ${stock}`)
      console.log(`   ⚠️  Stock mínimo: ${stockMinimo}`)
      console.log(`   🚨 Estado: ${esBajo ? "🔴 STOCK BAJO" : "🟢 STOCK OK"}`)

      if (stock === 0) {
        console.log(`   💀 ¡AGOTADO!`)
      } else if (stock < stockMinimo) {
        console.log(`   📉 Faltan ${stockMinimo - stock} unidades`)
      } else if (stock === stockMinimo) {
        console.log(`   ⚖️  En el límite exacto`)
      }
    })

    console.log(`\n📊 RESUMEN:`)
    console.log("=" * 50)
    console.log(`🔴 Partes con stock bajo: ${stockBajoCount}`)
    console.log(`💀 Partes agotadas (stock = 0): ${stockCeroCount}`)
    console.log(`🟢 Partes con stock normal: ${stockNormalCount}`)
    console.log(`📦 Total de partes: ${parts.length}`)

    // Mostrar específicamente las partes con stock bajo
    const lowStockParts = parts.filter((part) => Number(part.stock) <= Number(part.stock_minimo))

    if (lowStockParts.length > 0) {
      console.log(`\n🚨 PARTES QUE DEBERÍAN APARECER EN DASHBOARD:`)
      console.log("=" * 60)
      lowStockParts.forEach((part, index) => {
        console.log(`${index + 1}. ${part.nombre}`)
        console.log(`   Stock: ${part.stock} | Mínimo: ${part.stock_minimo}`)
      })
    } else {
      console.log(`\n✅ No hay partes con stock bajo`)
    }

    // Crear una parte de prueba con stock bajo si no hay ninguna
    if (lowStockParts.length === 0 && parts.length > 0) {
      const testPart = parts[0]
      console.log(`\n🧪 CREANDO PARTE DE PRUEBA CON STOCK BAJO...`)

      await sql`
        UPDATE partes 
        SET stock = 2, stock_minimo = 5
        WHERE id = ${testPart.id}
      `

      console.log(`✅ Parte "${testPart.nombre}" actualizada:`)
      console.log(`   Stock: 2 | Mínimo: 5 (debería aparecer como stock bajo)`)

      // Verificar el cambio
      const updated = await sql`
        SELECT stock, stock_minimo FROM partes WHERE id = ${testPart.id}
      `

      console.log(`🔍 Verificación: Stock=${updated[0].stock}, Mínimo=${updated[0].stock_minimo}`)
    }
  } catch (error) {
    console.error("❌ ERROR:", error)
  }
}

debugStockStatus()
