"use client";

import { useState, useEffect } from "react";
import { Paquete } from "./datos";  // Importar el tipo Paquete
import { Navegacion } from "@/components/comunes/navegacion";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Clock, Users, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PaginaPaquetes() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]); // Tipar el estado con Paquete
  const [paquetesFiltrados, setPaquetesFiltrados] = useState<Paquete[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [dificultadFiltro, setDificultadFiltro] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");

  useEffect(() => {
    const fetchPaquetes = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/paquetes/");
      const data: Paquete[] = await response.json(); // Tipar la respuesta con Paquete[]
      setPaquetes(data);
      setPaquetesFiltrados(data);
    };

    fetchPaquetes();
  }, []);

  useEffect(() => {
    let filtrados = [...paquetes];

    // Filtrar por término de búsqueda
    if (terminoBusqueda) {
      filtrados = filtrados.filter(paquete =>
        paquete.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.ubicacion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.descripcion_corta.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoriaFiltro) {
      filtrados = filtrados.filter(paquete => paquete.categoria.nombre === categoriaFiltro);
    }

    // Filtrar por dificultad
    if (dificultadFiltro) {
      filtrados = filtrados.filter(paquete => paquete.dificultad === dificultadFiltro);
    }

    // Ordenar
    switch (ordenarPor) {
      case "precio-asc":
        filtrados.sort((a, b) => parseInt(a.precio.replace(/[^\d]/g, '')) - parseInt(b.precio.replace(/[^\d]/g, '')));
        break;
      case "precio-desc":
        filtrados.sort((a, b) => parseInt(b.precio.replace(/[^\d]/g, '')) - parseInt(a.precio.replace(/[^\d]/g, '')));
        break;
      case "calificacion":
        filtrados.sort((a, b) => b.calificacion - a.calificacion);
        break;
      case "duracion":
        filtrados.sort((a, b) => parseInt(a.duracion) - parseInt(b.duracion));
        break;
      case "recientes":
        filtrados.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        filtrados.sort((a, b) => (b.calificacion * b.numero_reseñas) - (a.calificacion * a.numero_reseñas));
    }

    setPaquetesFiltrados(filtrados);
  }, [terminoBusqueda, categoriaFiltro, dificultadFiltro, ordenarPor, paquetes]);

  const limpiarFiltros = () => {
    setTerminoBusqueda("");
    setCategoriaFiltro("");
    setDificultadFiltro("");
    setOrdenarPor("relevancia");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-heading text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Paquetes Turísticos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los mejores destinos de Bolivia con nuestros paquetes cuidadosamente diseñados para brindarte experiencias inolvidables
          </p>
        </div>

        {/* Filtros y búsqueda */}
        {/* Código de búsqueda y filtros permanece igual */}
        
        {/* Resultados */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {paquetesFiltrados.length} de {paquetes.length} paquetes
          </p>
        </div>

        {/* Grid de paquetes */}
        {paquetesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🎒</div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron paquetes</h3>
              <p className="text-muted-foreground mb-4">
                No hay paquetes que coincidan con tus criterios de búsqueda
              </p>
              <Button onClick={limpiarFiltros}>Limpiar filtros</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paquetesFiltrados.map((paquete) => (
               <Card key={paquete.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={paquete.imagenes[0] || "/placeholder.svg"}
                      alt={paquete.nombre}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Overlay con iconos */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {paquete.descuento && paquete.descuento > 0 && (
                      <Badge className="bg-red-500 text-white">
                        -{paquete.descuento}%
                      </Badge>
                    )}
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badges de categoría y dificultad */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {paquete.categoria.nombre}
                    </Badge>
                    <Badge variant="outline" className="bg-white/90 border-gray-300">
                      {paquete.dificultad}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      <Link href={`/paquetes/${paquete.id}`} className="hover:underline">
                        {paquete.nombre}
                      </Link>
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {paquete.ubicacion}
                    </div>
                    <p className="text-sm text-muted-foreground overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {paquete.descripcion_corta}
                    </p>
                  </div>

                  {/* Calificación */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(paquete.calificacion)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{paquete.calificacion}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({paquete.numero_reseñas} reseñas)
                    </span>
                  </div>

                  {/* Detalles del viaje */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {paquete.duracion}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Hasta {paquete.max_personas}
                    </div>
                  </div>

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div>
                      {paquete.precio_original && (
                        <div className="text-sm line-through text-muted-foreground">
                          {paquete.precio_original} Bs.
                        </div>
                      )}
                      <div className="text-xl font-bold text-primary">
                        {paquete.precio} Bs.
                      </div>
                      <div className="text-sm text-muted-foreground">por persona</div>
                    </div>
                    <Link href={`/paquetes/${paquete.id}`}>
                      <Button className="bg-primary hover:bg-primary/90">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PiePagina />
    </div>
  );
}
