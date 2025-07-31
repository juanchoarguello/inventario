import { neon } from "@neondatabase/serverless"

const DATABASE_URL =
  "postgresql://neondb_owner:npg_0nzP5NQWdUmt@ep-purple-sunset-ac04f9ui-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function debugPartsUpdate() {
  try {
    console.log("🔍 Verificando actualizaciones de partes...")

    const sql = neon(DATABASE_URL)

    // Obtener todas las partes con sus valores actuales
    const parts = await sql`
      SELECT 
        id, 
        codigo, 
        nombre, 
        precio, 
        stock, 
        stock_minimo,
        fecha_actualizacion,
        usuario_actualizacion
      FROM partes 
      ORDER BY fecha_actualizacion DESC
      LIMIT 10
    `

    console.log(`\n📦 Últimas 10 partes actualizadas:`)
    console.log("=" * 80)

    parts.forEach((part, index) => {
      console.log(`\n${index + 1}. ${part.nombre} (${part.codigo})`)
      console.log(`   💰 Precio: $${Number(part.precio).toFixed(2)}`)
      console.log(`   📊 Stock: ${part.stock} unidades`)
      console.log(`   ⚠️  Stock Mínimo: ${part.stock_minimo} unidades`)
      console.log(`   📅 Última actualización: ${part.fecha_actualizacion}`)
      console.log(`   👤 Actualizado por usuario ID: ${part.usuario_actualizacion || "N/A"}`)
    })

    // Verificar historial de cambios recientes
    const recentChanges = await sql`
      SELECT 
        h.*,
        u.username,
        u.nombre_completo
      FROM historial_acciones h
      JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.tabla_afectada = 'partes' 
      AND h.accion = 'UPDATE'
      ORDER BY h.fecha_accion DESC
      LIMIT 5
    `

    console.log(`\n📋 Últimos 5 cambios en partes:`)
    console.log("=" * 80)

    recentChanges.forEach((change, index) => {
      console.log(`\n${index + 1}. Cambio en parte ID: ${change.registro_id}`)
      console.log(`   👤 Usuario: ${change.nombre_completo} (${change.username})`)
      console.log(`   📅 Fecha: ${change.fecha_accion}`)

      if (change.datos_anteriores && change.datos_nuevos) {
        const anterior = change.datos_anteriores
        const nuevo = change.datos_nuevos

        console.log(`   📊 Cambios detectados:`)
        if (anterior.stock !== nuevo.stock) {
          console.log(`      Stock: ${anterior.stock} → ${nuevo.stock}`)
        }
        if (anterior.stock_minimo !== nuevo.stock_minimo) {
          console.log(`      Stock Mínimo: ${anterior.stock_minimo} → ${nuevo.stock_minimo}`)
        }
        if (anterior.precio !== nuevo.precio) {
          console.log(`      Precio: $${anterior.precio} → $${nuevo.precio}`)
        }
      }
    })

    // Probar una actualización directa
    console.log(`\n🧪 Probando actualización directa...`)

    const testPart = parts[0]
    if (testPart) {
      const newStock = Number(testPart.stock) + 1

      console.log(`📝 Actualizando parte "${testPart.nombre}" (ID: ${testPart.id})`)
      console.log(`   Stock actual: ${testPart.stock}`)
      console.log(`   Nuevo stock: ${newStock}`)

      const updateResult = await sql`
        UPDATE partes 
        SET stock = ${newStock}, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ${testPart.id}
        RETURNING id, nombre, stock, fecha_actualizacion
      `

      const updated = updateResult[0]
      console.log(`✅ Actualización exitosa:`)
      console.log(`   ID: ${updated.id}`)
      console.log(`   Nombre: ${updated.nombre}`)
      console.log(`   Stock guardado: ${updated.stock}`)
      console.log(`   Fecha actualización: ${updated.fecha_actualizacion}`)

      // Verificar que se guardó correctamente
      const verification = await sql`
        SELECT stock FROM partes WHERE id = ${testPart.id}
      `

      console.log(`🔍 Verificación: Stock en BD = ${verification[0].stock}`)

      // Revertir el cambio
      await sql`
        UPDATE partes 
        SET stock = ${testPart.stock}
        WHERE id = ${testPart.id}
      `
      console.log(`↩️  Cambio revertido`)
    }
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

debugPartsUpdate()
