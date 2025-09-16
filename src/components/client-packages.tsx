'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarDays, Users, Clock, MapPin } from 'lucide-react'

interface Package {
  id: string
  nombre: string
  destino: string
  tipo: string
  duracion: number
  precio: number
  fechaCompra: string
  fechaInicio: string
  fechaFin: string
  estado: 'activo' | 'finalizado' | 'pendiente' | 'cancelado'
  participantes: number
  imagen: string
  descripcion: string
}

// Mock data - reemplazar con llamada al backend
const mockPackages: Package[] = [
  {
    id: '1',
    nombre: 'Tour Salar de Uyuni 3 días',
    destino: 'Salar de Uyuni',
    tipo: 'Aventura',
    duracion: 3,
    precio: 450,
    fechaCompra: '2024-01-15',
    fechaInicio: '2024-02-01',
    fechaFin: '2024-02-03',
    estado: 'finalizado',
    participantes: 2,
    imagen: '/salar-de-uyuni-espejo.png',
    descripcion: 'Increíble experiencia de 3 días por el Salar de Uyuni con hotel de sal incluido.'
  },
  {
    id: '2',
    nombre: 'Lago Titicaca y Copacabana',
    destino: 'Lago Titicaca',
    tipo: 'Cultural',
    duracion: 2,
    precio: 280,
    fechaCompra: '2024-03-20',
    fechaInicio: '2024-04-10',
    fechaFin: '2024-04-11',
    estado: 'activo',
    participantes: 1,
    imagen: '/lago-titicaca-bolivia-panorama.png',
    descripcion: 'Tour cultural por el Lago Titicaca visitando Copacabana e Isla del Sol.'
  },
  {
    id: '3',
    nombre: 'Amazonía Madidi 5 días',
    destino: 'Parque Nacional Madidi',
    tipo: 'Ecoturismo',
    duracion: 5,
    precio: 680,
    fechaCompra: '2024-04-05',
    fechaInicio: '2024-05-15',
    fechaFin: '2024-05-19',
    estado: 'pendiente',
    participantes: 3,
    imagen: '/madidi-amazon-rainforest.png',
    descripcion: 'Expedición de 5 días por la Amazonía boliviana con lodge ecológico.'
  }
]

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'activo': return 'bg-green-100 text-green-800'
    case 'finalizado': return 'bg-blue-100 text-blue-800'
    case 'pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado: string) => {
  switch (estado) {
    case 'activo': return 'En Curso'
    case 'finalizado': return 'Finalizado'
    case 'pendiente': return 'Próximo'
    case 'cancelado': return 'Cancelado'
    default: return estado
  }
}

export default function ClientPackages() {
  const [packages, setPackages] = useState<Package[]>(mockPackages)
  const [filteredPackages, setFilteredPackages] = useState<Package[]>(mockPackages)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  useEffect(() => {
    let filtered = packages

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(pkg => pkg.estado === statusFilter)
    }

    setFilteredPackages(filtered)
  }, [packages, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mis Paquetes</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver todos los paquetes turísticos que has adquirido
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, destino o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">En Curso</option>
            <option value="pendiente">Próximos</option>
            <option value="finalizado">Finalizados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Lista de Paquetes */}
      {filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron paquetes</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'todos' 
                ? 'No hay paquetes que coincidan con tus filtros'
                : 'Aún no has adquirido ningún paquete turístico'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              {/* Imagen */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={pkg.imagen}
                  alt={pkg.nombre}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(pkg.estado)}>
                    {getStatusText(pkg.estado)}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{pkg.nombre}</CardTitle>
                  <CardDescription>{pkg.descripcion}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Detalles del paquete */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{pkg.destino}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{pkg.duracion} días</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{pkg.participantes} participante{pkg.participantes > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDate(pkg.fechaInicio)} - {formatDate(pkg.fechaFin)}</span>
                  </div>
                </div>

                {/* Precio y fecha de compra */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">{formatPrice(pkg.precio)}</div>
                      <div className="text-xs text-muted-foreground">
                        Comprado el {formatDate(pkg.fechaCompra)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {pkg.tipo}
                    </Badge>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalles
                  </Button>
                  {pkg.estado === 'activo' && (
                    <Button size="sm" className="flex-1">
                      Gestionar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{packages.length}</div>
            <div className="text-sm text-muted-foreground">Total Paquetes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {packages.filter(p => p.estado === 'activo').length}
            </div>
            <div className="text-sm text-muted-foreground">En Curso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {packages.filter(p => p.estado === 'pendiente').length}
            </div>
            <div className="text-sm text-muted-foreground">Próximos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {packages.filter(p => p.estado === 'finalizado').length}
            </div>
            <div className="text-sm text-muted-foreground">Completados</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}