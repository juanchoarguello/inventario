export type ErrorType = "VALIDATION" | "AUTHENTICATION" | "AUTHORIZATION" | "DATABASE" | "NETWORK" | "SERVER" | "CLIENT"

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  field?: string
  code?: string
  details?: Record<string, unknown>
}

export interface ErrorResponse {
  error: string
  details?: string
}

export class CustomError extends Error {
  public type: ErrorType
  public userMessage: string
  public field?: string
  public code?: string
  public details?: Record<string, unknown>

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    field?: string,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "CustomError"
    this.type = type
    this.userMessage = userMessage
    this.field = field
    this.code = code
    this.details = details
  }
}

// Mensajes de error predefinidos
export const ErrorMessages = {
  // Validación
  REQUIRED_FIELD: (field: string): AppError => ({
    type: "VALIDATION",
    message: `Field ${field} is required`,
    userMessage: `El campo ${field} es obligatorio`,
    field,
  }),

  INVALID_EMAIL: {
    type: "VALIDATION" as ErrorType,
    message: "Invalid email format",
    userMessage: "El formato del email no es válido",
    field: "email",
  },

  WEAK_PASSWORD: {
    type: "VALIDATION" as ErrorType,
    message: "Password is too weak",
    userMessage: "La contraseña debe tener al menos 6 caracteres",
    field: "password",
  },

  PASSWORDS_DONT_MATCH: {
    type: "VALIDATION" as ErrorType,
    message: "Passwords do not match",
    userMessage: "Las contraseñas no coinciden",
    field: "confirmPassword",
  },

  // Autenticación
  INVALID_CREDENTIALS: {
    type: "AUTHENTICATION" as ErrorType,
    message: "Invalid credentials",
    userMessage: "Usuario o contraseña incorrectos",
  },

  TOKEN_EXPIRED: {
    type: "AUTHENTICATION" as ErrorType,
    message: "Token has expired",
    userMessage: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
  },

  TOKEN_INVALID: {
    type: "AUTHENTICATION" as ErrorType,
    message: "Invalid token",
    userMessage: "Token de acceso inválido",
  },

  // Autorización
  INSUFFICIENT_PERMISSIONS: {
    type: "AUTHORIZATION" as ErrorType,
    message: "Insufficient permissions",
    userMessage: "No tienes permisos para realizar esta acción",
  },

  // Base de datos
  DUPLICATE_ENTRY: (field: string): AppError => ({
    type: "DATABASE",
    message: `Duplicate entry for ${field}`,
    userMessage: `Ya existe un registro con este ${field}`,
    field,
  }),

  DATABASE_CONNECTION_ERROR: {
    type: "DATABASE" as ErrorType,
    message: "Database connection failed",
    userMessage: "Error de conexión con la base de datos",
  },

  RECORD_NOT_FOUND: {
    type: "DATABASE" as ErrorType,
    message: "Record not found",
    userMessage: "El registro solicitado no fue encontrado",
  },

  // Red
  NETWORK_ERROR: {
    type: "NETWORK" as ErrorType,
    message: "Network error",
    userMessage: "Error de conexión. Verifica tu conexión a internet",
  },

  // Servidor
  SERVER_ERROR: {
    type: "SERVER" as ErrorType,
    message: "Internal server error",
    userMessage: "Error interno del servidor. Intenta nuevamente más tarde",
  },
}

// Funciones de validación
export function validateRequired(data: Record<string, unknown>, fields: string[]): AppError[] {
  const errors: AppError[] = []

  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].toString().trim())) {
      errors.push(ErrorMessages.REQUIRED_FIELD(field))
    }
  }

  return errors
}

export function validateEmail(email: string): AppError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return ErrorMessages.INVALID_EMAIL
  }
  return null
}

export function validatePassword(password: string): AppError | null {
  if (password.length < 6) {
    return ErrorMessages.WEAK_PASSWORD
  }
  return null
}

export function validatePasswordMatch(password: string, confirmPassword: string): AppError | null {
  if (password !== confirmPassword) {
    return ErrorMessages.PASSWORDS_DONT_MATCH
  }
  return null
}

// Manejar errores de base de datos
export function handleDatabaseError(error: { code?: string; constraint?: string }): AppError {
  switch (error.code) {
    case "23505": // Unique violation
      if (error.constraint?.includes("username")) {
        return ErrorMessages.DUPLICATE_ENTRY("usuario")
      }
      if (error.constraint?.includes("email")) {
        return ErrorMessages.DUPLICATE_ENTRY("email")
      }
      return ErrorMessages.DUPLICATE_ENTRY("valor")

    case "23503": // Foreign key violation
      return {
        type: "DATABASE",
        message: "Foreign key constraint violation",
        userMessage: "No se puede completar la operación debido a referencias de datos",
      }

    case "23502": // Not null violation
      return {
        type: "DATABASE",
        message: "Required field missing",
        userMessage: "Faltan campos obligatorios",
      }

    default:
      return ErrorMessages.DATABASE_CONNECTION_ERROR
  }
}

// Crear respuesta de error para APIs
export function createErrorResponse(message: string, status = 500) {
  return Response.json({ error: message }, { status })
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return Response.json(data, { status })
}

// Función para registrar errores
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}]` : ""

  console.error(`${timestamp} ${contextStr} Error:`, error)

  if (error instanceof Error) {
    console.error("Stack trace:", error.stack)
  }
}

export function handleError(error: unknown): ErrorResponse {
  console.error("Error occurred:", error)

  if (error instanceof Error) {
    return {
      error: "Error interno del servidor",
      details: error.message,
    }
  }

  return {
    error: "Error desconocido del servidor",
  }
}
