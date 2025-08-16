export interface Usuario {
  id: number
  nombre: string
  email: string
  password?: string
  rol: "admin" | "usuario"
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string
}

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
  fecha_actualizacion: string
  usuario_creacion: number
  usuario_actualizacion?: number
}

export interface HistorialAccion {
  id: number
  usuario_id: number
  accion: string
  tabla_afectada: string
  registro_id: string
  datos_anteriores?: any
  datos_nuevos?: any
  direccion_ip?: string
  user_agent?: string
  fecha: string
  usuario_nombre?: string
}

export interface AuthUser {
  id: number
  nombre: string
  email: string
  rol: "admin" | "usuario"
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  nombre: string
  email: string
  password: string
  rol: "admin" | "usuario"
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
  id: number
}

export interface DashboardStats {
  totalPartes: number
  stockBajo: number
  totalUsuarios: number
  valorInventario: number
}
