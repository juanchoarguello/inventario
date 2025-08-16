import bcrypt from "bcryptjs"

/**
 * Servicio para manejo seguro de contraseñas usando bcrypt
 * Implementa el principio de responsabilidad única (SRP)
 */
export class PasswordService {
  private static readonly SALT_ROUNDS = 12

  /**
   * Genera un hash seguro de la contraseña usando bcrypt
   * @param password - Contraseña en texto plano
   * @returns Promise<string> - Hash de la contraseña
   */
  static async hash(password: string): Promise<string> {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string")
    }

    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS)
    } catch (error) {
      console.error("Error hashing password:", error)
      throw new Error("Failed to hash password")
    }
  }

  /**
   * Verifica si una contraseña coincide con su hash
   * @param password - Contraseña en texto plano
   * @param hash - Hash almacenado en la base de datos
   * @returns Promise<boolean> - true si coincide, false si no
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash || typeof password !== "string" || typeof hash !== "string") {
      return false
    }

    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error("Error verifying password:", error)
      return false
    }
  }

  /**
   * Valida que una contraseña cumpla con los requisitos de seguridad
   * @param password - Contraseña a validar
   * @returns objeto con resultado de validación y errores
   */
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!password || typeof password !== "string") {
      errors.push("La contraseña es requerida")
      return { isValid: false, errors }
    }

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una mayúscula")
    }

    if (!/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una minúscula")
    }

    if (!/\d/.test(password)) {
      errors.push("La contraseña debe contener al menos un número")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Genera un hash para una contraseña específica (útil para testing/setup)
   * @param password - Contraseña a hashear
   * @returns Promise<string> - Hash generado
   */
  static async generateHash(password: string): Promise<string> {
    return this.hash(password)
  }
}
