'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarDays, Users, Clock, MapPin, RefreshCw, Calendar } from 'lucide-react'
import { obtenerMisReservas, ReservaCliente } from '@/api/cliente-panel'

type PaqueteReserva = {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion?: number;
  precio_bob?: number;
  imagen_principal?: string;
  punto_salida?: string;
  estado?: string;
};

type ReservaConPaquete = ReservaCliente & {
  paquete?: PaqueteReserva | null;
};
import { obtenerPaqueteTuristico } from '@/api/paquetes'
import { useToast } from '@/hooks/use-toast'
import useAuth from '@/hooks/useAuth'

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'confirmado': return 'bg-green-100 text-green-800'
    case 'en_curso': return 'bg-blue-100 text-blue-800'
    case 'proximo': return 'bg-yellow-100 text-yellow-800'
    case 'completado': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (estado: string) => {
  switch (estado) {
    case 'confirmado': return 'Confirmado'
    case 'en_curso': return 'En Curso'
    case 'proximo': return 'Próximo'
    case 'completado': return 'Completado'
    default: return estado
  }
}

export default function ClientPackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<ReservaConPaquete[]>([])
  const [filteredPackages, setFilteredPackages] = useState<ReservaConPaquete[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Cargar reservas y filtrar solo activos
  const cargarPaquetes = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para ver tus paquetes",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const reservas = await obtenerMisReservas();
      // Filtrar solo reservas pagadas, en curso o próximas
      const activos = reservas.filter((r: any) => ['PAGADA', 'EN_CURSO', 'PROXIMO'].includes((r.estado || '').toUpperCase()));
      setPackages(activos || []);
      if (activos && activos.length > 0) {
        toast({
          title: "✅ Paquetes activos cargados",
          description: `Se encontraron ${activos.length} paquetes activos`,
        });
      }
    } catch (error: any) {
      console.error('Error cargando paquetes:', error);
      toast({
        title: "Error",
        description: "Error al cargar tus paquetes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPaquetes();
  }, [user]);

  useEffect(() => {
    let filtered = packages

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        (pkg.paquete?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(pkg => pkg.estado === statusFilter.toUpperCase());
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
            <option value="en_curso">En Curso</option>
            <option value="confirmado">Confirmados</option>
            <option value="proximo">Próximos</option>
            <option value="completado">Completados</option>
          </select>
        </div>
      </div>

      {/* Lista de Paquetes */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cargando paquetes</h3>
            <p className="text-muted-foreground">Por favor espera...</p>
          </CardContent>
        </Card>
      ) : filteredPackages.length === 0 ? (
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
              {/* Imagen principal del paquete */}
              {pkg.paquete ? (
                <>
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={pkg.paquete.imagen_principal ?? '/paquete-placeholder.png'}
                      alt={pkg.paquete.nombre ?? 'Paquete turístico'}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor((pkg.estado || '').toLowerCase())}>
                        {getStatusText((pkg.estado || '').toLowerCase())}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pkg.paquete.nombre}</CardTitle>
                      <CardDescription>{pkg.paquete.descripcion ?? ''}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Detalles del paquete */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{pkg.paquete.punto_salida ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{pkg.paquete.duracion ?? '-'} días</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{pkg.numero_personas || 1} participante{(pkg.numero_personas || 1) > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(pkg.fecha_inicio || pkg.fecha || '')} - {formatDate(pkg.fecha_fin || pkg.fecha || '')}</span>
                      </div>
                    </div>
                    {/* Precio y fecha de compra */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold">
                            {pkg.paquete.precio_bob ? `Bs. ${Number(pkg.paquete.precio_bob).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` : 'Bs. 0.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Comprado el {formatDate(pkg.created_at)}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {pkg.paquete.estado ?? '-'}
                        </Badge>
                      </div>
                    </div>
                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (pkg.id) {
                            router.push(`/reservas/${pkg.id}`);
                          }
                        }}
                        disabled={!pkg.id}
                      >
                        Ver Detalles
                      </Button>
                      {/* Mostrar botón Reprogramar solo si la reserva está pagada y es reprogramable */}
                      {pkg.estado === 'PAGADA' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            if (pkg.id) {
                              router.push(`/reservas/${pkg.id}?reprogramar=1`);
                            }
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Reprogramar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardHeader>
                  <CardTitle className="text-lg">Paquete no disponible</CardTitle>
                  <CardDescription>Este paquete ya no está disponible o fue eliminado.</CardDescription>
                </CardHeader>
              )}
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
              {packages.filter(p => p.estado === 'en_curso').length}
            </div>
            <div className="text-sm text-muted-foreground">En Curso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {packages.filter(p => p.estado === 'confirmado').length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {packages.filter(p => p.estado === 'completado').length}
            </div>
            <div className="text-sm text-muted-foreground">Completados</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}