"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Package, Plus, Users, History, Home } from "lucide-react"
import type { Usuario } from "@/lib/database"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  user: Usuario
}

export function Sidebar({ activeView, setActiveView, user }: SidebarProps) {
  const menuItems = [
    {
      id: "resumen",
      label: "Resumen General",
      icon: Home,
      roles: ["admin", "supervisor", "empleado"],
    },
    {
      id: "inventario",
      label: "Inventario",
      icon: Package,
      roles: ["admin", "supervisor", "empleado"],
    },
    {
      id: "agregar-parte",
      label: "Agregar Parte",
      icon: Plus,
      roles: ["admin", "supervisor", "empleado"],
    },
    {
      id: "usuarios",
      label: "Gestión de Usuarios",
      icon: Users,
      roles: ["admin"],
    },
    {
      id: "historial",
      label: "Historial de Actividades",
      icon: History,
      roles: ["admin", "supervisor"],
    },
  ]

  const visibleItems = menuItems.filter((item) => item.roles.includes(user.rol))

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">Inventario</span>
        </div>
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
