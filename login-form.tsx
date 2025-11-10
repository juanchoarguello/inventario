"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Phone,
  MessageCircle,
  GraduationCap,
  Code,
  Shield,
  Award,
  Building2,
  Mail,
  Globe,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react"
import Image from "next/image"
import type { Usuario } from "@/lib/types"

interface LoginFormProps {
  onLogin: (user: Usuario, token: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
      } else {
        setError(data.error || "Error de autenticación")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    window.open("https://wa.me/573187349421", "_blank")
  }

  const handlePhoneContact = () => {
    window.open("tel:+573152154826", "_blank")
  }

  const handleEmailContact = () => {
    window.open("mailto:juan.arguello@sistemas.com", "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
        <div className="w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
        <div className="w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Sistema de Inventario Empresarial
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plataforma integral de gestión desarrollada con tecnología de vanguardia
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Developer Profile Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Developer Card */}
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                        <Image
                          src="/tu-foto.png"
                          alt="Juan Sebastian Arguello Lozano"
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg">
                        <Code className="h-6 w-6" />
                      </div>
                      <div className="absolute -top-4 -left-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-lg shadow-lg">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                      <div className="mb-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Juan Sebastian Arguello Lozano</h2>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-1">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Ingeniero en Sistemas
                          </Badge>
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                            <Award className="h-3 w-3 mr-1" />
                            Desarrollador Senior
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center justify-center lg:justify-start">
                          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium">Pontificia Universidad Bolivariana</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start">
                          <Shield className="h-4 w-4 text-green-600 mr-2" />
                          <span>Especialista en Desarrollo de Software Empresarial</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start">
                          <Zap className="h-4 w-4 text-yellow-600 mr-2" />
                          <span>Arquitecto de Soluciones Tecnológicas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Seguridad Avanzada</h3>
                    </div>
                    <p className="text-gray-600">
                      Sistema con encriptación de datos y autenticación multi-nivel para máxima protección.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Alto Rendimiento</h3>
                    </div>
                    <p className="text-gray-600">
                      Optimizado para manejar grandes volúmenes de datos con respuesta instantánea.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center mr-4">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Acceso Remoto</h3>
                    </div>
                    <p className="text-gray-600">
                      Disponible 24/7 desde cualquier dispositivo con conexión a internet.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-xl flex items-center justify-center mr-4">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Soporte Premium</h3>
                    </div>
                    <p className="text-gray-600">
                      Asistencia técnica especializada y actualizaciones constantes incluidas.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Login Section */}
            <div className="space-y-6">
              {/* Login Form */}
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-t-lg p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">Acceso Seguro</CardTitle>
                    <CardDescription className="text-blue-100">Portal de autenticación empresarial</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Usuario Corporativo
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Ingrese su identificador"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
                        Contraseña Segura
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Ingrese su clave de acceso"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Autenticando...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-3 h-5 w-5" />
                          Acceder al Sistema
                        </>
                      )}
                    </Button>
                  </form>

                  <Separator className="my-6" />

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-center">Niveles de Autorización</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Badge variant="outline" className="justify-center py-2 border-blue-200 text-blue-800 bg-blue-50">
                        <Star className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                      <Badge
                        variant="outline"
                        className="justify-center py-2 border-green-200 text-green-800 bg-green-50"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Supervisor
                      </Badge>
                      <Badge
                        variant="outline"
                        className="justify-center py-2 border-orange-200 text-orange-800 bg-orange-50"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Empleado
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-3">
                      Credenciales asignadas por administración del sistema
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Soporte Técnico Especializado</h3>
                    <p className="text-blue-100 text-sm">Asistencia profesional disponible</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleWhatsAppContact}
                      variant="secondary"
                      className="w-full bg-green-600 hover:bg-green-700 text-white border-0 h-11 rounded-xl font-medium"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp: +57 315 215 4826
                    </Button>
                    <Button
                      onClick={handlePhoneContact}
                      variant="secondary"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 h-11 rounded-xl font-medium"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Llamada Directa
                    </Button>
                    <Button
                      onClick={handleEmailContact}
                      variant="secondary"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 h-11 rounded-xl font-medium"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Correo Corporativo
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-blue-100 text-center">⚡ Respuesta garantizada en menos de 2 horas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <Shield className="h-4 w-4" />
              <span>Sistema desarrollado con tecnología empresarial</span>
              <span>•</span>
              <span>© 2024 Juan Sebastian Arguello Lozano</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
