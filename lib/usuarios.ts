import { sql } from "@/lib/database"
import type { Usuario, CreateUserData } from "@/lib/index"

/**
 * Repositorio para operaciones de usuarios en la base de datos
 * Implementa el patrón Repository y principios SOLID
 */
export class UsuariosRepository {
  /**
   * Busca un usuario por email
   * @param email - Email del usuario
   * @returns Promise<Usuario | null>
   */
  static async findByEmail(email: string): Promise<Usuario | null> {
    try {
      if (!email || typeof email !== "string") {
        return null
      }

      const result = await sql`
        SELECT * FROM usuarios 
        WHERE LOWER(email) = LOWER(${email.trim()}) 
        AND activo = true
      `

      return (result[0] as Usuario) || null
    } catch (error) {
      console.error("Error finding user by email:", error)
      throw new Error("Database query failed")
    }
  }

  /**
   * Busca un usuario por ID
   * @param id - ID del usuario
   * @returns Promise<Usuario | null>
   */
  static async findById(id: number): Promise<Usuario | null> {
    try {
      if (!id || typeof id !== "number" || id <= 0) {
        return null
      }

      const result = await sql`
        SELECT id, nombre, email, rol, activo, fecha_creacion, ultimo_acceso 
        FROM usuarios 
        WHERE id = ${id} AND activo = true
      `

      return (result[0] as Usuario) || null
    } catch (error) {
      console.error("Error finding user by ID:", error)
      throw new Error("Database query failed")
    }
  }

  /**
   * Obtiene todos los usuarios activos
   * @returns Promise<Usuario[]>
   */
  static async findAll(): Promise<Usuario[]> {
    try {
      const result = await sql`
        SELECT id, nombre, email, rol, activo, fecha_creacion, ultimo_acceso 
        FROM usuarios 
        WHERE activo = true
        ORDER BY fecha_creacion DESC
      `

      return result as Usuario[]
    } catch (error) {
      console.error("Error finding all users:", error)
      throw new Error("Database query failed")
    }
  }

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Promise<Usuario>
   */
  static async create(userData: CreateUserData): Promise<Usuario> {
    try {
      if (!userData.nombre || !userData.email || !userData.password) {
        throw new Error("Missing required user data")
      }

      const result = await sql`
        INSERT INTO usuarios (nombre, email, password, rol)
        VALUES (
          ${userData.nombre.trim()}, 
          ${userData.email.toLowerCase().trim()}, 
          ${userData.password}, 
          ${userData.rol}
        )
        RETURNING id, nombre, email, rol, activo, fecha_creacion
      `

      return result[0] as Usuario
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error("Failed to create user")
    }
  }

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario
   * @param userData - Datos a actualizar
   * @returns Promise<Usuario | null>
   */
  static async update(id: number, userData: Partial<CreateUserData>): Promise<Usuario | null> {
    try {
      if (!id || typeof id !== "number" || id <= 0) {
        return null
      }

      const fields = Object.keys(userData).filter((key) => userData[key as keyof CreateUserData] !== undefined)

      if (fields.length === 0) {
        return null
      }

      console.log("Updating user with data:", userData)

      // Actualizar solo los campos proporcionados (SIN fecha_actualizacion porque no existe)
      const result = await sql`
        UPDATE usuarios 
        SET 
          nombre = COALESCE(${userData.nombre || null}, nombre),
          email = COALESCE(${userData.email || null}, email),
          password = COALESCE(${userData.password || null}, password),
          rol = COALESCE(${userData.rol || null}, rol)
        WHERE id = ${id}
        RETURNING id, nombre, email, rol, activo, fecha_creacion
      `

      console.log("Update result:", result)

      return (result[0] as Usuario) || null
    } catch (error) {
      console.error("Error updating user:", error)
      throw new Error("Failed to update user")
    }
  }

  /**
   * Actualiza la fecha de último acceso del usuario
   * @param id - ID del usuario
   */
  static async updateLastAccess(id: number): Promise<void> {
    try {
      if (!id || typeof id !== "number" || id <= 0) {
        return
      }

      await sql`
        UPDATE usuarios 
        SET ultimo_acceso = NOW() 
        WHERE id = ${id}
      `
    } catch (error) {
      console.error("Error updating last access:", error)
      // No lanzar error aquí ya que no es crítico
    }
  }

  /**
   * Desactiva un usuario (soft delete)
   * @param id - ID del usuario
   * @returns Promise<boolean>
   */
  static async delete(id: number): Promise<boolean> {
    try {
      if (!id || typeof id !== "number" || id <= 0) {
        return false
      }

      const result = await sql`
        UPDATE usuarios 
        SET activo = false 
        WHERE id = ${id}
      `

      return result.count > 0
    } catch (error) {
      console.error("Error deleting user:", error)
      throw new Error("Failed to delete user")
    }
  }

  /**
   * Cuenta el número total de usuarios activos
   * @returns Promise<number>
   */
  static async count(): Promise<number> {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM usuarios WHERE activo = true
      `

      return Number.parseInt((result[0] as any).count)
    } catch (error) {
      console.error("Error counting users:", error)
      throw new Error("Failed to count users")
    }
  }
}
