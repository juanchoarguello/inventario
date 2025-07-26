"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, ArrowLeft, CheckCircle } from "lucide-react"

interface RegisterFormProps {
  onBack: () => void
}

export function RegisterForm({ onBack }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    rol: "empleado",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setSuccess(true)
      } else {
        const error = await response.json()
        setError(error.error)
      }
    } catch (error) {
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">¡Registro Exitoso!</span>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">¡Cuenta creada exitosamente!</h3>
              <p className="text-sm text-green-700">
                Hemos enviado un email de verificación a <strong>{formData.email}</strong>
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 Revisa tu bandeja de entrada</p>
              <p>🔍 Si no lo encuentras, revisa la carpeta de spam</p>
              <p>⏰ El enlace expira en 24 horas</p>
            </div>

            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AutoParts Pro</span>
          </div>
          <CardTitle className="text-xl">Crear Cuenta</CardTitle>
          <p className="text-gray-600">Regístrate en el sistema de inventario</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                />
              </div>
              <div>
                <Label htmlFor="rol">Rol *</Label>
                <Select value={formData.rol} onValueChange={(value) => handleChange("rol", value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="juan@ejemplo.com"
                required
                disabled={loading}
              />
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
              />
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
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={onBack}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
