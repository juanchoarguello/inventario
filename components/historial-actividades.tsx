"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, RefreshCw } from "lucide-react"
import type { HistorialAccion } from "@/lib/database"

interface HistorialActividadesProps {
  token: string
}

interface HistorialConUsuario extends HistorialAccion {
  nombre_completo: string
  username: string
}

export function HistorialActividades({ token }: HistorialActividadesProps) {
  const [history, setHistory] = useState<HistorialConUsuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/historial", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const historyData = await response.json()
        setHistory(historyData)
      }
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (accion: string) => {
    const config = {
      CREATE: { label: "CREAR", className: "bg-green-500 text-white" },
      UPDATE: { label: "ACTUALIZAR", className: "bg-blue-500 text-white" },
      DELETE: { label: "ELIMINAR", className: "bg-red-500 text-white" },
      LOGIN: { label: "INICIAR SESIÓN", className: "bg-purple-500 text-white" },
      LOGOUT: { label: "CERRAR SESIÓN", className: "bg-gray-500 text-white" },
    }
    return config[accion as keyof typeof config] || { label: accion, className: "bg-gray-500 text-white" }
  }

  const getTableLabel = (tabla: string) => {
    const labels = {
      usuarios: "Usuarios",
      partes: "Partes",
      sesiones: "Sesiones",
    }
    return labels[tabla as keyof typeof labels] || tabla
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Historial de Actividades</h2>
          <p className="text-gray-600">Registro de todas las actividades del sistema</p>
        </div>
        <Button onClick={loadHistory} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Actividades Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividades registradas</p>
            ) : (
              history.map((item) => {
                const actionBadge = getActionBadge(item.accion)
                return (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge className={actionBadge.className}>{actionBadge.label}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {item.nombre_completo} ({item.username})
                        </p>
                        <p className="text-xs text-gray-500">{new Date(item.fecha_accion).toLocaleString("es-CO")}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {actionBadge.label} en {getTableLabel(item.tabla_afectada)}
                        {item.registro_id && ` (ID: ${item.registro_id})`}
                      </p>
                      {item.ip_address && <p className="text-xs text-gray-500">IP: {item.ip_address}</p>}
                      {(item.datos_anteriores || item.datos_nuevos) && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">Ver detalles</summary>
                          <div className="mt-2 text-xs bg-white p-2 rounded border">
                            {item.datos_anteriores && (
                              <div>
                                <strong>Datos anteriores:</strong>
                                <pre className="mt-1 text-xs overflow-x-auto">
                                  {JSON.stringify(item.datos_anteriores, null, 2)}
                                </pre>
                              </div>
                            )}
                            {item.datos_nuevos && (
                              <div className="mt-2">
                                <strong>Datos nuevos:</strong>
                                <pre className="mt-1 text-xs overflow-x-auto">
                                  {JSON.stringify(item.datos_nuevos, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
