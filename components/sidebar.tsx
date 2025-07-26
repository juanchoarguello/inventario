"use client"

import { BarChart3, Package, Plus, Users, History, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Usuario } from "@/lib/database"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  user: Usuario
}

export function Sidebar({ activeView, setActiveView, user }: SidebarProps) {
  const baseMenuItems = [
    { id: "resumen", label: "Resumen General", icon: BarChart3 },
    { id: "inventario", label: "Inventario", icon: Package },
    { id: "agregar-parte", label: "Agregar Parte", icon: Plus },
  ]

  const adminMenuItems = [
    { id: "usuarios", label: "Gestión de Usuarios", icon: Users },
    { id: "historial", label: "Historial de Actividades", icon: History },
  ]

  const supervisorMenuItems = [{ id: "historial", label: "Historial de Actividades", icon: History }]

  let menuItems = [...baseMenuItems]

  if (user.rol === "admin") {
    menuItems = [...menuItems, ...adminMenuItems]
  } else if (user.rol === "supervisor") {
    menuItems = [...menuItems, ...supervisorMenuItems]
  }

  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Wrench className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold">AutoPartes</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeView === item.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-4">CATEGORÍAS</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              <span>Partes Eléctricas</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="h-3 w-3 bg-red-400 rounded-full"></div>
              <span>Partes de Motor</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="h-3 w-3 bg-purple-400 rounded-full"></div>
              <span>Sistema de Frenos</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <span>Suspensión</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <span>Transmisión</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
