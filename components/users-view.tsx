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
import { Users, Plus, Search, Edit, Trash2, Shield, User, CheckCircle, Loader2, Calendar, Mail } from "lucide-react"
import type { AuthUser, Usuario, CreateUserData } from "@/lib/types"

interface UsersViewProps {
  user: AuthUser
}

export function UsersView({ user }: UsersViewProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios")
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error("Error loading usuarios:", error)
      setError("Error al cargar los usuarios")
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
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios"
      const method = editingUser ? "PUT" : "POST"

      const submitData = editingUser && !formData.password ? { ...formData, password: undefined } : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(editingUser ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente")
        setShowCreateDialog(false)
        setEditingUser(null)
        resetForm()
        loadUsuarios()
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

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "", // No mostrar contraseña actual
      rol: usuario.rol,
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (id === user.id) {
      setError("No puedes eliminar tu propio usuario")
      return
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Usuario eliminado exitosamente")
        loadUsuarios()
      } else {
        const data = await response.json()
        setError(data.error || "Error al eliminar el usuario")
      }
    } catch (error) {
      console.error("Error deleting usuario:", error)
      setError("Error de conexión con el servidor")
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol: "usuario",
    })
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800"
              onClick={() => {
                setEditingUser(null)
                resetForm()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Modifica los datos del usuario" : "Ingresa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña {editingUser ? "(dejar vacío para mantener actual)" : "*"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  disabled={formLoading}
                  placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: "admin" | "usuario") => setFormData({ ...formData, rol: value })}
                  disabled={formLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
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
                    setEditingUser(null)
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
                      {editingUser ? "Actualizando..." : "Creando..."}
                    </>
                  ) : editingUser ? (
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-purple-900">{usuarios.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Administradores</p>
                <p className="text-3xl font-bold text-blue-900">{usuarios.filter((u) => u.rol === "admin").length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-900">{usuarios.filter((u) => u.activo).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.map((usuario) => (
          <Card key={usuario.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      usuario.rol === "admin"
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                        : "bg-gradient-to-br from-gray-400 to-gray-600"
                    }`}
                  >
                    {usuario.rol === "admin" ? (
                      <Shield className="h-6 w-6 text-white" />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{usuario.nombre}</CardTitle>
                    <Badge
                      className={`${
                        usuario.rol === "admin"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      } text-xs mt-1`}
                    >
                      {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(usuario)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  {usuario.id !== user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(usuario.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{usuario.email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Creado: {formatDate(usuario.fecha_creacion)}</span>
                </div>

                {usuario.ultimo_acceso && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-600">Último acceso: {formatDate(usuario.ultimo_acceso)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge
                      className={`${
                        usuario.activo
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      } text-xs`}
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Intenta ajustar el término de búsqueda" : "Comienza agregando usuarios al sistema"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Usuario
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
