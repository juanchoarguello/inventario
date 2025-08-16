"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import type { AuthUser } from "@/lib/types"

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Incluir cookies
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Si no hay sesión activa, es normal - mostrar login
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: AuthUser) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Forzar logout local aunque falle la API
      setUser(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
