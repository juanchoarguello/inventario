"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, History, User, Calendar } from "lucide-react"

interface HistorialItem {
  id: number
  usuario_nombre: string
  accion: string
  tabla: string
  registro_id: number | null
  datos_anteriores: any
  datos_nuevos: any
  ip_address: string
  fecha_accion: string
}

interface HistorialActividadesProps {
  token: string
}

export function HistorialActividades({ token }: HistorialActividadesProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    try {
      const response = await fetch("/api/historial", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistorial(data)
        setError("")
      } else {
        setError("Error al cargar el historial")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const filteredHistorial = historial.filter(
    (item) =>
      item.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tabla.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAccionBadgeColor = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "bg-green-500 text-white"
      case "UPDATE":
        return "bg-blue-500 text-white"
      case "DELETE":
        return "bg-red-500 text-white"
      case "LOGIN":
        return "bg-purple-500 text-white"
      case "LOGOUT":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case "CREATE":
        return "Crear"
      case "UPDATE":
        return "Actualizar"
      case "DELETE":
        return "Eliminar"
      case "LOGIN":
        return "Iniciar Sesión"
      case "LOGOUT":
        return "Cerrar Sesión"
      default:
        return accion
    }
  }

  const getTablaLabel = (tabla: string) => {
    switch (tabla) {
      case "partes":
        return "Partes"
      case "usuarios":
        return "Usuarios"
      case "auth":
        return "Autenticación"
      default:
        return tabla
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Historial de Actividades</h2>
        <p className="text-gray-600">Registro de todas las actividades del sistema</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="search"
          placeholder="Buscar en el historial..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {filteredHistorial.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <History className="h-5 w-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-lg">
                      {getAccionLabel(item.accion)} en {getTablaLabel(item.tabla)}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{item.usuario_nombre}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getAccionBadgeColor(item.accion)}>{getAccionLabel(item.accion)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Fecha y Hora:</span>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(item.fecha_accion).toLocaleString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Dirección IP:</span>
                  <p className="text-gray-600">{item.ip_address || "No disponible"}</p>
                </div>
              </div>

              {item.registro_id && (
                <div className="text-sm">
                  <span className="font-medium">ID del Registro:</span>
                  <p className="text-gray-600">#{item.registro_id}</p>
                </div>
              )}

              {item.datos_nuevos && (
                <div className="text-sm">
                  <span className="font-medium">Datos Modificados:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(item.datos_nuevos, null, 2)}</pre>
                  </div>
                </div>
              )}

              {item.datos_anteriores && (
                <div className="text-sm">
                  <span className="font-medium">Datos Anteriores:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(item.datos_anteriores, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistorial.length === 0 && (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 text-lg mt-4">No se encontraron actividades que coincidan con la búsqueda</p>
        </div>
      )}
    </div>
  )
}
