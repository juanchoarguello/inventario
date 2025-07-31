"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus } from "lucide-react"

interface AgregarParteFormProps {
  onAddPart: (part: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
}

export function AgregarParteForm({ onAddPart }: AgregarParteFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
    modelo_compatible: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    ubicacion: "",
    proveedor: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await onAddPart({
        ...formData,
        precio: Number.parseFloat(formData.precio) || 0,
        stock: Number.parseInt(formData.stock) || 0,
        stockMinimo: Number.parseInt(formData.stockMinimo) || 0,
      })

      if (result.success) {
        setSuccess(true)
        setFormData({
          codigo: "",
          nombre: "",
          categoria: "",
          marca: "",
          modelo_compatible: "",
          precio: "",
          stock: "",
          stockMinimo: "",
          ubicacion: "",
          proveedor: "",
          descripcion: "",
        })
      } else {
        setError(result.error || "Error al crear la parte")
      }
    } catch (error) {
      console.error("Error adding part:", error)
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Agregar Nueva Parte</h2>
        <p className="text-gray-600">Registra una nueva parte en el inventario</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Información de la Parte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  placeholder="Ej: ELE001"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Batería 12V 60Ah"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleInputChange("categoria", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrica">Partes Eléctricas</SelectItem>
                    <SelectItem value="motor">Partes de Motor</SelectItem>
                    <SelectItem value="frenos">Sistema de Frenos</SelectItem>
                    <SelectItem value="suspension">Suspensión</SelectItem>
                    <SelectItem value="transmision">Transmisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  placeholder="Ej: Bosch"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo_compatible">Modelo Compatible</Label>
              <Input
                id="modelo_compatible"
                value={formData.modelo_compatible}
                onChange={(e) => handleInputChange("modelo_compatible", e.target.value)}
                placeholder="Ej: Toyota Corolla 2020"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio ($) *</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => handleInputChange("precio", e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => handleInputChange("stockMinimo", e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                  placeholder="Ej: Estante A1"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange("proveedor", e.target.value)}
                  placeholder="Nombre del proveedor"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder="Descripción detallada de la parte"
                rows={3}
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ¡Parte agregada exitosamente! Se ha redirigido al inventario.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    codigo: "",
                    nombre: "",
                    categoria: "",
                    marca: "",
                    modelo_compatible: "",
                    precio: "",
                    stock: "",
                    stockMinimo: "",
                    ubicacion: "",
                    proveedor: "",
                    descripcion: "",
                  })
                  setError("")
                  setSuccess(false)
                }}
                disabled={loading}
              >
                Limpiar Formulario
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Parte
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
