"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Filter,
  DollarSign,
  Box,
  Loader2,
} from "lucide-react"
import type { AuthUser, Parte, CreateParteData } from "@/lib/types"

interface InventoryViewProps {
  user: AuthUser
}

const categorias = [
  "Motor",
  "Transmisión",
  "Frenos",
  "Suspensión",
  "Eléctrico",
  "Carrocería",
  "Filtros",
  "Aceites",
  "Neumáticos",
  "Otros",
]

const getCategoryColor = (categoria: string) => {
  const colors: Record<string, string> = {
    Motor: "bg-red-100 text-red-800 border-red-200",
    Transmisión: "bg-blue-100 text-blue-800 border-blue-200",
    Frenos: "bg-orange-100 text-orange-800 border-orange-200",
    Suspensión: "bg-purple-100 text-purple-800 border-purple-200",
    Eléctrico: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Carrocería: "bg-green-100 text-green-800 border-green-200",
    Filtros: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Aceites: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Neumáticos: "bg-gray-100 text-gray-800 border-gray-200",
    Otros: "bg-pink-100 text-pink-800 border-pink-200",
  }
  return colors[categoria] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function InventoryView({ user }: InventoryViewProps) {
  const [partes, setPartes] = useState<Parte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingParte, setEditingParte] = useState<Parte | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateParteData>({
    nombre: "",
    descripcion: "",
    codigo: "",
    categoria: "",
    marca: "",
    modelo_compatible: "",
    stock: 0,
    stock_minimo: 0,
    precio: 0,
    proveedor: "",
    ubicacion: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadPartes()
  }, [])

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("")
        setError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const loadPartes = async () => {
    try {
      const response = await fetch("/api/partes", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setPartes(data)
      } else {
        setError("Error al cargar el inventario")
      }
    } catch (error) {
      console.error("Error loading partes:", error)
      setError("Error al cargar el inventario")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError("")
    setSuccess("")

    try {
      const url = editingParte ? `/api/partes/${editingParte.id}` : "/api/partes"
      const method = editingParte ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        const mensaje = editingParte ? "Parte actualizada exitosamente" : "Parte creada exitosamente"
        setSuccess(mensaje)
        setShowCreateDialog(false)
        setEditingParte(null)
        resetForm()

        // Recargar la lista inmediatamente
        await loadPartes()
      } else {
        setError(data.error || "Error al procesar la solicitud")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Error de conexión con el servidor")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (parte: Parte) => {
    setEditingParte(parte)
    setFormData({
      nombre: parte.nombre,
      descripcion: parte.descripcion || "",
      codigo: parte.codigo,
      categoria: parte.categoria,
      marca: parte.marca || "",
      modelo_compatible: parte.modelo_compatible || "",
      stock: parte.stock,
      stock_minimo: parte.stock_minimo,
      precio: parte.precio,
      proveedor: parte.proveedor || "",
      ubicacion: parte.ubicacion || "",
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`)) return

    setDeletingId(id)
    setError("")
    setSuccess("")

    try {
      console.log(`Frontend: Intentando eliminar parte con ID: ${id}`)

      const response = await fetch(`/api/partes/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      console.log(`Frontend: Respuesta del servidor:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json()
      console.log(`Frontend: Datos de respuesta:`, data)

      if (response.ok) {
        setSuccess(`"${nombre}" eliminada exitosamente`)
        console.log(`Frontend: Eliminación exitosa, recargando lista...`)

        // Recargar la lista inmediatamente
        await loadPartes()
      } else {
        console.error(`Frontend: Error del servidor:`, data)
        setError(data.error || "Error al eliminar la parte")
      }
    } catch (error) {
      console.error("Frontend: Error deleting parte:", error)
      setError("Error de conexión con el servidor")
    } finally {
      setDeletingId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      codigo: "",
      categoria: "",
      marca: "",
      modelo_compatible: "",
      stock: 0,
      stock_minimo: 0,
      precio: 0,
      proveedor: "",
      ubicacion: "",
    })
  }

  const filteredPartes = partes.filter((parte) => {
    const matchesSearch =
      parte.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || parte.categoria === selectedCategory

    return matchesSearch && matchesCategory
  })

  const stockBajoCount = partes.filter((p) => p.stock <= p.stock_minimo).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Administra las partes y componentes del sistema</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              onClick={() => {
                setEditingParte(null)
                resetForm()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Parte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingParte ? "Editar Parte" : "Crear Nueva Parte"}</DialogTitle>
              <DialogDescription>
                {editingParte ? "Modifica los datos de la parte" : "Ingresa los datos de la nueva parte"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    disabled={formLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo_compatible">Modelo Compatible</Label>
                  <Input
                    id="modelo_compatible"
                    value={formData.modelo_compatible}
                    onChange={(e) => setFormData({ ...formData, modelo_compatible: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Actual *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: Number.parseInt(e.target.value) || 0 })}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number.parseFloat(e.target.value) || 0 })}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  disabled={formLoading}
                  placeholder="Ej: Estante A1, Bodega 2, etc."
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setEditingParte(null)
                    resetForm()
                  }}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingParte ? "Actualizando..." : "Creando..."}
                    </>
                  ) : editingParte ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Partes</p>
                <p className="text-3xl font-bold text-blue-900">{partes.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Stock Bajo</p>
                <p className="text-3xl font-bold text-red-900">{stockBajoCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Valor Total</p>
                <p className="text-3xl font-bold text-green-900">
                  ${partes.reduce((sum, p) => sum + p.stock * p.precio, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, código, marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartes.map((parte) => (
          <Card key={parte.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{parte.nombre}</CardTitle>
                  <Badge className={`${getCategoryColor(parte.categoria)} text-xs`}>{parte.categoria}</Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(parte)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    title="Editar parte"
                    disabled={deletingId === parte.id}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(parte.id, parte.nombre)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                    title="Eliminar parte"
                    disabled={deletingId === parte.id}
                  >
                    {deletingId === parte.id ? (
                      <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Código:</span>
                  <span className="font-mono text-sm font-medium">{parte.codigo}</span>
                </div>

                {parte.marca && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marca:</span>
                    <span className="text-sm font-medium">{parte.marca}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-bold ${
                        parte.stock <= parte.stock_minimo ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {parte.stock}
                    </span>
                    {parte.stock <= parte.stock_minimo && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="text-sm font-bold text-green-600">${parte.precio.toLocaleString()}</span>
                </div>

                {parte.ubicacion && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ubicación:</span>
                    <span className="text-sm">{parte.ubicacion}</span>
                  </div>
                )}

                {parte.descripcion && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2">{parte.descripcion}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartes.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron partes</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando tu primera parte al inventario"}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Parte
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
