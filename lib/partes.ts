import { sql } from "@/lib/database"
import type { Parte, CreateParteData, UpdateParteData } from "@/lib/index"

export class PartesRepository {
  static async findAll(): Promise<Parte[]> {
    const result = await sql`
      SELECT * FROM partes 
      ORDER BY fecha_creacion DESC
    `
    return result as Parte[]
  }

  static async findById(id: number): Promise<Parte | null> {
    const result = await sql`
      SELECT * FROM partes WHERE id = ${id}
    `
    return (result[0] as Parte) || null
  }

  static async findByCodigo(codigo: string): Promise<Parte | null> {
    const result = await sql`
      SELECT * FROM partes WHERE codigo = ${codigo}
    `
    return (result[0] as Parte) || null
  }

  static async findByCategoria(categoria: string): Promise<Parte[]> {
    const result = await sql`
      SELECT * FROM partes 
      WHERE categoria = ${categoria}
      ORDER BY nombre
    `
    return result as Parte[]
  }

  static async findStockBajo(): Promise<Parte[]> {
    const result = await sql`
      SELECT * FROM partes 
      WHERE stock <= stock_minimo
      ORDER BY stock ASC
    `
    return result as Parte[]
  }

  static async search(query: string): Promise<Parte[]> {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM partes 
      WHERE nombre ILIKE ${searchTerm} 
         OR descripcion ILIKE ${searchTerm}
         OR codigo ILIKE ${searchTerm}
         OR marca ILIKE ${searchTerm}
      ORDER BY nombre
    `
    return result as Parte[]
  }

  static async create(parteData: CreateParteData, usuarioId: number): Promise<Parte> {
    const result = await sql`
      INSERT INTO partes (
        nombre, descripcion, codigo, categoria, marca, modelo_compatible,
        stock, stock_minimo, precio, proveedor, ubicacion, usuario_creacion
      )
      VALUES (
        ${parteData.nombre}, ${parteData.descripcion}, ${parteData.codigo},
        ${parteData.categoria}, ${parteData.marca}, ${parteData.modelo_compatible},
        ${parteData.stock}, ${parteData.stock_minimo}, ${parteData.precio},
        ${parteData.proveedor}, ${parteData.ubicacion}, ${usuarioId}
      )
      RETURNING *
    `
    return result[0] as Parte
  }

  static async update(id: number, parteData: Partial<UpdateParteData>, usuarioId: number): Promise<Parte | null> {
    const result = await sql`
      UPDATE partes 
      SET 
        nombre = COALESCE(${parteData.nombre}, nombre),
        descripcion = COALESCE(${parteData.descripcion}, descripcion),
        categoria = COALESCE(${parteData.categoria}, categoria),
        marca = COALESCE(${parteData.marca}, marca),
        modelo_compatible = COALESCE(${parteData.modelo_compatible}, modelo_compatible),
        stock = COALESCE(${parteData.stock}, stock),
        stock_minimo = COALESCE(${parteData.stock_minimo}, stock_minimo),
        precio = COALESCE(${parteData.precio}, precio),
        proveedor = COALESCE(${parteData.proveedor}, proveedor),
        ubicacion = COALESCE(${parteData.ubicacion}, ubicacion),
        fecha_actualizacion = NOW(),
        usuario_actualizacion = ${usuarioId}
      WHERE id = ${id}
      RETURNING *
    `
    return (result[0] as Parte) || null
  }

  static async delete(id: number): Promise<boolean> {
    try {
      console.log(`Ejecutando DELETE en base de datos para parte ID: ${id}`)

      // Primero verificar que la parte existe
      const existingParte = await sql`
        SELECT id FROM partes WHERE id = ${id}
      `

      if (existingParte.length === 0) {
        console.log(`Parte con ID ${id} no existe en la base de datos`)
        return false
      }

      console.log(`Parte existe, procediendo con eliminación...`)

      // Ejecutar DELETE y obtener el resultado
      const result = await sql`
        DELETE FROM partes WHERE id = ${id}
      `

      console.log(`Resultado completo de DELETE:`, result)
      console.log(`Propiedades del resultado:`, Object.keys(result))

      // En Neon, el resultado puede tener diferentes propiedades
      // Intentar diferentes formas de verificar si se eliminó
      let deletedCount = 0

      if (typeof result.count !== "undefined") {
        deletedCount = result.count
      } else if (typeof result.rowCount !== "undefined") {
        deletedCount = result.rowCount
      } else if (Array.isArray(result)) {
        deletedCount = result.length
      } else if (result.changes) {
        deletedCount = result.changes
      }

      console.log(`Filas eliminadas: ${deletedCount}`)

      // Verificar que realmente se eliminó
      const verifyDeleted = await sql`
        SELECT id FROM partes WHERE id = ${id}
      `

      const actuallyDeleted = verifyDeleted.length === 0
      console.log(`Verificación post-eliminación: ${actuallyDeleted ? "eliminada" : "aún existe"}`)

      return actuallyDeleted
    } catch (error) {
      console.error(`Error eliminando parte ID ${id}:`, error)
      throw new Error("Failed to delete parte")
    }
  }

  static async count(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM partes
    `
    return Number.parseInt((result[0] as any).count)
  }

  static async getTotalValue(): Promise<number> {
    const result = await sql`
      SELECT SUM(stock * precio) as total FROM partes
    `
    return Number.parseFloat((result[0] as any).total || "0")
  }

  static async getCategories(): Promise<string[]> {
    const result = await sql`
      SELECT DISTINCT categoria FROM partes ORDER BY categoria
    `
    return result.map((row: any) => row.categoria)
  }
}
