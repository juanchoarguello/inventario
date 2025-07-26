"use client"

import { useState } from "react"
import { Edit, Trash2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditPartDialog } from "@/components/edit-part-dialog"

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

interface InventoryProps {
  parts: Part[]
  updatePart: (part: Part) => Promise<{ success: boolean; error?: string }>
  deletePart: (id: number) => Promise<{ success: boolean; error?: string }>
  userRole: string
}

export function Inventory({ parts, updatePart, deletePart, userRole }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingPart, setEditingPart] = useState<Part | null>(null)

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.marca.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || part.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (stock: number, stockMinimo: number) => {
    // 🔧 LÓGICA CORREGIDA: Usar <= para detectar stock bajo
    if (stock <= stockMinimo) {
      if (stock === 0) {
        return {
          label: "AGOTADO",
          variant: "destructive" as const,
          className: "bg-red-700 text-white animate-pulse",
        }
      }
      return {
        label: "Bajo",
        variant: "destructive" as const,
        className: "bg-red-500 text-white",
      }
    }
    if (stock <= stockMinimo * 1.5) {
      return {
        label: "Medio",
        variant: "secondary" as const,
        className: "bg-yellow-500 text-white",
      }
    }
    return {
      label: "Alto",
      variant: "default" as const,
      className: "bg-green-500 text-white",
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Inventario</h2>
        <p className="text-gray-600">Gestión completa de partes automotrices</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Buscar por nombre, código o marca..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="electrica">Partes Eléctricas</SelectItem>
            <SelectItem value="motor">Partes de Motor</SelectItem>
            <SelectItem value="frenos">Frenos</SelectItem>
            <SelectItem value="suspension">Suspensión</SelectItem>
            <SelectItem value="transmision">Transmisión</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part) => {
          const stockStatus = getStockStatus(Number(part.stock), Number(part.stock_minimo))
          return (
            <Card key={part.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{part.nombre}</CardTitle>
                    <p className="text-sm text-gray-600">{part.codigo}</p>
                  </div>
                  <Badge
                    className={
                      part.categoria === "electrica"
                        ? "bg-yellow-500 text-white"
                        : part.categoria === "motor"
                          ? "bg-red-500 text-white"
                          : part.categoria === "frenos"
                            ? "bg-purple-500 text-white"
                            : part.categoria === "suspension"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                    }
                  >
                    {part.categoria === "electrica"
                      ? "Eléctrica"
                      : part.categoria === "motor"
                        ? "Motor"
                        : part.categoria === "frenos"
                          ? "Frenos"
                          : part.categoria === "suspension"
                            ? "Suspensión"
                            : part.categoria === "transmision"
                              ? "Transmisión"
                              : part.categoria}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Marca:</span>
                    <p className="text-gray-600">{part.marca}</p>
                  </div>
                  <div>
                    <span className="font-medium">Precio:</span>
                    <p className="text-gray-600">${Number(part.precio).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">{part.stock}</span>
                      <Badge className={stockStatus.className}>{stockStatus.label}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Ubicación:</span>
                    <p className="text-gray-600">{part.ubicacion || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-sm">Stock Mínimo:</span>
                  <p className="text-gray-600 text-sm">{part.stock_minimo}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">Modelo:</span>
                  <p className="text-gray-600 text-sm">{part.modelo_compatible || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">Proveedor:</span>
                  <p className="text-gray-600 text-sm">{part.proveedor || "N/A"}</p>
                </div>

                {/* 🔍 Debug info temporal */}
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <p>
                    Debug: Stock={part.stock}, Mín={part.stock_minimo}, Bajo=
                    {Number(part.stock) <= Number(part.stock_minimo) ? "SÍ" : "NO"}
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingPart(part)} className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  {(userRole === "admin" || userRole === "supervisor") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm("¿Estás seguro de que quieres eliminar esta parte?")) {
                          const result = await deletePart(part.id)
                          if (!result.success) {
                            alert(result.error)
                          }
                        }
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron partes que coincidan con los filtros</p>
        </div>
      )}

      {editingPart && (
        <EditPartDialog
          part={editingPart}
          onSave={async (updatedPart: Part) => {
            const result = await updatePart(updatedPart)
            if (!result.success) {
              alert(result.error || "Error al actualizar la parte")
            }
          }}
          onClose={() => setEditingPart(null)}
        />
      )}
    </div>
  )
}
