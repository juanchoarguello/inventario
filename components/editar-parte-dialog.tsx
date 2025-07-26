"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Part {
  id: number
  codigo: string
  nombre: string
  categoria: string
  marca: string
  modelo_compatible: string
  precio: number
  stock: number
  stock_minimo: number
  ubicacion: string
  proveedor: string
}

interface EditarParteDialogProps {
  part: Part
  onSave: (part: Part) => void
  onClose: () => void
}

export function EditarParteDialog({ part, onSave, onClose }: EditarParteDialogProps) {
  const [formData, setFormData] = useState({
    codigo: part.codigo || "",
    nombre: part.nombre || "",
    categoria: part.categoria || "",
    marca: part.marca || "",
    modelo: part.modelo_compatible || "",
    precio: (part.precio ?? 0).toString(),
    stock: (part.stock ?? 0).toString(),
    stockMinimo: (part.stock_minimo ?? 0).toString(),
    ubicacion: part.ubicacion || "",
    proveedor: part.proveedor || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const precio = formData.precio === "" ? 0 : Number.parseFloat(formData.precio)
    const stock = formData.stock === "" ? 0 : Number.parseInt(formData.stock)
    const stockMinimo = formData.stockMinimo === "" ? 0 : Number.parseInt(formData.stockMinimo)

    const updatedPart = {
      ...part,
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      categoria: formData.categoria,
      marca: formData.marca.trim(),
      modelo_compatible: formData.modelo.trim(),
      precio: precio,
      stock: stock,
      stock_minimo: stockMinimo,
      ubicacion: formData.ubicacion.trim(),
      proveedor: formData.proveedor.trim(),
    }

    onSave(updatedPart)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNumericChange = (field: string, value: string) => {
    let cleanValue = value

    if (field === "precio") {
      cleanValue = value.replace(/[^0-9.]/g, "")
    } else {
      cleanValue = value.replace(/[^0-9]/g, "")
    }

    setFormData((prev) => ({ ...prev, [field]: cleanValue }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Parte - {part.nombre}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código de Parte *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleChange("codigo", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue />
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
                required
              />
            </div>
            <div>
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) => handleChange("proveedor", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="modelo">Modelo Compatible</Label>
            <Textarea
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleChange("modelo", e.target.value)}
              rows={2}
              placeholder="Ej: Toyota Corolla 2015-2020, Honda Civic 2016-2021"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">💰 Información de Inventario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precio" className="text-blue-700">
                  Precio ($) *
                </Label>
                <Input
                  id="precio"
                  type="text"
                  inputMode="decimal"
                  value={formData.precio}
                  onChange={(e) => handleNumericChange("precio", e.target.value)}
                  placeholder="0.00"
                  className="bg-white"
                />
                <p className="text-xs text-blue-600 mt-1">Ejemplo: 25.50</p>
              </div>
              <div>
                <Label htmlFor="stock" className="text-blue-700">
                  Stock Actual *
                </Label>
                <Input
                  id="stock"
                  type="text"
                  inputMode="numeric"
                  value={formData.stock}
                  onChange={(e) => handleNumericChange("stock", e.target.value)}
                  placeholder="0"
                  className="bg-white"
                />
                <p className="text-xs text-blue-600 mt-1">Cantidad disponible</p>
              </div>
              <div>
                <Label htmlFor="stockMinimo" className="text-blue-700">
                  Stock Mínimo *
                </Label>
                <Input
                  id="stockMinimo"
                  type="text"
                  inputMode="numeric"
                  value={formData.stockMinimo}
                  onChange={(e) => handleNumericChange("stockMinimo", e.target.value)}
                  placeholder="0"
                  className="bg-white"
                />
                <p className="text-xs text-blue-600 mt-1">Alerta cuando llegue a este número</p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-sm text-gray-700">
                <strong>Vista previa:</strong> Stock: {formData.stock || "0"} | Mínimo: {formData.stockMinimo || "0"} |
                Precio: ${formData.precio || "0.00"}
              </p>
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
            <Button type="submit" className="flex-1">
              💾 Guardar Cambios
            </Button>
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
