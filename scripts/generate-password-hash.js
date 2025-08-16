const bcrypt = require("bcryptjs")

/**
 * Script para generar hash de contraseña usando bcrypt
 * Uso: node scripts/generate-password-hash.js
 */
async function generatePasswordHash() {
  const password = "admin123"
  const saltRounds = 12

  try {
    console.log("Generando hash para la contraseña:", password)
    console.log("Salt rounds:", saltRounds)
    console.log("---")

    const hash = await bcrypt.hash(password, saltRounds)

    console.log("Hash generado:")
    console.log(hash)
    console.log("---")

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hash)
    console.log("Verificación del hash:", isValid ? "✅ CORRECTO" : "❌ ERROR")

    console.log("\n📋 SQL para actualizar la base de datos:")
    console.log(`UPDATE usuarios SET password = '${hash}' WHERE email = 'admin@sistema.com';`)
  } catch (error) {
    console.error("Error generando hash:", error)
  }
}

generatePasswordHash()
