export interface Usuario {
  id: number
  nombre: string
  email: string
  password?: string
  rol: "admin" | "usuario"
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string
  fecha_actualizacion?: string
}

export interface AuthUser {
  id: number
  nombre: string
  email: string
  rol: "admin" | "usuario"
}

export interface CreateUserData {
  nombre: string
  email: string
  password: string
  rol: "admin" | "usuario"
}

export interface LoginCredentials {
  email: string
  password: string
}

// Tipos de partes
export interface Parte {
  id: number
  nombre: string
  descripcion?: string
  codigo: string
  categoria: string
  marca?: string
  modelo_compatible?: string
  stock: number
  stock_minimo: number
  precio: number
  proveedor?: string
  ubicacion?: string
  fecha_creacion: string
  fecha_actualizacion?: string
  usuario_creacion: number
  usuario_actualizacion?: number
}

export interface CreateParteData {
  nombre: string
  descripcion?: string
  codigo: string
  categoria: string
  marca?: string
  modelo_compatible?: string
  stock: number
  stock_minimo: number
  precio: number
  proveedor?: string
  ubicacion?: string
}

export interface UpdateParteData extends Partial<CreateParteData> {
  id?: number
}

// Tipos de historial
export interface HistorialAccion {
  id: number
  usuario_id: number
  usuario_nombre?: string
  accion: string
  tabla_afectada: string
  registro_id: string
  datos_anteriores?: any
  datos_nuevos?: any
  direccion_ip?: string
  user_agent?: string
  fecha: string
}

// Tipos de dashboard
export interface DashboardStats {
  totalPartes: number
  stockBajo: number
  totalUsuarios: number
  valorInventario: number
}

// Tipos de respuesta API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos de paginación
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
