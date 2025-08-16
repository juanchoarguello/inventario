// testCredentials.js
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

// Variables de prueba
const testEmail = "admin@sistema.com";
const testPassword = "admin123";

// Conexión a la base de datos usando .env.local
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL no está configurada en el entorno.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function testLogin() {
  try {
    // Buscar usuario por correo
    const result = await sql`
      SELECT email, password
      FROM usuarios
      WHERE email = ${testEmail}
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log("❌ Error: correo no registrado");
      return;
    }

    const user = result[0];

    // Comparar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    if (!passwordMatch) {
      console.log("❌ Error: contraseña incorrecta");
      return;
    }

    console.log("✅ Credenciales correctas");

  } catch (error) {
    console.error("❌ Error al probar credenciales:", error.message);
  }
}

testLogin();
