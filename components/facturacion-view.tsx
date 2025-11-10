"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Receipt, Plus, Search, Trash2, Send, CheckCircle, 
  AlertTriangle, Loader2, ShoppingCart, Package, DollarSign, X, Edit
} from "lucide-react"
import type { AuthUser } from "@/lib/types"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FacturacionViewProps {
  user: AuthUser
}

interface ParteItem {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  categoria: string
  marca?: string
  modelo_compatible?: string
  stock: number
  stock_minimo: number
  precio_compra?: number
  precio_venta?: number
  ubicacion?: string
}

interface LineaFactura {
  orden: number
  parte_id: number | null
  codigo_parte: string
  nombre_parte: string
  descripcion_parte?: string
  categoria?: string
  marca?: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
  es_nueva_parte: boolean
  stock_original?: number
}

interface Cliente {
  id: number
  codigo: string
  nombre: string
  documento?: string
  telefono?: string
  email?: string
}

interface Proveedor {
  id: number
  codigo: string
  nombre: string
  documento?: string
  telefono?: string
  email?: string
}

const categorias = [
  "Motor", "Transmisión", "Frenos", "Suspensión", "Eléctrico",
  "Carrocería", "Filtros", "Aceites", "Neumáticos", "Otros"
]

export function FacturacionView({ user }: FacturacionViewProps) {
  const [tipoFactura, setTipoFactura] = useState<'VENTA' | 'COMPRA'>('VENTA')
  const [lineas, setLineas] = useState<LineaFactura[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ParteItem[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedParte, setSelectedParte] = useState<ParteItem | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  
  // Cliente/Proveedor
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [selectedProveedorId, setSelectedProveedorId] = useState<number | null>(null)
  
  // Datos de la parte (nueva o existente)
  const [parteForm, setParteForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'Otros',
    marca: '',
    modelo_compatible: '',
    stock: 0,
    stock_minimo: 0,
    ubicacion: ''
  })
  
  // Línea actual en edición
  const [lineaActual, setLineaActual] = useState({
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0
  })
  
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [metodo_pago, setMetodoPago] = useState('')
  const [notas, setNotas] = useState('')
  
  // Refs para navegación por teclado
  const codigoInputRef = useRef<HTMLInputElement>(null)
  const cantidadInputRef = useRef<HTMLInputElement>(null)
  const precioInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    loadClientesYProveedores()
  }, [])
  
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const debounce = setTimeout(() => {
        buscarPartes(searchQuery)
      }, 300)
      return () => clearTimeout(debounce)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery])
  
  const loadClientesYProveedores = async () => {
    try {
      const [clientesRes, proveedoresRes] = await Promise.all([
        fetch('/api/clientes', { credentials: 'include' }),
        fetch('/api/proveedores', { credentials: 'include' })
      ])
      
      if (clientesRes.ok) {
        const data = await clientesRes.json()
        setClientes(data)
        if (data.length > 0) setSelectedClienteId(data[0].id)
      }
      
      if (proveedoresRes.ok) {
        const data = await proveedoresRes.json()
        setProveedores(data)
        if (data.length > 0) setSelectedProveedorId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading clientes/proveedores:', error)
    }
  }
  
  const buscarPartes = async (query: string) => {
    try {
      const response = await fetch(`/api/partes/buscar?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error('Error buscando partes:', error)
    }
  }
  
  const seleccionarParte = (parte: ParteItem) => {
    setSelectedParte(parte)
    setSearchQuery(parte.codigo)
    setShowSearchResults(false)
    setModoEdicion(false)
    
    // Llenar formulario con datos de la parte
    setParteForm({
      codigo: parte.codigo,
      nombre: parte.nombre,
      descripcion: parte.descripcion || '',
      categoria: parte.categoria || 'Otros',
      marca: parte.marca || '',
      modelo_compatible: parte.modelo_compatible || '',
      stock: parte.stock,
      stock_minimo: parte.stock_minimo,
      ubicacion: parte.ubicacion || ''
    })
    
    // Pre-llenar precio según tipo de factura
    const precio = tipoFactura === 'VENTA' 
      ? (parte.precio_venta || 0)
      : (parte.precio_compra || parte.precio_venta || 0)
    
    setLineaActual({
      cantidad: 1,
      precio_unitario: precio,
      descuento: 0
    })
    
    setTimeout(() => cantidadInputRef.current?.focus(), 100)
  }
  
  const crearParteTemporal = () => {
    if (!searchQuery.trim()) {
      setError('Escribe un código o nombre para la nueva parte')
      return
    }
    
    // Generar código automático si no hay código
    const codigoGenerado = searchQuery.toUpperCase().replace(/\s+/g, '-').substring(0, 20)
    
    setSelectedParte(null)
    setModoEdicion(true)
    
    setParteForm({
      codigo: codigoGenerado,
      nombre: searchQuery,
      descripcion: '',
      categoria: 'Otros',
      marca: '',
      modelo_compatible: '',
      stock: 0,
      stock_minimo: 0,
      ubicacion: ''
    })
    
    setLineaActual({
      cantidad: 1,
      precio_unitario: 0,
      descuento: 0
    })
    
    setShowSearchResults(false)
    setError('')
  }
  
  const agregarLinea = () => {
    // Validaciones básicas
    if (!parteForm.codigo.trim() || !parteForm.nombre.trim()) {
      setError('El código y nombre son obligatorios')
      return
    }
    
    if (lineaActual.cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }
    
    if (lineaActual.precio_unitario < 0) {
      setError('El precio no puede ser negativo')
      return
    }
    
    // Verificar stock en ventas (solo para partes existentes)
    if (tipoFactura === 'VENTA' && selectedParte && lineaActual.cantidad > selectedParte.stock) {
      setError(`Stock insuficiente. Disponible: ${selectedParte.stock}`)
      return
    }
    
    const subtotal = (lineaActual.cantidad * lineaActual.precio_unitario) - lineaActual.descuento
    
    const nuevaLinea: LineaFactura = {
      orden: lineas.length + 1,
      parte_id: selectedParte?.id || null,
      codigo_parte: parteForm.codigo,
      nombre_parte: parteForm.nombre,
      descripcion_parte: parteForm.descripcion,
      categoria: parteForm.categoria,
      marca: parteForm.marca,
      cantidad: lineaActual.cantidad,
      precio_unitario: lineaActual.precio_unitario,
      descuento: lineaActual.descuento,
      subtotal: subtotal,
      es_nueva_parte: !selectedParte,
      stock_original: selectedParte?.stock
    }
    
    setLineas([...lineas, nuevaLinea])
    
    // Reset
    resetFormulario()
  }
  
  const resetFormulario = () => {
    setSelectedParte(null)
    setSearchQuery('')
    setModoEdicion(false)
    setParteForm({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: 'Otros',
      marca: '',
      modelo_compatible: '',
      stock: 0,
      stock_minimo: 0,
      ubicacion: ''
    })
    setLineaActual({ cantidad: 1, precio_unitario: 0, descuento: 0 })
    setError('')
    setTimeout(() => codigoInputRef.current?.focus(), 100)
  }
  
  const eliminarLinea = (orden: number) => {
    setLineas(lineas.filter(l => l.orden !== orden))
  }
  
  const calcularTotales = () => {
    const subtotal = lineas.reduce((sum, l) => sum + l.subtotal, 0)
    const descuentoTotal = lineas.reduce((sum, l) => sum + l.descuento, 0)
    const total = subtotal
    
    return { subtotal, descuentoTotal, total }
  }
  
  const guardarFactura = async () => {
    if (lineas.length === 0) {
      setError('Agrega al menos una línea a la factura')
      return
    }
    
    if (tipoFactura === 'VENTA' && !selectedClienteId) {
      setError('Selecciona un cliente')
      return
    }
    
    if (tipoFactura === 'COMPRA' && !selectedProveedorId) {
      setError('Selecciona un proveedor')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // 1. Crear/actualizar partes primero
      const partesActualizadas: { [key: string]: number } = {}
      
      for (const linea of lineas) {
        if (linea.es_nueva_parte) {
          // Crear nueva parte
          const nuevaParte = {
            codigo: linea.codigo_parte,
            nombre: linea.nombre_parte,
            descripcion: linea.descripcion_parte || '',
            categoria: linea.categoria || 'Otros',
            marca: linea.marca || '',
            modelo_compatible: '',
            stock: tipoFactura === 'COMPRA' ? linea.cantidad : 0,
            stock_minimo: 0,
            precio: linea.precio_unitario,
            precio_compra: tipoFactura === 'COMPRA' ? linea.precio_unitario : undefined,
            precio_venta: tipoFactura === 'VENTA' ? linea.precio_unitario : undefined,
            ubicacion: ''
          }
          
          const response = await fetch('/api/partes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(nuevaParte)
          })
          
          if (response.ok) {
            const parteCreada = await response.json()
            partesActualizadas[linea.codigo_parte] = parteCreada.id
          } else {
            throw new Error(`Error al crear parte ${linea.codigo_parte}`)
          }
        } else if (linea.parte_id) {
          // Actualizar parte existente con nuevos datos
          const parteActualizada = {
            precio: linea.precio_unitario,
            precio_compra: tipoFactura === 'COMPRA' ? linea.precio_unitario : undefined,
            precio_venta: tipoFactura === 'VENTA' ? linea.precio_unitario : undefined,
          }
          
          await fetch(`/api/partes/${linea.parte_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(parteActualizada)
          })
          
          partesActualizadas[linea.codigo_parte] = linea.parte_id
        }
      }
      
      // 2. Crear factura con IDs actualizados
      const detallesFactura = lineas.map(linea => ({
        parte_id: partesActualizadas[linea.codigo_parte] || linea.parte_id,
        codigo_parte: linea.codigo_parte,
        nombre_parte: linea.nombre_parte,
        descripcion_parte: linea.descripcion_parte,
        cantidad: linea.cantidad,
        precio_unitario: linea.precio_unitario,
        descuento: linea.descuento,
        subtotal: linea.subtotal,
        orden: linea.orden
      }))
      
      const facturaData = {
        tipo: tipoFactura,
        cliente_id: tipoFactura === 'VENTA' ? selectedClienteId : undefined,
        proveedor_id: tipoFactura === 'COMPRA' ? selectedProveedorId : undefined,
        metodo_pago,
        notas,
        descuento: 0,
        detalles: detallesFactura
      }
      
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(facturaData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(`✅ Factura ${data.numero_factura} creada exitosamente`)
        
        // Generar PDF automáticamente
        await generarPDF(data)
        
        // Reset formulario
        setTimeout(() => {
          setLineas([])
          setMetodoPago('')
          setNotas('')
          setSuccess('')
          resetFormulario()
        }, 3000)
      } else {
        setError(data.error || 'Error al crear factura')
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }
  
  const generarPDF = async (factura: any) => {
    try {
      const doc = new jsPDF()
      
      // Encabezado
      doc.setFontSize(20)
      doc.text('MI EMPRESA', 105, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text('Sistema de Inventario - Facturación', 105, 28, { align: 'center' })
      
      // Info factura
      doc.setFontSize(16)
      doc.text(`FACTURA ${factura.tipo}`, 20, 45)
      
      doc.setFontSize(10)
      doc.text(`Número: ${factura.numero_factura}`, 20, 55)
      doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-CO')}`, 20, 62)
      doc.text(`Estado: ${factura.estado}`, 20, 69)
      
      // Cliente/Proveedor
      const tercero = tipoFactura === 'VENTA' 
        ? clientes.find(c => c.id === selectedClienteId)
        : proveedores.find(p => p.id === selectedProveedorId)
      
      if (tercero) {
        doc.text(`${tipoFactura === 'VENTA' ? 'Cliente' : 'Proveedor'}: ${tercero.nombre}`, 20, 76)
        if (tercero.documento) doc.text(`Documento: ${tercero.documento}`, 20, 83)
      }
      
      // Tabla de items
      const tableData = factura.detalles.map((d: any) => [
        d.codigo_parte,
        d.nombre_parte,
        d.cantidad,
        `$${d.precio_unitario.toLocaleString()}`,
        `$${d.subtotal.toLocaleString()}`
      ])
      
      autoTable(doc, {
        startY: 95,
        head: [['Código', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      })
      
      // Totales
      const finalY = (doc as any).lastAutoTable.finalY || 95
      doc.setFontSize(12)
      doc.text(`Subtotal: $${factura.subtotal.toLocaleString()}`, 140, finalY + 15)
      doc.setFontSize(14)
      doc.text(`TOTAL: $${factura.total.toLocaleString()}`, 140, finalY + 25)
      
      // Pie de página
      doc.setFontSize(8)
      doc.text('Desarrollado por: Juan Sebastian Arguello Lozano', 105, 280, { align: 'center' })
      doc.text('+57 315 215 4826 | juan.arguello@sistemas.com', 105, 285, { align: 'center' })
      
      // Guardar
      doc.save(`Factura-${factura.numero_factura}.pdf`)
    } catch (error) {
      console.error('Error generando PDF:', error)
      setError('Error al generar PDF')
    }
  }
  
  const enviarWhatsApp = () => {
    const { total } = calcularTotales()
    const tercero = tipoFactura === 'VENTA' 
      ? clientes.find(c => c.id === selectedClienteId)
      : proveedores.find(p => p.id === selectedProveedorId)
    
    const telefono = tercero?.telefono?.replace(/\D/g, '') || ''
    const mensaje = encodeURIComponent(
      `Hola ${tercero?.nombre || ''}!\n\n` +
      `Te enviamos tu factura de ${tipoFactura.toLowerCase()}:\n\n` +
      `Total: $${total.toLocaleString()}\n\n` +
      `Gracias por tu preferencia!`
    )
    
    window.open(`https://wa.me/57${telefono}?text=${mensaje}`, '_blank')
  }
  
  const enviarEmail = () => {
    const { total } = calcularTotales()
    const tercero = tipoFactura === 'VENTA' 
      ? clientes.find(c => c.id === selectedClienteId)
      : proveedores.find(p => p.id === selectedProveedorId)
    
    const asunto = `Factura de ${tipoFactura}`
    const cuerpo = encodeURIComponent(
      `Estimado/a ${tercero?.nombre || ''},\n\n` +
      `Adjuntamos tu factura de ${tipoFactura.toLowerCase()}.\n\n` +
      `Total: $${total.toLocaleString()}\n\n` +
      `Saludos cordiales,\nMI EMPRESA`
    )
    
    window.open(`mailto:${tercero?.email || ''}?subject=${asunto}&body=${cuerpo}`, '_blank')
  }
  
  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Enter' && (selectedParte || modoEdicion)) {
        e.preventDefault()
        agregarLinea()
      }
      
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        guardarFactura()
      }
      
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        crearParteTemporal()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedParte, modoEdicion, lineas, selectedClienteId, selectedProveedorId, parteForm])
  
  const { subtotal, total } = calcularTotales()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Facturación</h1>
          <p className="text-gray-600">Gestión rápida de compras y ventas</p>
        </div>
        
        {/* Tipo de factura */}
        <div className="flex gap-2">
          <Button
            onClick={() => setTipoFactura('VENTA')}
            variant={tipoFactura === 'VENTA' ? 'default' : 'outline'}
            className={tipoFactura === 'VENTA' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Venta
          </Button>
          <Button
            onClick={() => setTipoFactura('COMPRA')}
            variant={tipoFactura === 'COMPRA' ? 'default' : 'outline'}
            className={tipoFactura === 'COMPRA' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Package className="h-4 w-4 mr-2" />
            Compra
          </Button>
        </div>
      </div>
      
      {/* Formulario principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Búsqueda y agregar items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Búsqueda de partes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Buscar Parte
                </span>
                <Badge variant="outline" className="text-xs">
                  Ctrl+N para nueva | Shift+Enter para agregar
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  ref={codigoInputRef}
                  placeholder="Escribe código o nombre de la parte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length === 0 && searchQuery.trim()) {
                      crearParteTemporal()
                    }
                  }}
                  className="text-lg"
                  autoFocus
                />
                
                {/* Resultados de búsqueda */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((parte) => (
                      <div
                        key={parte.id}
                        onClick={() => seleccionarParte(parte)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{parte.codigo}</p>
                            <p className="text-sm text-gray-600">{parte.nombre}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              ${(tipoFactura === 'VENTA' ? parte.precio_venta : parte.precio_compra)?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Stock: {parte.stock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Mensaje cuando no hay resultados */}
                {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4">
                    <div className="text-center text-gray-600">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="font-medium">No se encontró "{searchQuery}"</p>
                      <Button
                        onClick={crearParteTemporal}
                        size="sm"
                        className="mt-2 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Crear Nueva Parte (Ctrl+N)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Formulario de parte (nueva o existente) */}
              {(selectedParte || modoEdicion) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {modoEdicion ? (
                        <Badge className="bg-green-600">NUEVA PARTE</Badge>
                      ) : (
                        <Badge className="bg-blue-600">PARTE EXISTENTE</Badge>
                      )}
                      <Edit className="h-4 w-4 text-blue-600" />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetFormulario}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Datos de la parte */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Código *</Label>
                      <Input
                        value={parteForm.codigo}
                        onChange={(e) => setParteForm({...parteForm, codigo: e.target.value})}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Categoría</Label>
                      <Select 
                        value={parteForm.categoria} 
                        onValueChange={(v) => setParteForm({...parteForm, categoria: v})}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Label className="text-xs">Nombre *</Label>
                    <Input
                      value={parteForm.nombre}
                      onChange={(e) => setParteForm({...parteForm, nombre: e.target.value})}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Marca</Label>
                      <Input
                        value={parteForm.marca}
                        onChange={(e) => setParteForm({...parteForm, marca: e.target.value})}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Input
                        value={parteForm.descripcion}
                        onChange={(e) => setParteForm({...parteForm, descripcion: e.target.value})}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  {selectedParte && (
                    <div className="text-xs text-gray-600 mb-3 bg-white/50 p-2 rounded">
                      Stock actual: <strong>{selectedParte.stock}</strong> unidades
                    </div>
                  )}
                  
                  {/* Cantidad, Precio, Descuento */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Cantidad *</Label>
                      <Input
                        ref={cantidadInputRef}
                        type="number"
                        min="1"
                        value={lineaActual.cantidad}
                        onChange={(e) => setLineaActual({...lineaActual, cantidad: parseInt(e.target.value) || 1})}
                        onKeyDown={(e) => e.key === 'Enter' && precioInputRef.current?.focus()}
                        className="h-10 text-lg font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio Unit. *</Label>
                      <Input
                        ref={precioInputRef}
                        type="number"
                        min="0"
                        step="0.01"
                        value={lineaActual.precio_unitario}
                        onChange={(e) => setLineaActual({...lineaActual, precio_unitario: parseFloat(e.target.value) || 0})}
                        onKeyDown={(e) => e.key === 'Enter' && agregarLinea()}
                        className="h-10 text-lg font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descuento</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lineaActual.descuento}
                        onChange={(e) => setLineaActual({...lineaActual, descuento: parseFloat(e.target.value) || 0})}
                        onKeyDown={(e) => e.key === 'Enter' && agregarLinea()}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={agregarLinea}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 h-12 text-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {modoEdicion ? 'Crear y Agregar (Shift+Enter)' : 'Agregar a Factura (Shift+Enter)'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Líneas de factura */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                  Items de la Factura ({lineas.length})
                </span>
                {lineas.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLineas([])}
                  >
                    Limpiar Todo
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lineas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay items agregados</p>
                  <p className="text-sm">Busca o crea partes para comenzar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lineas.map((linea) => (
                    <div key={linea.orden} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{linea.codigo_parte}</p>
                          {linea.es_nueva_parte && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                              NUEVA
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{linea.nombre_parte}</p>
                        {linea.categoria && (
                          <p className="text-xs text-gray-500">{linea.categoria} {linea.marca && `- ${linea.marca}`}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {linea.cantidad} × ${linea.precio_unitario.toLocaleString()}
                        </p>
                        {linea.descuento > 0 && (
                          <p className="text-xs text-red-600">-${linea.descuento.toLocaleString()}</p>
                        )}
                        <p className="font-bold text-green-600">${linea.subtotal.toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarLinea(linea.orden)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Columna derecha: Resumen y acciones */}
        <div className="space-y-6">
          {/* Cliente/Proveedor */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                {tipoFactura === 'VENTA' ? 'Cliente' : 'Proveedor'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tipoFactura === 'VENTA' ? (
                <Select value={selectedClienteId?.toString()} onValueChange={(v) => setSelectedClienteId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedProveedorId?.toString()} onValueChange={(v) => setSelectedProveedorId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
          
          {/* Totales */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <DollarSign className="h-5 w-5 mr-2" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-bold">${subtotal.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-green-200 pt-3">
                <div className="flex justify-between text-2xl font-bold text-green-800">
                  <span>TOTAL:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Datos adicionales */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Método de Pago</Label>
                <Input
                  placeholder="Ej: Efectivo, Tarjeta, Transferencia..."
                  value={metodo_pago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  placeholder="Observaciones adicionales..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Alertas */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Acciones */}
          <div className="space-y-2">
            <Button
              onClick={guardarFactura}
              disabled={loading || lineas.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Guardar Factura (Ctrl+G)
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={enviarWhatsApp}
                disabled={lineas.length === 0}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Send className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={enviarEmail}
                disabled={lineas.length === 0}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}