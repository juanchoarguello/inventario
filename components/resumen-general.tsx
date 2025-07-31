import { AlertTriangle, Package, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Part {
  id: number
  codigo: string
  nombre: string
  categoria: string
  marca: string
  modelo_compatible: string
  precio: number
  stock: number
  stock_minimo: number
  ubicacion: string
  proveedor: string
}

interface ResumenGeneralProps {
  parts: Part[]
}

export function ResumenGeneral({ parts }: ResumenGeneralProps) {
  const totalPartes = parts.length
  const valorTotal = parts.reduce((sum, part) => sum + Number(part.precio) * Number(part.stock), 0)

  const partesStockBajo = parts.filter((part) => {
    const stock = Number(part.stock)
    const stockMinimo = Number(part.stock_minimo)
    return stock <= stockMinimo
  })

  const partesElectricas = parts.filter((part) => part.categoria === "electrica").length
  const partesMotor = parts.filter((part) => part.categoria === "motor").length
  const partesFrenos = parts.filter((part) => part.categoria === "frenos").length

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      electrica: "Eléctricas",
      motor: "Motor",
      frenos: "Frenos",
      suspension: "Suspensión",
      transmision: "Transmisión",
    }
    return labels[categoria as keyof typeof labels] || categoria
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Resumen General</h2>
        <p className="text-gray-600">Vista general del inventario de partes automotrices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Partes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartes}</div>
            <p className="text-xs text-muted-foreground">
              {partesElectricas} eléctricas, {partesMotor} motor, {partesFrenos} frenos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${valorTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor total del inventario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{partesStockBajo.length}</div>
            <p className="text-xs text-muted-foreground">Partes que necesitan reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalPartes > 0
                ? (parts.reduce((sum, part) => sum + Number(part.precio), 0) / totalPartes).toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })
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
                {partesStockBajo.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partesStockBajo.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-4xl mb-2">✅</div>
                  <p className="text-green-700 font-medium">¡Excelente!</p>
                  <p className="text-gray-500 text-sm">Todas las partes tienen stock suficiente</p>
                </div>
              ) : (
                partesStockBajo.map((part) => {
                  const stock = Number(part.stock)
                  const stockMinimo = Number(part.stock_minimo)

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
                        <p className="text-xs text-gray-500">Ubicación: {part.ubicacion || "Sin ubicación"}</p>
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
                            ? "Sin existencias"
                            : stock < stockMinimo
                              ? `Faltan ${stockMinimo - stock} unidades`
                              : "En el límite mínimo"}
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
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <span>Partes Más Valiosas</span>
            </CardTitle>
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
                      <p className="text-xs text-gray-500">Categoría: {getCategoriaLabel(part.categoria)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        $
                        {(Number(part.precio) * Number(part.stock)).toLocaleString("es-CO", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {part.stock} × ${Number(part.precio).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
