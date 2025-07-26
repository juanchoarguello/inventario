"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react"
import type { Usuario } from "@/lib/database"
import { CrearUsuarioDialog } from "./crear-usuario-dialog"
import { EditarUsuarioDialog } from "./editar-usuario-dialog"

interface GestionUsuariosProps {
  token: string
}

export function GestionUsuarios({ token }: GestionUsuariosProps) {
  const [users, setUsers] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error al cargar usuarios")
      }
    } catch (error) {
      setError("Error de conexión al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !currentStatus }),
      })

      if (response.ok) {
        await loadUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Error al actualizar usuario")
      }
    } catch (error) {
      alert("Error de conexión al actualizar usuario")
    }
  }

  const getRoleBadge = (rol: string) => {
    const config = {
      admin: { label: "ADMINISTRADOR", className: "bg-red-500 text-white" },
      supervisor: { label: "SUPERVISOR", className: "bg-blue-500 text-white" },
      empleado: { label: "EMPLEADO", className: "bg-green-500 text-white" },
    }
    return config[rol as keyof typeof config] || { label: rol.toUpperCase(), className: "bg-gray-500 text-white" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>
          <Button onClick={loadUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadUsers} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Cargar Usuarios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadUsers} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const roleBadge = getRoleBadge(user.rol)
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.nombre_completo}</CardTitle>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                  <Badge className={roleBadge.className}>{roleBadge.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <Badge variant={user.activo ? "default" : "destructive"} className="ml-2">
                      {user.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </p>
                  <p>
                    <strong>Creado:</strong> {new Date(user.fecha_creacion).toLocaleDateString("es-CO")}
                  </p>
                  {user.ultimo_acceso && (
                    <p>
                      <strong>Último acceso:</strong> {new Date(user.ultimo_acceso).toLocaleDateString("es-CO")}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setEditingUser(user)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant={user.activo ? "destructive" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleUserStatus(user.id, user.activo)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {user.activo ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No hay usuarios registrados</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Primer Usuario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CrearUsuarioDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onUserCreated={loadUsers}
        token={token}
      />

      <EditarUsuarioDialog
        user={editingUser}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setEditingUser(null)
        }}
        onUserUpdated={loadUsers}
        token={token}
      />
    </div>
  )
}
