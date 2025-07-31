import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export interface Usuario {
  id: number
  username: string
  email: string
  nombre_completo: string
  rol: "admin" | "supervisor" | "empleado"
  activo: boolean
  fecha_creacion: string
}

export interface Parte {
  id: number
  numero_parte: string
  nombre: string
  descripcion: string
  categoria: string
  ubicacion: string
  cantidad_stock: number
  stock_minimo: number
  precio_unitario: number
  proveedor: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface HistorialActividad {
  id: number
  usuario_id: number
  accion: string
  tabla_afectada: string
  registro_id: number
  detalles: string
  fecha_creacion: string
  usuario_nombre?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
