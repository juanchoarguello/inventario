"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch {
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setError("Token de verificación no válido")
      setLoading(false)
    }
  }, [token, verifyEmail])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <CardTitle className="text-xl">Verificando Email...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Por favor espera mientras verificamos tu email.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-green-700">¡Email Verificado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700">Tu email ha sido verificado exitosamente.</p>
              <p className="text-sm text-green-600 mt-2">Ya puedes iniciar sesión en AutoParts Pro.</p>
            </div>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-xl text-red-700">Error de Verificación</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">El enlace puede haber expirado o ser inválido.</p>
          </div>
          <Button onClick={() => (window.location.href = "/")} className="w-full">
            Volver al Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
