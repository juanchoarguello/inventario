import { sql } from "@/lib/database"
import type { Parte, CreateParteData, UpdateParteData } from "@/lib/index"

export class PartesRepository {
  static async findAll(includeInactive: boolean = false): Promise<Parte[]> {
    const result = includeInactive 
      ? await sql`SELECT * FROM partes ORDER BY fecha_creacion DESC`
      : await sql`SELECT * FROM partes WHERE activo = true ORDER BY fecha_creacion DESC`
    
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
      WHERE categoria = ${categoria} AND activo = true
      ORDER BY nombre
    `
    return result as Parte[]
  }

  static async findStockBajo(): Promise<Parte[]> {
    const result = await sql`
      SELECT * FROM partes 
      WHERE stock <= stock_minimo AND activo = true
      ORDER BY stock ASC
    `
    return result as Parte[]
  }

  static async search(query: string): Promise<Parte[]> {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM partes 
      WHERE (nombre ILIKE ${searchTerm} 
         OR descripcion ILIKE ${searchTerm}
         OR codigo ILIKE ${searchTerm}
         OR marca ILIKE ${searchTerm})
        AND activo = true
      ORDER BY nombre
    `
    return result as Parte[]
  }

  static async create(parteData: CreateParteData, usuarioId: number): Promise<Parte> {
    const result = await sql`
      INSERT INTO partes (
        nombre, descripcion, codigo, categoria, marca, modelo_compatible,
        stock, stock_minimo, precio, proveedor, ubicacion, activo, usuario_creacion
      )
      VALUES (
        ${parteData.nombre}, ${parteData.descripcion}, ${parteData.codigo},
        ${parteData.categoria}, ${parteData.marca}, ${parteData.modelo_compatible},
        ${parteData.stock}, ${parteData.stock_minimo}, ${parteData.precio},
        ${parteData.proveedor}, ${parteData.ubicacion}, true, ${usuarioId}
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

  // Soft Delete: Desactivar en lugar de eliminar
  static async delete(id: number): Promise<boolean> {
    try {
      console.log(`Desactivando parte ID: ${id} (soft delete)`)

      // Verificar si tiene facturas asociadas
      const facturas = await sql`
        SELECT COUNT(*) as count 
        FROM detalle_facturas 
        WHERE parte_id = ${id}
      `
      
      const tieneFacturas = parseInt((facturas[0] as any).count) > 0

      if (tieneFacturas) {
        console.log(`Parte ${id} tiene facturas asociadas, se desactivará en lugar de eliminar`)
        
        // Desactivar la parte (soft delete)
        const result = await sql`
          UPDATE partes 
          SET activo = false, 
              fecha_actualizacion = NOW()
          WHERE id = ${id}
          RETURNING id
        `
        
        return result.length > 0
      } else {
        console.log(`Parte ${id} no tiene facturas, se puede eliminar físicamente`)
        
        // Si no tiene facturas, eliminar físicamente
        await sql`DELETE FROM partes WHERE id = ${id}`
        
        // Verificar eliminación
        const verifyDeleted = await sql`SELECT id FROM partes WHERE id = ${id}`
        return verifyDeleted.length === 0
      }
    } catch (error) {
      console.error(`Error en soft delete para parte ID ${id}:`, error)
      
      // Si falla la eliminación física, intentar soft delete
      try {
        await sql`
          UPDATE partes 
          SET activo = false 
          WHERE id = ${id}
        `
        return true
      } catch (softDeleteError) {
        throw new Error("No se pudo desactivar la parte")
      }
    }
  }

  // Reactivar una parte desactivada
  static async reactivate(id: number): Promise<boolean> {
    try {
      const result = await sql`
        UPDATE partes 
        SET activo = true, 
            fecha_actualizacion = NOW()
        WHERE id = ${id}
        RETURNING id
      `
      return result.length > 0
    } catch (error) {
      console.error(`Error reactivando parte ID ${id}:`, error)
      return false
    }
  }

  static async count(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM partes WHERE activo = true
    `
    return parseInt((result[0] as any).count)
  }

  static async getTotalValue(): Promise<number> {
    const result = await sql`
      SELECT SUM(stock * precio) as total FROM partes WHERE activo = true
    `
    return parseFloat((result[0] as any).total || "0")
  }

  static async getCategories(): Promise<string[]> {
    const result = await sql`
      SELECT DISTINCT categoria FROM partes WHERE activo = true ORDER BY categoria
    `
    return result.map((row: any) => row.categoria)
  }
}