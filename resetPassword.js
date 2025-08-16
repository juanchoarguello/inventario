// resetPassword.js
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function resetPassword() {
  try {
    const email = "admin@sistema.com";
    const newPassword = "admin123";

    // Generar el hash
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar en la base de datos
    const result = await sql`
      UPDATE usuarios
      SET password = ${hashedPassword}
      WHERE email = ${email}
      RETURNING id, email;
    `;

    if (result.length > 0) {
      console.log(`✅ Contraseña de ${email} actualizada correctamente.`);
    } else {
      console.log(`⚠️ No se encontró un usuario con el email: ${email}`);
    }
  } catch (err) {
    console.error("❌ Error al actualizar la contraseña:", err);
  }
}

resetPassword();
