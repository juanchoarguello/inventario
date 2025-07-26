"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  XCircle,
  Shield,
  Database,
  Wifi,
  Server,
  RefreshCw,
  Home,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react"
import type { AppError, ErrorType } from "@/lib/error-handler"

interface ErrorDisplayProps {
  error: AppError | string
  onRetry?: () => void
  onGoHome?: () => void
  showDetails?: boolean
}

export function ErrorDisplay({ error, onRetry, onGoHome, showDetails = false }: ErrorDisplayProps) {
  // Si es un string, convertir a error básico
  const errorObj: AppError =
    typeof error === "string"
      ? {
          type: "CLIENT" as ErrorType,
          message: error,
          userMessage: error,
        }
      : error

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case "VALIDATION":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "AUTHENTICATION":
        return <Shield className="h-5 w-5 text-red-500" />
      case "AUTHORIZATION":
        return <Shield className="h-5 w-5 text-orange-500" />
      case "DATABASE":
        return <Database className="h-5 w-5 text-purple-500" />
      case "NETWORK":
        return <Wifi className="h-5 w-5 text-blue-500" />
      case "SERVER":
        return <Server className="h-5 w-5 text-red-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getErrorVariant = (type: ErrorType) => {
    switch (type) {
      case "VALIDATION":
        return "default"
      case "AUTHENTICATION":
      case "AUTHORIZATION":
      case "SERVER":
        return "destructive"
      default:
        return "default"
    }
  }

  const getErrorSolutions = (type: ErrorType) => {
    switch (type) {
      case "VALIDATION":
        return [
          "Verifica que todos los campos obligatorios estén completos",
          "Revisa el formato de los datos ingresados",
          "Asegúrate de que las contraseñas coincidan",
        ]
      case "AUTHENTICATION":
        return [
          "Verifica tu usuario y contraseña",
          "Si olvidaste tu contraseña, usa 'Recuperar Contraseña'",
          "Asegúrate de que tu cuenta esté activa",
        ]
      case "AUTHORIZATION":
        return [
          "Contacta al administrador para obtener permisos",
          "Verifica que tengas el rol correcto",
          "Intenta cerrar sesión e iniciar nuevamente",
        ]
      case "DATABASE":
        return [
          "Verifica la variable DATABASE_URL en .env.local",
          "Asegúrate de que la base de datos esté funcionando",
          "Ejecuta los scripts SQL necesarios",
        ]
      case "NETWORK":
        return [
          "Verifica tu conexión a internet",
          "Intenta recargar la página",
          "Verifica que el servidor esté funcionando",
        ]
      case "SERVER":
        return [
          "Intenta nuevamente en unos momentos",
          "Verifica los logs del servidor",
          "Contacta al administrador si persiste",
        ]
      default:
        return ["Intenta recargar la página", "Contacta al soporte técnico si persiste"]
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          {getErrorIcon(errorObj.type)}
          <div>
            <CardTitle className="text-lg">¡Oops! Algo salió mal</CardTitle>
            <Badge variant={getErrorVariant(errorObj.type) as any} className="mt-1">
              {errorObj.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={getErrorVariant(errorObj.type) as any}>
          <AlertDescription className="text-base">{errorObj.userMessage}</AlertDescription>
        </Alert>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 ¿Cómo solucionarlo?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {getErrorSolutions(errorObj.type).map((solution, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {showDetails && errorObj.details && (
          <details className="bg-gray-50 p-3 rounded border">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">Ver detalles técnicos</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(errorObj.details, null, 2)}
            </pre>
          </details>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1 min-w-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar Nuevamente
            </Button>
          )}
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="flex-1 min-w-0 bg-transparent">
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          )}
        </div>

        <div className="border-t pt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda adicional?</p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="mailto:admin@autoparts.com" className="text-blue-600 hover:underline flex items-center">
              <Mail className="mr-1 h-3 w-3" />
              Email Soporte
            </a>
            <a href="tel:+1234567890" className="text-blue-600 hover:underline flex items-center">
              <Phone className="mr-1 h-3 w-3" />
              Llamar
            </a>
            <a
              href="https://docs.autoparts.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Documentación
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para errores inline en formularios
interface FieldErrorProps {
  error?: AppError | string
  field?: string
}

export function FieldError({ error, field }: FieldErrorProps) {
  if (!error) return null

  const errorObj: AppError =
    typeof error === "string"
      ? {
          type: "VALIDATION" as ErrorType,
          message: error,
          userMessage: error,
          field,
        }
      : error

  // Solo mostrar si el error es para este campo o no tiene campo específico
  if (errorObj.field && field && errorObj.field !== field) return null

  return (
    <div className="flex items-center space-x-2 mt-1">
      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-sm text-red-600">{errorObj.userMessage}</span>
    </div>
  )
}

// Hook para manejar errores
export function useErrorHandler() {
  const handleError = (error: any): AppError => {
    console.error("Error caught:", error)

    // Si ya es un CustomError, devolverlo como AppError
    if (error.name === "CustomError") {
      return {
        type: error.type,
        message: error.message,
        userMessage: error.userMessage,
        field: error.field,
        code: error.code,
        details: error.details,
      }
    }

    // Error de red
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        type: "NETWORK" as ErrorType,
        message: error.message,
        userMessage: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente",
      }
    }

    // Error genérico
    return {
      type: "CLIENT" as ErrorType,
      message: error.message || "Unknown error",
      userMessage: error.userMessage || "Ha ocurrido un error inesperado. Intenta nuevamente",
      details: error,
    }
  }

  return { handleError }
}
