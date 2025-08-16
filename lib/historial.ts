import { sql } from "@/lib/database"
import type { HistorialAccion } from "@/lib/types"

export class HistorialRepository {
  /**
   * Registra una acción en el historial
   */
  static async registrarAccion(
    usuarioId: number,
    accion: string,
    tablaAfectada: string,
    registroId: string,
    datosAnteriores?: any,
    datosNuevos?: any,
    direccionIp?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      console.log(`Registrando acción en historial:`, {
        usuarioId,
        accion,
        tablaAfectada,
        registroId,
        direccionIp,
        userAgent: userAgent?.substring(0, 50) + "...",
      })

      const result = await sql`
        INSERT INTO historial_acciones (
          usuario_id, accion, tabla_afectada, registro_id,
          datos_anteriores, datos_nuevos, direccion_ip, user_agent
        )
        VALUES (
          ${usuarioId}, ${accion}, ${tablaAfectada}, ${registroId},
          ${datosAnteriores ? JSON.stringify(datosAnteriores) : null},
          ${datosNuevos ? JSON.stringify(datosNuevos) : null},
          ${direccionIp || null}, ${userAgent || null}
        )
        RETURNING id
      `

      console.log(`Acción registrada en historial con ID:`, result[0]?.id)
    } catch (error) {
      console.error("Error registrando acción en historial:", error)
      // No lanzar error para no interrumpir la operación principal
    }
  }

  /**
   * Obtiene el historial de acciones
   */
  static async findAll(limit = 100): Promise<HistorialAccion[]> {
    try {
      const result = await sql`
        SELECT h.*, u.nombre as usuario_nombre
        FROM historial_acciones h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        ORDER BY h.fecha DESC
        LIMIT ${limit}
      `
      return result
    } catch (error) {
      console.error("Error obteniendo historial:", error)
      return []
    }
  }

  /**
   * Obtiene el historial por usuario
   */
  static async findByUsuario(usuarioId: number, limit = 50): Promise<HistorialAccion[]> {
    try {
      const result = await sql`
        SELECT h.*, u.nombre as usuario_nombre
        FROM historial_acciones h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        WHERE h.usuario_id = ${usuarioId}
        ORDER BY h.fecha DESC
        LIMIT ${limit}
      `
      return result
    } catch (error) {
      console.error("Error obteniendo historial por usuario:", error)
      return []
    }
  }

  /**
   * Obtiene el historial por tabla
   */
  static async findByTabla(tabla: string, limit = 50): Promise<HistorialAccion[]> {
    try {
      const result = await sql`
        SELECT h.*, u.nombre as usuario_nombre
        FROM historial_acciones h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        WHERE h.tabla_afectada = ${tabla}
        ORDER BY h.fecha DESC
        LIMIT ${limit}
      `
      return result
    } catch (error) {
      console.error("Error obteniendo historial por tabla:", error)
      return []
    }
  }
}
