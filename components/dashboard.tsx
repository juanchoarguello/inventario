"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Box,
  Menu,
  X,
} from "lucide-react"
import type { AuthUser, DashboardStats } from "@/lib/types"
import { InventoryView } from "./inventory-view"
import { UsersView } from "./users-view"

interface DashboardProps {
  user: AuthUser
  onLogout: () => void
}

type ViewType = "dashboard" | "inventory" | "users" | "settings"

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (currentView === "dashboard") {
      loadStats()
    }
  }, [currentView])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "usuario"] },
    { id: "inventory", label: "Inventario", icon: Package, roles: ["admin", "usuario"] },
    { id: "users", label: "Usuarios", icon: Users, roles: ["admin"] },
    { id: "settings", label: "Configuración", icon: Settings, roles: ["admin"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.rol))

  const renderContent = () => {
    switch (currentView) {
      case "inventory":
        return <InventoryView user={user} />
      case "users":
        return user.rol === "admin" ? <UsersView user={user} /> : null
      case "settings":
        return user.rol === "admin" ? <div>Configuración (En desarrollo)</div> : null
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Bienvenido de vuelta, {user.nombre}</p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                {user.rol === "admin" ? "Administrador" : "Usuario"}
              </Badge>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Partes</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.totalPartes}</p>
                      </div>
                      <Box className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Stock Bajo</p>
                        <p className="text-3xl font-bold text-red-900">{stats.stockBajo}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Valor Total</p>
                        <p className="text-3xl font-bold text-green-900">${stats.valorInventario.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                {user.rol === "admin" && (
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Usuarios</p>
                          <p className="text-3xl font-bold text-purple-900">{stats.totalUsuarios}</p>
                        </div>
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Accesos Rápidos
                  </CardTitle>
                  <CardDescription>Funciones principales del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setCurrentView("inventory")}
                    className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Gestionar Inventario
                  </Button>
                  {user.rol === "admin" && (
                    <Button
                      onClick={() => setCurrentView("users")}
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Administrar Usuarios
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Información del Sistema</CardTitle>
                  <CardDescription>Detalles técnicos y contacto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Desarrollador:</strong> Juan Sebastian Arguello Lozano
                    </p>
                    <p>
                      <strong>Versión:</strong> 1.0.0
                    </p>
                    <p>
                      <strong>Soporte:</strong> +57 315 215 4826
                    </p>
                    <p>
                      <strong>Email:</strong> juan.arguello@sistemas.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mr-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Inventario</h2>
                <p className="text-sm text-gray-600">Sistema Pro</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewType)
                  setSidebarOpen(false)
                }}
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === item.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">{user.nombre.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">{renderContent()}</div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
