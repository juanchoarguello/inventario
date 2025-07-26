"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AgregarParteFormProps {
  onAddPart: (part: any) => Promise<{ success: boolean; error?: string }>
}

export function AgregarParteForm({ onAddPart }: AgregarParteFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    ubicacion: "",
    proveedor: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await onAddPart({
        ...formData,
        precio: Number.parseFloat(formData.precio) || 0,
        stock: Number.parseInt(formData.stock) || 0,
        stockMinimo: Number.parseInt(formData.stockMinimo) || 0,
      })

      if (result.success) {
        setFormData({
          codigo: "",
          nombre: "",
          categoria: "",
          marca: "",
          modelo: "",
          precio: "",
          stock: "",
          stockMinimo: "",
          ubicacion: "",
          proveedor: "",
        })
      } else {
        setError(result.error || "Error al agregar la parte")
      }
    } catch (err) {
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumericChange = (field: string, value: string) => {
    let numericValue = value
    if (field === "precio") {
      numericValue = value.replace(/[^0-9.]/g, "")
    } else {
      numericValue = value.replace(/[^0-9]/g, "")
    }
    setFormData((prev) => ({ ...prev, [field]: numericValue }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Agregar Nueva Parte</h2>
        <p className="text-gray-600">Registra una nueva parte en el inventario</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información de la Parte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código de Parte *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  placeholder="Ej: ALT001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
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
            </div>

            <div>
              <Label htmlFor="nombre">Nombre de la Parte *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Alternador 12V"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleChange("marca", e.target.value)}
                  placeholder="Ej: Bosch"
                  required
                />
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => handleChange("proveedor", e.target.value)}
                  placeholder="Ej: AutoPartes SA"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="modelo">Modelo Compatible</Label>
              <Textarea
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleChange("modelo", e.target.value)}
                placeholder="Ej: Toyota Corolla 2015-2020"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precio">Precio ($) *</Label>
                <Input
                  id="precio"
                  type="text"
                  inputMode="decimal"
                  value={formData.precio}
                  onChange={(e) => handleNumericChange("precio", e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Actual *</Label>
                <Input
                  id="stock"
                  type="text"
                  inputMode="numeric"
                  value={formData.stock}
                  onChange={(e) => handleNumericChange("stock", e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                <Input
                  id="stockMinimo"
                  type="text"
                  inputMode="numeric"
                  value={formData.stockMinimo}
                  onChange={(e) => handleNumericChange("stockMinimo", e.target.value)}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                placeholder="Ej: A-1-3"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Agregando..." : "Agregar Parte"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={loading}
                onClick={() => {
                  setError("")
                  setFormData({
                    codigo: "",
                    nombre: "",
                    categoria: "",
                    marca: "",
                    modelo: "",
                    precio: "",
                    stock: "",
                    stockMinimo: "",
                    ubicacion: "",
                    proveedor: "",
                  })
                }}
              >
                Limpiar Formulario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 Consejos para llenar el formulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-green-800 font-medium">
              ✅ Campos obligatorios: Código, Nombre, Categoría, Marca, Precio, Stock y Stock Mínimo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
