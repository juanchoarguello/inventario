import { sql } from "@/lib/database"

// ============================================
// TIPOS DE FACTURACIÓN
// ============================================

export interface Cliente {
  id: number
  codigo: string
  nombre: string
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'PAS' | 'TI'
  documento?: string
  telefono?: string
  whatsapp?: string
  email?: string
  direccion?: string
  ciudad?: string
  notas?: string
  activo: boolean
  fecha_creacion: string
}

export interface Proveedor {
  id: number
  codigo: string
  nombre: string
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'PAS'
  documento?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  contacto_nombre?: string
  contacto_telefono?: string
  notas?: string
  activo: boolean
  fecha_creacion: string
}

export interface DetalleFactura {
  id?: number
  factura_id?: number
  parte_id: number
  codigo_parte: string
  nombre_parte: string
  descripcion_parte?: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
  orden: number
}

export interface Factura {
  id: number
  numero_factura: string
  tipo: 'COMPRA' | 'VENTA'
  cliente_id?: number
  proveedor_id?: number
  fecha: string
  subtotal: number
  descuento: number
  total: number
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA'
  metodo_pago?: string
  notas?: string
  usuario_id: number
  fecha_creacion: string
}

export interface FacturaCompleta extends Factura {
  nombre_tercero?: string
  documento_tercero?: string
  telefono_tercero?: string
  email_tercero?: string
  usuario_nombre?: string
  detalles: DetalleFactura[]
}

export interface CreateFacturaData {
  tipo: 'COMPRA' | 'VENTA'
  cliente_id?: number
  proveedor_id?: number
  metodo_pago?: string
  notas?: string
  descuento?: number
  detalles: Omit<DetalleFactura, 'id' | 'factura_id'>[]
}

export interface BuscarParteResult {
  id: number
  codigo: string
  nombre: string
  categoria: string
  marca?: string
  modelo_compatible?: string
  stock: number
  precio_compra?: number
  precio_venta?: number
  margen_porcentaje?: number
}

export interface Configuracion {
  id: number
  nombre_empresa: string
  tipo_documento?: string
  documento?: string
  direccion?: string
  ciudad?: string
  telefono?: string
  whatsapp?: string
  email?: string
  sitio_web?: string
  logo_url?: string
  pie_factura?: string
  prefijo_compra: string
  prefijo_venta: string
  siguiente_numero_compra: number
  siguiente_numero_venta: number
}

// ============================================
// REPOSITORIO DE CLIENTES
// ============================================

export class ClientesRepository {
  static async findAll(): Promise<Cliente[]> {
    const result = await sql`
      SELECT * FROM clientes 
      WHERE activo = true
      ORDER BY nombre
    `
    return result as Cliente[]
  }

  static async findById(id: number): Promise<Cliente | null> {
    const result = await sql`
      SELECT * FROM clientes WHERE id = ${id}
    `
    return (result[0] as Cliente) || null
  }

  static async findByCodigo(codigo: string): Promise<Cliente | null> {
    const result = await sql`
      SELECT * FROM clientes WHERE codigo = ${codigo}
    `
    return (result[0] as Cliente) || null
  }

  static async search(query: string): Promise<Cliente[]> {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM clientes 
      WHERE activo = true
        AND (nombre ILIKE ${searchTerm} 
          OR documento ILIKE ${searchTerm}
          OR codigo ILIKE ${searchTerm})
      ORDER BY nombre
      LIMIT 20
    `
    return result as Cliente[]
  }

  static async create(data: Omit<Cliente, 'id' | 'fecha_creacion' | 'activo'>, usuarioId: number): Promise<Cliente> {
    const result = await sql`
      INSERT INTO clientes (
        codigo, nombre, tipo_documento, documento, telefono, whatsapp,
        email, direccion, ciudad, notas, usuario_creacion
      )
      VALUES (
        ${data.codigo}, ${data.nombre}, ${data.tipo_documento || 'CC'}, 
        ${data.documento}, ${data.telefono}, ${data.whatsapp},
        ${data.email}, ${data.direccion}, ${data.ciudad}, 
        ${data.notas}, ${usuarioId}
      )
      RETURNING *
    `
    return result[0] as Cliente
  }
}

// ============================================
// REPOSITORIO DE PROVEEDORES
// ============================================

export class ProveedoresRepository {
  static async findAll(): Promise<Proveedor[]> {
    const result = await sql`
      SELECT * FROM proveedores 
      WHERE activo = true
      ORDER BY nombre
    `
    return result as Proveedor[]
  }

  static async findById(id: number): Promise<Proveedor | null> {
    const result = await sql`
      SELECT * FROM proveedores WHERE id = ${id}
    `
    return (result[0] as Proveedor) || null
  }

  static async search(query: string): Promise<Proveedor[]> {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM proveedores 
      WHERE activo = true
        AND (nombre ILIKE ${searchTerm} 
          OR documento ILIKE ${searchTerm}
          OR codigo ILIKE ${searchTerm})
      ORDER BY nombre
      LIMIT 20
    `
    return result as Proveedor[]
  }

  static async create(data: Omit<Proveedor, 'id' | 'fecha_creacion' | 'activo'>, usuarioId: number): Promise<Proveedor> {
    const result = await sql`
      INSERT INTO proveedores (
        codigo, nombre, tipo_documento, documento, telefono, email,
        direccion, ciudad, contacto_nombre, contacto_telefono, notas, usuario_creacion
      )
      VALUES (
        ${data.codigo}, ${data.nombre}, ${data.tipo_documento || 'NIT'}, 
        ${data.documento}, ${data.telefono}, ${data.email},
        ${data.direccion}, ${data.ciudad}, ${data.contacto_nombre},
        ${data.contacto_telefono}, ${data.notas}, ${usuarioId}
      )
      RETURNING *
    `
    return result[0] as Proveedor
  }
}

// ============================================
// REPOSITORIO DE FACTURAS
// ============================================

export class FacturasRepository {
  static async buscarPartes(query: string): Promise<BuscarParteResult[]> {
    const result = await sql`
      SELECT * FROM buscar_parte(${query})
    `
    return result as BuscarParteResult[]
  }

  static async obtenerPartePorCodigo(codigo: string): Promise<BuscarParteResult | null> {
    const result = await sql`
      SELECT * FROM obtener_parte_por_codigo(${codigo})
    `
    return (result[0] as BuscarParteResult) || null
  }

  static async create(data: CreateFacturaData, usuarioId: number): Promise<FacturaCompleta> {
    const facturaResult = await sql`
      INSERT INTO facturas (
        tipo, cliente_id, proveedor_id, metodo_pago, notas, 
        descuento, usuario_id
      )
      VALUES (
        ${data.tipo}, ${data.cliente_id || null}, ${data.proveedor_id || null},
        ${data.metodo_pago || null}, ${data.notas || null},
        ${data.descuento || 0}, ${usuarioId}
      )
      RETURNING *
    `
    const factura = facturaResult[0] as Factura

    const detallesInsertados: DetalleFactura[] = []
    for (const detalle of data.detalles) {
      const detalleResult = await sql`
        INSERT INTO detalle_facturas (
          factura_id, parte_id, codigo_parte, nombre_parte, descripcion_parte,
          cantidad, precio_unitario, descuento, subtotal, orden
        )
        VALUES (
          ${factura.id}, ${detalle.parte_id}, ${detalle.codigo_parte},
          ${detalle.nombre_parte}, ${detalle.descripcion_parte || null},
          ${detalle.cantidad}, ${detalle.precio_unitario}, 
          ${detalle.descuento || 0}, ${detalle.subtotal}, ${detalle.orden}
        )
        RETURNING *
      `
      detallesInsertados.push(detalleResult[0] as DetalleFactura)
    }

    return await this.findById(factura.id) as FacturaCompleta
  }

  static async findById(id: number): Promise<FacturaCompleta | null> {
    const facturaResult = await sql`
      SELECT * FROM v_facturas_completas WHERE id = ${id}
    `
    if (facturaResult.length === 0) return null

    const factura = facturaResult[0] as any

    const detallesResult = await sql`
      SELECT * FROM detalle_facturas 
      WHERE factura_id = ${id}
      ORDER BY orden
    `

    return {
      ...factura,
      detalles: detallesResult as DetalleFactura[]
    } as FacturaCompleta
  }

  static async findAll(filters?: {
    tipo?: 'COMPRA' | 'VENTA'
    estado?: string
    desde?: string
    hasta?: string
  }): Promise<FacturaCompleta[]> {
    let result: any[]

    if (!filters || (!filters.tipo && !filters.estado && !filters.desde && !filters.hasta)) {
      result = await sql`
        SELECT * FROM v_facturas_completas 
        ORDER BY fecha DESC, id DESC 
        LIMIT 100
      `
    }
    else {
      if (filters.tipo && filters.estado && filters.desde && filters.hasta) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE tipo = ${filters.tipo}
            AND estado = ${filters.estado}
            AND fecha >= ${filters.desde}
            AND fecha <= ${filters.hasta}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else if (filters.tipo && filters.estado) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE tipo = ${filters.tipo}
            AND estado = ${filters.estado}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else if (filters.tipo && filters.desde && filters.hasta) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE tipo = ${filters.tipo}
            AND fecha >= ${filters.desde}
            AND fecha <= ${filters.hasta}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else if (filters.tipo) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE tipo = ${filters.tipo}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else if (filters.estado) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE estado = ${filters.estado}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else if (filters.desde && filters.hasta) {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          WHERE fecha >= ${filters.desde}
            AND fecha <= ${filters.hasta}
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
      else {
        result = await sql`
          SELECT * FROM v_facturas_completas 
          ORDER BY fecha DESC, id DESC 
          LIMIT 100
        `
      }
    }
    
    const facturasConDetalles: FacturaCompleta[] = []
    for (const factura of result) {
      const detallesResult = await sql`
        SELECT * FROM detalle_facturas 
        WHERE factura_id = ${(factura as any).id}
        ORDER BY orden
      `
      facturasConDetalles.push({
        ...(factura as any),
        detalles: detallesResult as DetalleFactura[]
      })
    }

    return facturasConDetalles
  }

  static async anular(id: number, motivo: string, usuarioId: number): Promise<boolean> {
    const result = await sql`
      UPDATE facturas
      SET estado = 'ANULADA',
          fecha_anulacion = NOW(),
          usuario_anulacion = ${usuarioId},
          motivo_anulacion = ${motivo}
      WHERE id = ${id} AND estado != 'ANULADA'
      RETURNING id
    `
    return result.length > 0
  }

  static async getConfiguracion(): Promise<Configuracion | null> {
    const result = await sql`
      SELECT * FROM configuracion LIMIT 1
    `
    return (result[0] as Configuracion) || null
  }

  static async updateConfiguracion(data: Partial<Configuracion>, usuarioId: number): Promise<Configuracion> {
    const result = await sql`
      UPDATE configuracion
      SET nombre_empresa = COALESCE(${data.nombre_empresa}, nombre_empresa),
          tipo_documento = COALESCE(${data.tipo_documento}, tipo_documento),
          documento = COALESCE(${data.documento}, documento),
          direccion = COALESCE(${data.direccion}, direccion),
          ciudad = COALESCE(${data.ciudad}, ciudad),
          telefono = COALESCE(${data.telefono}, telefono),
          whatsapp = COALESCE(${data.whatsapp}, whatsapp),
          email = COALESCE(${data.email}, email),
          sitio_web = COALESCE(${data.sitio_web}, sitio_web),
          pie_factura = COALESCE(${data.pie_factura}, pie_factura),
          fecha_actualizacion = NOW(),
          usuario_actualizacion = ${usuarioId}
      RETURNING *
    `
    return result[0] as Configuracion
  }

  static async crearParteInline(
    datosParte: {
      nombre: string
      descripcion?: string
      codigo: string
      categoria: string
      marca?: string
      modelo_compatible?: string
      stock: number
      stock_minimo: number
      precio_compra?: number
      precio_venta?: number
      proveedor?: string
      ubicacion?: string
      estado?: 'NUEVO' | 'USADO' | 'REMANUFACTURADO'
    },
    usuarioId: number
  ): Promise<BuscarParteResult> {
    const existente = await sql`
      SELECT id FROM partes WHERE codigo = ${datosParte.codigo}
    `
    
    if (existente.length > 0) {
      throw new Error('Ya existe una parte con ese código')
    }

    let margen = null
    if (datosParte.precio_compra && datosParte.precio_venta && datosParte.precio_compra > 0) {
      margen = ((datosParte.precio_venta - datosParte.precio_compra) / datosParte.precio_compra) * 100
    }

    const result = await sql`
      INSERT INTO partes (
        nombre, descripcion, codigo, categoria, marca, modelo_compatible,
        stock, stock_minimo, precio, precio_compra, precio_venta,
        proveedor, ubicacion, estado, margen_porcentaje, usuario_creacion
      )
      VALUES (
        ${datosParte.nombre},
        ${datosParte.descripcion || null},
        ${datosParte.codigo},
        ${datosParte.categoria},
        ${datosParte.marca || null},
        ${datosParte.modelo_compatible || null},
        ${datosParte.stock || 0},
        ${datosParte.stock_minimo || 0},
        ${datosParte.precio_venta || datosParte.precio_compra || 0},
        ${datosParte.precio_compra || null},
        ${datosParte.precio_venta || null},
        ${datosParte.proveedor || null},
        ${datosParte.ubicacion || null},
        ${datosParte.estado || 'NUEVO'},
        ${margen},
        ${usuarioId}
      )
      RETURNING id, codigo, nombre, categoria, marca, modelo_compatible, 
                stock, precio_compra, precio_venta, margen_porcentaje
    `

    return result[0] as BuscarParteResult
  }
}