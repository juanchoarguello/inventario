"use client"

import { useState, useEffect, useCallback } from "react"
import { ResumenGeneral } from "@/components/resumen-general"
import { Inventario } from "@/components/inventario"
import { AgregarParteForm } from "@/components/agregar-parte-form"
import { GestionUsuarios } from "@/components/gestion-usuarios"
import { HistorialActividades } from "@/components/historial-actividades"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import type { Usuario, Parte } from "@/lib/database"

interface DashboardProps {
  user: Usuario
  token: string
  onLogout: () => void
}

export function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState("resumen")
  const [parts, setParts] = useState<Parte[]>([])
  const [loading, setLoading] = useState(true)

  const loadParts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/partes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const partsData = await response.json()
        setParts(Array.isArray(partsData) ? partsData : [])
      } else {
        console.error("Error loading parts:", response.statusText)
        setParts([])
      }
    } catch (error) {
      console.error("Error loading parts:", error)
      setParts([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadParts()
  }, [loadParts])

  const addPart = async (newPart: Record<string, unknown>) => {
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
        setParts((prevParts) => [...prevParts, data])
        setActiveView("inventario")
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || "Error al crear la parte",
        }
      }
    } catch (error) {
      console.error("Add part error:", error)
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
    } catch (error) {
      console.error("Update part error:", error)
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
        setParts((currentParts) => currentParts.filter((part) => part.id !== id))
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error }
      }
    } catch (error) {
      console.error("Delete part error:", error)
      return { success: false, error: "Error de conexión con el servidor" }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
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
