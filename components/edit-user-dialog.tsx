"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldError, useErrorHandler } from "./error-display"
import type { AppError } from "@/lib/error-handler"
import type { Usuario } from "@/lib/database"

interface UpdateData {
  username: string
  email: string
  nombre_completo: string
  rol: string
  activo: boolean
  password?: string
}

interface EditUserDialogProps {
  user: Usuario | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
  token: string
}

export function EditUserDialog({ user, isOpen, onClose, onUserUpdated, token }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    nombre_completo: "",
    rol: "empleado",
    activo: true,
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [changePassword, setChangePassword] = useState(false)
  const { handleError } = useErrorHandler()

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        nombre_completo: user.nombre_completo || "",
        rol: user.rol || "empleado",
        activo: user.activo !== undefined ? user.activo : true,
        password: "",
        confirmPassword: "",
      })
      setChangePassword(false)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    if (changePassword) {
      if (formData.password !== formData.confirmPassword) {
        setError({
          type: "VALIDATION",
          message: "Passwords don't match",
          userMessage: "Las contraseñas no coinciden",
          field: "confirmPassword",
        })
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError({
          type: "VALIDATION",
          message: "Password too short",
          userMessage: "La contraseña debe tener al menos 6 caracteres",
          field: "password",
        })
        setLoading(false)
        return
      }
    }

    try {
      const updateData: UpdateData = {
        username: formData.username,
        email: formData.email,
        nombre_completo: formData.nombre_completo,
        rol: formData.rol,
        activo: formData.activo,
      }

      if (changePassword && formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        onUserUpdated()
        onClose()
      } else {
        const errorData = await response.json()
        setError({
          type: errorData.type || "VALIDATION",
          message: errorData.error,
          userMessage: errorData.error,
          field: errorData.field,
        })
      }
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error?.field === field) {
      setError(null)
    }
  }

  const handleClose = () => {
    setError(null)
    setChangePassword(false)
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuario *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
              disabled={loading}
              className={error?.field === "username" ? "border-red-500" : ""}
            />
            <FieldError error={error} field="username" />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              disabled={loading}
              className={error?.field === "email" ? "border-red-500" : ""}
            />
            <FieldError error={error} field="email" />
          </div>

          <div>
            <Label htmlFor="nombre_completo">Nombre Completo *</Label>
            <Input
              id="nombre_completo"
              type="text"
              value={formData.nombre_completo}
              onChange={(e) => handleChange("nombre_completo", e.target.value)}
              required
              disabled={loading}
              className={error?.field === "nombre_completo" ? "border-red-500" : ""}
            />
            <FieldError error={error} field="nombre_completo" />
          </div>

          <div>
            <Label htmlFor="rol">Rol *</Label>
            <Select value={formData.rol} onValueChange={(value) => handleChange("rol", value)} disabled={loading}>
              <SelectTrigger className={error?.field === "rol" ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <FieldError error={error} field="rol" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => handleChange("activo", checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="activo">Usuario activo</Label>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="changePassword"
                checked={changePassword}
                onCheckedChange={setChangePassword}
                disabled={loading}
              />
              <Label htmlFor="changePassword">Cambiar contraseña</Label>
            </div>

            {changePassword && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="password">Nueva Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required={changePassword}
                    disabled={loading}
                    minLength={6}
                    className={error?.field === "password" ? "border-red-500" : ""}
                  />
                  <FieldError error={error} field="password" />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Repite la contraseña"
                    required={changePassword}
                    disabled={loading}
                    minLength={6}
                    className={error?.field === "confirmPassword" ? "border-red-500" : ""}
                  />
                  <FieldError error={error} field="confirmPassword" />
                </div>
              </div>
            )}
          </div>

          {error && !error.field && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-sm">{error.userMessage}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
