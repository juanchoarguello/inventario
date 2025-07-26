"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, CheckCircle, XCircle } from "lucide-react"

export function FormHelp() {
  return (
    <Card className="mt-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <HelpCircle className="h-5 w-5" />
          <span>Ayuda para llenar el formulario</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-800 mb-2">✅ Ejemplos de datos correctos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong>Código:</strong> ALT001, BAT002, MOT003
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Precio:</strong> 25.50, 120.00, 1500
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Stock:</strong> 10, 25, 100
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>Stock Mínimo:</strong> 5, 10, 20
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-red-800 mb-2">❌ Evita estos errores comunes:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Dejar campos obligatorios vacíos</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Usar letras en campos numéricos (precio, stock)</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Usar códigos que ya existen</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Poner números negativos en precio o stock</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">Campos obligatorios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white">
              Código
            </Badge>
            <Badge variant="outline" className="bg-white">
              Nombre
            </Badge>
            <Badge variant="outline" className="bg-white">
              Categoría
            </Badge>
            <Badge variant="outline" className="bg-white">
              Marca
            </Badge>
            <Badge variant="outline" className="bg-white">
              Precio
            </Badge>
            <Badge variant="outline" className="bg-white">
              Stock
            </Badge>
            <Badge variant="outline" className="bg-white">
              Stock Mínimo
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
