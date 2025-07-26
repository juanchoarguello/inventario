export enum ErrorType {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  DATABASE = "DATABASE",
  NETWORK = "NETWORK",
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE = "DUPLICATE",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  field?: string
  code?: string
  details?: any
}

export class CustomError extends Error {
  public type: ErrorType
  public userMessage: string
  public field?: string
  public code?: string
  public details?: any

  constructor(type: ErrorType, message: string, userMessage: string, field?: string, code?: string, details?: any) {
    super(message)
    this.type = type
    this.userMessage = userMessage
    this.field = field
    this.code = code
    this.details = details
    this.name = "CustomError"
  }
}

// Errores predefinidos comunes
export const ErrorMessages = {
  // Validación
  REQUIRED_FIELD: (field: string) => ({
    type: ErrorType.VALIDATION,
    message: `Field ${field} is required`,
    userMessage: `El campo ${field} es obligatorio`,
    field,
  }),

  INVALID_EMAIL: {
    type: ErrorType.VALIDATION,
    message: "Invalid email format",
    userMessage: "El formato del email no es válido. Ejemplo: usuario@dominio.com",
    field: "email",
  },

  PASSWORD_TOO_SHORT: {
    type: ErrorType.VALIDATION,
    message: "Password too short",
    userMessage: "La contraseña debe tener al menos 6 caracteres",
    field: "password",
  },

  PASSWORDS_DONT_MATCH: {
    type: ErrorType.VALIDATION,
    message: "Passwords don't match",
    userMessage: "Las contraseñas no coinciden. Verifica que ambas sean iguales",
    field: "confirmPassword",
  },

  // Autenticación
  INVALID_CREDENTIALS: {
    type: ErrorType.AUTHENTICATION,
    message: "Invalid credentials",
    userMessage: "Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente",
  },

  TOKEN_EXPIRED: {
    type: ErrorType.AUTHENTICATION,
    message: "Token expired",
    userMessage: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
  },

  TOKEN_INVALID: {
    type: ErrorType.AUTHENTICATION,
    message: "Invalid token",
    userMessage: "Token de acceso inválido. Inicia sesión nuevamente",
  },

  // Autorización
  INSUFFICIENT_PERMISSIONS: {
    type: ErrorType.AUTHORIZATION,
    message: "Insufficient permissions",
    userMessage: "No tienes permisos para realizar esta acción. Contacta al administrador",
  },

  // Base de datos
  DATABASE_CONNECTION: {
    type: ErrorType.DATABASE,
    message: "Database connection failed",
    userMessage: "Error de conexión con la base de datos. Intenta nuevamente en unos momentos",
  },

  DUPLICATE_ENTRY: (field: string) => ({
    type: ErrorType.DUPLICATE,
    message: `Duplicate entry for ${field}`,
    userMessage: `Ya existe un registro con este ${field}. Usa un valor diferente`,
    field,
  }),

  RECORD_NOT_FOUND: (entity: string) => ({
    type: ErrorType.NOT_FOUND,
    message: `${entity} not found`,
    userMessage: `No se encontró el ${entity} solicitado`,
  }),

  // Red
  NETWORK_ERROR: {
    type: ErrorType.NETWORK,
    message: "Network error",
    userMessage: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente",
  },

  // Servidor
  SERVER_ERROR: {
    type: ErrorType.SERVER,
    message: "Internal server error",
    userMessage: "Error interno del servidor. Intenta nuevamente en unos momentos",
  },
}

// Función para crear errores personalizados
export function createError(
  type: ErrorType,
  message: string,
  userMessage: string,
  field?: string,
  code?: string,
  details?: any,
): CustomError {
  return new CustomError(type, message, userMessage, field, code, details)
}

// Función para manejar errores de la base de datos
export function handleDatabaseError(error: any): CustomError {
  console.error("Database Error:", error)

  // Error de conexión
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return createError(
      ErrorType.DATABASE,
      error.message,
      "No se puede conectar a la base de datos. Verifica la configuración de DATABASE_URL",
      undefined,
      error.code,
    )
  }

  // Error de duplicado (PostgreSQL)
  if (error.code === "23505") {
    const field = error.detail?.includes("username") ? "usuario" : error.detail?.includes("email") ? "email" : "campo"
    return createError(
      ErrorType.DUPLICATE,
      error.message,
      `Ya existe un registro con este ${field}. Usa un valor diferente`,
      field,
      error.code,
    )
  }

  // Error de campo nulo (PostgreSQL)
  if (error.code === "23502") {
    const columnMatch = error.message.match(/column "([^"]+)"/)
    const column = columnMatch ? columnMatch[1] : "campo"

    const fieldNames: Record<string, string> = {
      stock_minimo: "Stock Mínimo",
      stock: "Stock Actual",
      precio: "Precio",
      codigo: "Código de Parte",
      nombre: "Nombre de la Parte",
      categoria: "Categoría",
      marca: "Marca",
    }

    const friendlyName = fieldNames[column] || column

    return createError(
      ErrorType.VALIDATION,
      error.message,
      `El campo "${friendlyName}" es obligatorio y no puede estar vacío. Por favor, ingresa un valor válido.`,
      column,
      error.code,
    )
  }

  // Error de clave foránea
  if (error.code === "23503") {
    return createError(
      ErrorType.VALIDATION,
      error.message,
      "Error de referencia en la base de datos. Verifica que todos los datos relacionados existan",
      undefined,
      error.code,
    )
  }

  // Error de sintaxis SQL
  if (error.code === "42601") {
    return createError(
      ErrorType.SERVER,
      error.message,
      "Error en la consulta de base de datos. Contacta al administrador",
      undefined,
      error.code,
    )
  }

  // Error genérico de base de datos
  return createError(
    ErrorType.DATABASE,
    error.message,
    "Error en la base de datos. Intenta nuevamente en unos momentos",
    undefined,
    error.code,
  )
}

// Función para manejar errores de validación
export function validateRequired(data: Record<string, any>, requiredFields: string[]): CustomError[] {
  const errors: CustomError[] = []

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
      errors.push(createError(ErrorType.VALIDATION, `${field} is required`, `El campo ${field} es obligatorio`, field))
    }
  }

  return errors
}

// Función para validar email
export function validateEmail(email: string): CustomError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return createError(
      ErrorType.VALIDATION,
      "Invalid email format",
      "El formato del email no es válido. Ejemplo: usuario@dominio.com",
      "email",
    )
  }
  return null
}

// Función para validar contraseña
export function validatePassword(password: string): CustomError | null {
  if (password.length < 6) {
    return createError(
      ErrorType.VALIDATION,
      "Password too short",
      "La contraseña debe tener al menos 6 caracteres",
      "password",
    )
  }
  return null
}

// Al final del archivo, agregar si no están:
