"use client"

import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Usuario } from "@/lib/database"

interface HeaderProps {
  user: Usuario
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const getRoleBadge = (rol: string) => {
    const colors = {
      admin: "bg-red-500",
      supervisor: "bg-blue-500",
      empleado: "bg-green-500",
    }
    return colors[rol as keyof typeof colors] || "bg-gray-500"
  }

  const getRoleLabel = (rol: string) => {
    const labels = {
      admin: "ADMINISTRADOR",
      supervisor: "SUPERVISOR",
      empleado: "EMPLEADO",
    }
    return labels[rol as keyof typeof labels] || rol.toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">AutoPartes Pro</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.nombre_completo}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">@{user.username}</p>
                <Badge className={`text-xs ${getRoleBadge(user.rol)} text-white`}>{getRoleLabel(user.rol)}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout} title="Cerrar Sesión">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
