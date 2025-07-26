import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export interface Usuario {
  id: number
  username: string
  email: string
  password_hash: string
  nombre_completo: string
  rol: "admin" | "supervisor" | "empleado"
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string
}

export interface Parte {
  id: number
  codigo: string
  nombre: string
  categoria: "electrica" | "motor" | "transmision" | "frenos" | "suspension"
  marca: string
  modelo_compatible?: string
  precio: number | string
  stock: number | string
  stock_minimo: number | string
  ubicacion?: string
  proveedor?: string
  descripcion?: string
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
  registro_id?: number
  datos_anteriores?: any
  datos_nuevos?: any
  ip_address?: string
  user_agent?: string
  fecha_accion: string
}

export interface Sesion {
  id: number
  usuario_id: number
  token: string
  fecha_inicio: string
  fecha_expiracion: string
  activa: boolean
  ip_address?: string
  user_agent?: string
}
