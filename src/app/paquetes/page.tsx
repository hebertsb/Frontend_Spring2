"use client";

import { Navegacion } from "@/components/comunes/navegacion";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removemos la importación de Select que está causando problemas
import {
  Star,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { paquetesData, Paquete } from "./paquetesData";

export default function PaginaPaquetes() {
  const [paquetes, setPaquetes] = useState<Paquete[]>(paquetesData);
  const [paquetesFiltrados, setPaquetesFiltrados] = useState<Paquete[]>(paquetesData);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [dificultadFiltro, setDificultadFiltro] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Obtener categorías únicas
  const categorias = [...new Set(paquetes.map((p: Paquete) => p.categoria))];
  const dificultades = [...new Set(paquetes.map((p: Paquete) => p.dificultad))];

  useEffect(() => {
    let filtrados = [...paquetes];

    // Filtrar por término de búsqueda
    if (terminoBusqueda) {
      filtrados = filtrados.filter(paquete =>
        paquete.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.ubicacion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.descripcionCorta.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoriaFiltro) {
      filtrados = filtrados.filter(paquete => paquete.categoria === categoriaFiltro);
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
        filtrados.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        break;
      default:
        // Relevancia (por calificación y número de reseñas)
        filtrados.sort((a, b) => (b.calificacion * b.numeroReseñas) - (a.calificacion * a.numeroReseñas));
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar destinos, ubicaciones..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Botón de filtros móvil */}
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            {/* Ordenar */}
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="w-full lg:w-48 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="relevancia">Más Relevantes</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="calificacion">Mejor Calificados</option>
              <option value="duracion">Duración</option>
              <option value="recientes">Más Recientes</option>
            </select>
          </div>

          {/* Panel de filtros */}
          <div className={`${mostrarFiltros ? 'block' : 'hidden'} lg:block`}>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                     <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Dificultad</label>
                    <select
                      value={dificultadFiltro}
                      onChange={(e) => setDificultadFiltro(e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Todas las dificultades</option>
                      {dificultades.map(dificultad => (
                     <option key={dificultad} value={dificultad}>{dificultad}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={limpiarFiltros} className="w-full">
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
                    {paquete.descuento > 0 && (
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
                      {paquete.categoria}
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
                      {paquete.descripcionCorta}
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
                      ({paquete.numeroReseñas} reseñas)
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
                      Hasta {paquete.maxPersonas}
                    </div>
                  </div>

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div>
                      {paquete.precioOriginal && (
                        <div className="text-sm line-through text-muted-foreground">
                          {paquete.precioOriginal}
                        </div>
                      )}
                      <div className="text-xl font-bold text-primary">
                        {paquete.precio}
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
