"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FieldError, useErrorHandler } from "./error-display"
import type { AppError } from "@/lib/error-handler"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
  token: string
}

export function CreateUserDialog({ isOpen, onClose, onUserCreated, token }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    rol: "empleado",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const { handleError } = useErrorHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar que las contraseñas coincidan
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

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nombre_completo: formData.nombre_completo,
          rol: formData.rol,
        }),
      })

      if (response.ok) {
        // Resetear formulario
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          nombre_completo: "",
          rol: "empleado",
        })
        onUserCreated()
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo si existe
    if (error?.field === field) {
      setError(null)
    }
  }

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      nombre_completo: "",
      rol: "empleado",
    })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuario *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="usuario123"
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
              placeholder="usuario@ejemplo.com"
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
              placeholder="Juan Pérez"
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

          <div>
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
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
              required
              disabled={loading}
              minLength={6}
              className={error?.field === "confirmPassword" ? "border-red-500" : ""}
            />
            <FieldError error={error} field="confirmPassword" />
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
              {loading ? "Creando..." : "Crear Usuario"}
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
