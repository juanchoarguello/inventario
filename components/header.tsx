"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import type { Usuario } from "@/lib/database"

interface HeaderProps {
  user: Usuario
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      onLogout()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Sistema de Inventario de Autopartes</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user.nombre_completo}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
