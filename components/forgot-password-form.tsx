"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wrench, ArrowLeft, Mail } from "lucide-react"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Email Enviado</span>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">¡Revisa tu email!</h3>
              <p className="text-sm text-blue-700">
                Si el email <strong>{email}</strong> existe en nuestro sistema, recibirás un enlace para restablecer tu
                contraseña.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 Revisa tu bandeja de entrada</p>
              <p>🔍 Si no lo encuentras, revisa la carpeta de spam</p>
              <p>⏰ El enlace expira en 1 hora</p>
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
          <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
          <p className="text-gray-600">Ingresa tu email para recibir un enlace de recuperación</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
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
