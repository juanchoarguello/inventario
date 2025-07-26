"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { ResumenGeneral } from "@/components/resumen-general"
import { Inventario } from "@/components/inventario"
import { AgregarParteForm } from "@/components/agregar-parte-form"
import { GestionUsuarios } from "@/components/gestion-usuarios"
import { HistorialActividades } from "@/components/historial-actividades"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import type { Usuario, Parte } from "@/lib/database"

export default function Home() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeView, setActiveView] = useState("resumen")
  const [parts, setParts] = useState<Parte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      const savedToken = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")

      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        await loadParts(savedToken)
      }
    } catch (err) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }

  const loadParts = async (authToken: string) => {
    try {
      const response = await fetch("/api/partes", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const partsData = await response.json()
        setParts(partsData)
      } else {
        throw new Error("Error loading parts")
      }
    } catch (err: any) {
      console.error("Error loading parts:", err)
    }
  }

  const handleLogin = async (username: string, password: string) => {
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
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        await loadParts(data.token)
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || "Error de autenticación",
        }
      }
    } catch (err: any) {
      return {
        success: false,
        error: "Error de conexión con el servidor",
      }
    }
  }

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setParts([])
      setActiveView("resumen")
    }
  }

  const addPart = async (newPart: any) => {
    try {
      const response = await fetch("/api/partes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPart),
      })

      const data = await response.json()

      if (response.ok) {
        const createdPart = data
        setParts([...parts, createdPart])
        setActiveView("inventario")
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || "Error al crear la parte",
        }
      }
    } catch (err: any) {
      return {
        success: false,
        error: "Error de conexión con el servidor",
      }
    }
  }

  const updatePart = async (updatedPart: Parte) => {
    try {
      const response = await fetch(`/api/partes/${updatedPart.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPart),
      })

      if (response.ok) {
        const updated = await response.json()
        setParts((currentParts) => currentParts.map((part) => (part.id === updated.id ? updated : part)))
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error }
      }
    } catch (err: any) {
      return { success: false, error: "Error de conexión con el servidor" }
    }
  }

  const deletePart = async (id: number) => {
    try {
      const response = await fetch(`/api/partes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setParts(parts.filter((part) => part.id !== id))
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error }
      }
    } catch (err: any) {
      return { success: false, error: "Error de conexión con el servidor" }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  if (!user || !token) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 p-6 overflow-auto">
          {activeView === "resumen" && <ResumenGeneral parts={parts} />}
          {activeView === "inventario" && (
            <Inventario parts={parts} updatePart={updatePart} deletePart={deletePart} userRole={user.rol} />
          )}
          {activeView === "agregar-parte" && <AgregarParteForm onAddPart={addPart} />}
          {activeView === "usuarios" && user.rol === "admin" && <GestionUsuarios token={token} />}
          {activeView === "historial" && (user.rol === "admin" || user.rol === "supervisor") && (
            <HistorialActividades token={token} />
          )}
        </main>
      </div>
    </div>
  )
}
