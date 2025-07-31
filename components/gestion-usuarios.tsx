"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CrearUsuarioDialog } from "@/components/crear-usuario-dialog"
import { EditarUsuarioDialog } from "@/components/editar-usuario-dialog"
import { Search, Plus, Edit, Trash2, Users } from "lucide-react"

interface Usuario {
  id: number
  username: string
  nombre_completo: string
  email: string
  rol: string
  activo: boolean
  fecha_creacion: string
}

interface UserData {
  username: string
  password: string
  nombre_completo: string
  email: string
  rol: string
}

interface GestionUsuariosProps {
  token: string
}

export function GestionUsuarios({ token }: GestionUsuariosProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [error, setError] = useState("")

  const loadUsuarios = useCallback(async () => {
    try {
      const response = await fetch("/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
        setError("")
      } else {
        setError("Error al cargar usuarios")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadUsuarios()
  }, [loadUsuarios])

  const handleCreateUser = async (userData: UserData) => {
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUsuarios([...usuarios, data])
        setShowCreateDialog(false)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }

  const handleUpdateUser = async (userData: Usuario) => {
    try {
      const response = await fetch(`/api/usuarios/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUsuarios(usuarios.map((u) => (u.id === userData.id ? data : u)))
        setEditingUser(null)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return
    }

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUsuarios(usuarios.filter((u) => u.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || "Error al eliminar usuario")
      }
    } catch {
      setError("Error de conexión")
    }
  }

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "admin":
        return "bg-red-500 text-white"
      case "supervisor":
        return "bg-blue-500 text-white"
      case "empleado":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Administrador"
      case "supervisor":
        return "Supervisor"
      case "empleado":
        return "Empleado"
      default:
        return rol
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <p className="text-gray-600">Administra los usuarios del sistema</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Buscar usuarios..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{usuario.nombre_completo}</CardTitle>
                  <p className="text-sm text-gray-600">@{usuario.username}</p>
                </div>
                <Badge className={getRoleBadgeColor(usuario.rol)}>{getRoleLabel(usuario.rol)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Email:</span>
                <p className="text-gray-600">{usuario.email}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Estado:</span>
                <Badge
                  variant={usuario.activo ? "default" : "secondary"}
                  className={usuario.activo ? "bg-green-500 text-white ml-2" : "bg-gray-500 text-white ml-2"}
                >
                  {usuario.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">Creado:</span>
                <p className="text-gray-600">{new Date(usuario.fecha_creacion).toLocaleDateString("es-CO")}</p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingUser(usuario)} className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(usuario.id)} className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 text-lg mt-4">No se encontraron usuarios que coincidan con la búsqueda</p>
        </div>
      )}

      {showCreateDialog && <CrearUsuarioDialog onSave={handleCreateUser} onClose={() => setShowCreateDialog(false)} />}

      {editingUser && (
        <EditarUsuarioDialog user={editingUser} onSave={handleUpdateUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  )
}
