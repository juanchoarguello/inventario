import bcrypt from "bcryptjs"

async function generatePasswordHash(password) {
  try {
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    console.log(`Password: ${password}`)
    console.log(`Hash: ${hash}`)

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hash)
    console.log(`Verification: ${isValid ? "SUCCESS" : "FAILED"}`)

    return hash
  } catch (error) {
    console.error("Error generating hash:", error)
  }
}

// Generar hash para la contraseña admin123
generatePasswordHash("admin123")

// También puedes generar para otras contraseñas
// generatePasswordHash('supervisor123');
// generatePasswordHash('empleado123');
