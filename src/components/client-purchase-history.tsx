'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Download, 
  Eye, 
  CreditCard, 
  Calendar, 
  DollarSign,
  Filter
} from 'lucide-react'

interface Purchase {
  id: string
  fecha: string
  tipo: 'paquete' | 'reserva' | 'servicio'
  descripcion: string
  monto: number
  estado: 'completado' | 'pendiente' | 'cancelado' | 'reembolsado'
  metodoPago: string
  numeroTransaccion: string
  factura?: string
  comprobante?: string
}

// Mock data - reemplazar con llamada al backend
const mockPurchases: Purchase[] = [
  {
    id: '1',
    fecha: '2024-01-15',
    tipo: 'paquete',
    descripcion: 'Tour Salar de Uyuni 3 días - 2 personas',
    monto: 450,
    estado: 'completado',
    metodoPago: 'Tarjeta de Crédito',
    numeroTransaccion: 'TXN-2024-001',
    factura: 'FAC-001.pdf',
    comprobante: 'COMP-001.pdf'
  },
  {
    id: '2',
    fecha: '2024-03-20',
    tipo: 'paquete',
    descripcion: 'Lago Titicaca y Copacabana - 1 persona',
    monto: 280,
    estado: 'completado',
    metodoPago: 'Transferencia Bancaria',
    numeroTransaccion: 'TXN-2024-002',
    factura: 'FAC-002.pdf',
    comprobante: 'COMP-002.pdf'
  },
  {
    id: '3',
    fecha: '2024-04-05',
    tipo: 'paquete',
    descripcion: 'Amazonía Madidi 5 días - 3 personas',
    monto: 680,
    estado: 'completado',
    metodoPago: 'PayPal',
    numeroTransaccion: 'TXN-2024-003',
    factura: 'FAC-003.pdf',
    comprobante: 'COMP-003.pdf'
  },
  {
    id: '4',
    fecha: '2024-04-10',
    tipo: 'servicio',
    descripcion: 'Seguro de viaje internacional',
    monto: 45,
    estado: 'completado',
    metodoPago: 'Tarjeta de Débito',
    numeroTransaccion: 'TXN-2024-004',
    comprobante: 'COMP-004.pdf'
  },
  {
    id: '5',
    fecha: '2024-04-15',
    tipo: 'reserva',
    descripcion: 'Depósito Hotel Luna Salada',
    monto: 120,
    estado: 'pendiente',
    metodoPago: 'Transferencia Bancaria',
    numeroTransaccion: 'TXN-2024-005'
  }
]

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'completado': return 'bg-green-100 text-green-800'
    case 'pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    case 'reembolsado': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado: string) => {
  switch (estado) {
    case 'completado': return 'Completado'
    case 'pendiente': return 'Pendiente'
    case 'cancelado': return 'Cancelado'
    case 'reembolsado': return 'Reembolsado'
    default: return estado
  }
}

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'paquete': return 'bg-blue-100 text-blue-800'
    case 'reserva': return 'bg-purple-100 text-purple-800'
    case 'servicio': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getTipoText = (tipo: string) => {
  switch (tipo) {
    case 'paquete': return 'Paquete'
    case 'reserva': return 'Reserva'
    case 'servicio': return 'Servicio'
    default: return tipo
  }
}

export default function ClientPurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases)
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>(mockPurchases)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  useEffect(() => {
    let filtered = purchases

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.numeroTransaccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.metodoPago.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(purchase => purchase.estado === statusFilter)
    }

    // Filtrar por tipo
    if (typeFilter !== 'todos') {
      filtered = filtered.filter(purchase => purchase.tipo === typeFilter)
    }

    // Filtrar por rango de fechas
    if (dateRange.from) {
      filtered = filtered.filter(purchase => purchase.fecha >= dateRange.from)
    }
    if (dateRange.to) {
      filtered = filtered.filter(purchase => purchase.fecha <= dateRange.to)
    }

    setFilteredPurchases(filtered)
  }, [purchases, searchTerm, statusFilter, typeFilter, dateRange])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  const totalAmount = filteredPurchases
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + p.monto, 0)

  const handleDownload = (filename: string) => {
    // Aquí iría la lógica para descargar el archivo
    console.log('Descargando:', filename)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Historial de Compras</h1>
        <p className="text-muted-foreground">
          Revisa todas tus transacciones y descarga tus comprobantes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{formatPrice(totalAmount)}</div>
                <div className="text-sm text-muted-foreground">Total Gastado</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredPurchases.length}</div>
            <div className="text-sm text-muted-foreground">Transacciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {purchases.filter(p => p.estado === 'completado').length}
            </div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {purchases.filter(p => p.estado === 'pendiente').length}
            </div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Descripción, transacción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="completado">Completado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
                <option value="reembolsado">Reembolsado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="paquete">Paquetes</option>
                <option value="reserva">Reservas</option>
                <option value="servicio">Servicios</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Desde</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hasta</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
          {(searchTerm || statusFilter !== 'todos' || typeFilter !== 'todos' || dateRange.from || dateRange.to) && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('todos')
                  setTypeFilter('todos')
                  setDateRange({ from: '', to: '' })
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de compras */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>
            {filteredPurchases.length} transacción{filteredPurchases.length !== 1 ? 'es' : ''} encontrada{filteredPurchases.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🧾</div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron transacciones</h3>
              <p className="text-muted-foreground">
                No hay transacciones que coincidan con tus filtros
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(purchase.fecha)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.descripcion}</div>
                          <div className="text-sm text-muted-foreground">
                            {purchase.numeroTransaccion}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoColor(purchase.tipo)}>
                          {getTipoText(purchase.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {purchase.metodoPago}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(purchase.monto)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(purchase.estado)}>
                          {getStatusText(purchase.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {purchase.factura && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(purchase.factura!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {purchase.comprobante && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(purchase.comprobante!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}