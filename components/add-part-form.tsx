"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ErrorDisplay, FieldError, useErrorHandler } from "./error-display"
import type { AppError } from "@/lib/error-handler"
import { FormHelp } from "./form-help"

interface PartData {
  codigo: string
  nombre: string
  categoria: string
  marca: string
  modelo: string
  precio: number
  stock: number
  stockMinimo: number
  ubicacion: string
  proveedor: string
}

interface AddPartFormProps {
  onAddPart: (part: PartData) => Promise<{ success: boolean; error?: string }>
}

export function AddPartForm({ onAddPart }: AddPartFormProps) {
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

  const [error, setError] = useState<AppError | null>(null)
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
        setError({
          type: "VALIDATION",
          message: result.error || "Error al agregar parte",
          userMessage: result.error || "Error al agregar la parte. Verifica los datos e intenta nuevamente.",
        })
      }
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumericChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "")
    setFormData((prev) => ({ ...prev, [field]: numericValue }))

    if (error?.field === field) {
      setError(null)
    }
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
                  className={error?.field === "precio" ? "border-red-500" : ""}
                />
                <FieldError error={error} field="precio" />
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
                  className={error?.field === "stock" ? "border-red-500" : ""}
                />
                <FieldError error={error} field="stock" />
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
                  className={error?.field === "stockMinimo" ? "border-red-500" : ""}
                />
                <FieldError error={error} field="stockMinimo" />
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
                  setError(null)
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
                Cancelar
              </Button>
            </div>
          </form>
          {error && !error.field && (
            <div className="mt-4">
              <ErrorDisplay error={error} onRetry={() => setError(null)} />
            </div>
          )}
        </CardContent>
      </Card>
      <FormHelp />
    </div>
  )
}
