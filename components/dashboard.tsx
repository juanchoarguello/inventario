import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Part {
  id: number
  codigo: string
  nombre: string
  categoria: string
  marca: string
  modelo: string
  precio: number
  stock: number
  stockMinimo: number
  ubicacion: string
  proveedor: string
}

interface DashboardProps {
  parts: Part[]
}

export function Dashboard({ parts }: DashboardProps) {
  const totalParts = parts.length
  const totalValue = parts.reduce((sum, part) => sum + Number(part.precio) * Number(part.stock), 0)

  // 🔧 LÓGICA CORREGIDA: Stock bajo cuando stock <= stock_minimo
  const lowStockParts = parts.filter((part) => {
    const stock = Number(part.stock)
    const stockMinimo = Number(part.stockMinimo || part.stock_minimo || 0)

    console.log(`📊 Verificando ${part.nombre}:`, {
      stock: stock,
      stockMinimo: stockMinimo,
      esBajo: stock <= stockMinimo,
    })

    return stock <= stockMinimo
  })

  console.log(`🚨 Partes con stock bajo encontradas: ${lowStockParts.length}`)
  lowStockParts.forEach((part) => {
    console.log(`   - ${part.nombre}: Stock=${part.stock}, Mínimo=${part.stockMinimo || part.stock_minimo}`)
  })

  const electricParts = parts.filter((part) => part.categoria === "electrica").length
  const motorParts = parts.filter((part) => part.categoria === "motor").length
  const frenosParts = parts.filter((part) => part.categoria === "frenos").length
  const suspensionParts = parts.filter((part) => part.categoria === "suspension").length
  const transmisionParts = parts.filter((part) => part.categoria === "transmision").length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen del inventario de partes automotrices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Partes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParts}</div>
            <p className="text-xs text-muted-foreground">
              {electricParts} eléctricas, {motorParts} motor, {frenosParts} frenos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor total del inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockParts.length}</div>
            <p className="text-xs text-muted-foreground">Partes con stock ≤ mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Precio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalParts > 0
                ? (parts.reduce((sum, part) => sum + Number(part.precio), 0) / totalParts).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Precio promedio por parte</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Alertas de Stock Bajo</span>
              <Badge variant="destructive" className="bg-red-500 text-white">
                {lowStockParts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockParts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-4xl mb-2">✅</div>
                  <p className="text-green-700 font-medium">¡Excelente!</p>
                  <p className="text-gray-500 text-sm">No hay partes con stock bajo</p>
                </div>
              ) : (
                lowStockParts.map((part) => {
                  const stock = Number(part.stock)
                  const stockMinimo = Number(part.stockMinimo || part.stock_minimo || 0)

                  return (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{part.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {part.codigo} - {part.marca}
                        </p>
                        <p className="text-xs text-gray-500">Ubicación: {part.ubicacion || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="destructive" className="bg-red-500 text-white">
                            {stock} unidades
                          </Badge>
                          {stock === 0 && <Badge className="bg-red-700 text-white text-xs">¡AGOTADO!</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">Mínimo: {stockMinimo}</p>
                        <p className="text-xs text-red-600 font-medium">
                          {stock === 0
                            ? "Sin stock"
                            : stock < stockMinimo
                              ? `Faltan ${stockMinimo - stock}`
                              : "En el límite"}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partes Más Valiosas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parts
                .sort((a, b) => Number(b.precio) * Number(b.stock) - Number(a.precio) * Number(a.stock))
                .slice(0, 5)
                .map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{part.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {part.codigo} - {part.marca}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${(Number(part.precio) * Number(part.stock)).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {part.stock} × ${Number(part.precio).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 SECCIÓN DE DEBUG - Temporal para verificar */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">🔍 Debug - Estado del Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parts.slice(0, 6).map((part) => {
              const stock = Number(part.stock)
              const stockMinimo = Number(part.stockMinimo || part.stock_minimo || 0)
              const esBajo = stock <= stockMinimo

              return (
                <div key={part.id} className="bg-white p-3 rounded border">
                  <p className="font-medium text-sm">{part.nombre}</p>
                  <div className="text-xs space-y-1 mt-2">
                    <p>
                      Stock: <strong>{stock}</strong>
                    </p>
                    <p>
                      Mínimo: <strong>{stockMinimo}</strong>
                    </p>
                    <p>
                      ¿Es bajo?:{" "}
                      <strong className={esBajo ? "text-red-600" : "text-green-600"}>{esBajo ? "SÍ" : "NO"}</strong>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
