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
  const [paquetesFiltrados, setPaquetesFiltrados] = useState(paquetesData);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [dificultadFiltro, setDificultadFiltro] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");


  useEffect(() => {
    const fetchPaquetes = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes/`);
      const data: Paquete[] = await response.json();
      setPaquetes(data);
      setPaquetesFiltrados(data);
    };
    fetchPaquetes();
  }, []);

  useEffect(() => {
    let filtrados = [...paquetes];

    // Filtrar por término de búsqueda
    if (terminoBusqueda) {
      paquetesFiltrados = paquetesFiltrados.filter(paquete =>
        paquete.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.ubicacion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        paquete.descripcionCorta.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoriaFiltro) {
      paquetesFiltrados = paquetesFiltrados.filter(paquete =>
        paquete.categoria.toLowerCase() === categoriaFiltro.toLowerCase()
      );
    }

    // Filtrar por dificultad
    if (dificultadFiltro) {
      paquetesFiltrados = paquetesFiltrados.filter(paquete =>
        paquete.dificultad.toLowerCase() === dificultadFiltro.toLowerCase()
      );
    }

    // Ordenar
    switch (ordenarPor) {
      case "precio-asc":
        paquetesFiltrados.sort((a, b) => {
          const precioA = parseInt(a.precio.replace(/[^\d]/g, ''));
          const precioB = parseInt(b.precio.replace(/[^\d]/g, ''));
          return precioA - precioB;
        });
        break;
      case "precio-desc":
        paquetesFiltrados.sort((a, b) => {
          const precioA = parseInt(a.precio.replace(/[^\d]/g, ''));
          const precioB = parseInt(b.precio.replace(/[^\d]/g, ''));
          return precioB - precioA;
        });
        break;
      case "calificacion":
        paquetesFiltrados.sort((a, b) => b.calificacion - a.calificacion);
        break;
      default:
        // Mantener orden original por relevancia
        break;
    }

    setPaquetesFiltrados(paquetesFiltrados);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paquetes Turísticos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros increíbles paquetes diseñados para vivir experiencias únicas en Bolivia
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar paquetes..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            <option value="aventura">Aventura</option>
            <option value="cultural">Cultural</option>
            <option value="naturaleza">Naturaleza</option>
          </select>

          <select
            value={dificultadFiltro}
            onChange={(e) => setDificultadFiltro(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toda dificultad</option>
            <option value="fácil">Fácil</option>
            <option value="moderada">Moderada</option>
            <option value="difícil">Difícil</option>
          </select>

          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="calificacion">Mejor Calificado</option>
          </select>
        </div>

        {/* Resultado de búsqueda */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {paquetesFiltrados.length} de {paquetesData.length} paquetes
          </p>
        </div>

        {/* Grid de paquetes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paquetesFiltrados.map((paquete) => (
            <Card key={paquete.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative">
                <Image
                  src={paquete.imagenes?.[0] || "/placeholder.svg"}
                  alt={paquete.nombre}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                
                {/* Badges en la imagen */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {paquete.descuento > 0 && (
                    <Badge className="bg-red-500 text-white">
                      -{paquete.descuento}%
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {paquete.categoria}
                  </Badge>
                </div>

                {/* Botón de favorito */}
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{paquete.calificacion}</span>
                      <span className="text-sm text-gray-500">({paquete.numeroReseñas})</span>
                    </div>
                    <Badge variant="outline">
                      {paquete.dificultad}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/paquetes/${paquete.id}`} className="hover:underline">
                      {paquete.nombre}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{paquete.ubicacion}</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                    {paquete.descripcionCorta}
                  </p>
                </div>

                {/* Detalles del paquete */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{paquete.duracion}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Máx. {paquete.maxPersonas}</span>
                  </div>
                </div>

                {/* Precio y CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    {paquete.precioOriginal && (
                      <div className="text-sm line-through text-gray-500">
                        {paquete.precioOriginal}
                      </div>
                    )}
                    <div className="text-xl font-bold text-blue-600">
                      {paquete.precio}
                    </div>
                    <div className="text-sm text-gray-500">por persona</div>
                  </div>
                  <Link href={`/paquetes/${paquete.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sin resultados */}
        {paquetesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron paquetes que coincidan con tus criterios de búsqueda.
            </p>
            <Button 
              onClick={() => {
                setTerminoBusqueda("");
                setCategoriaFiltro("");
                setDificultadFiltro("");
                setOrdenarPor("relevancia");
              }}
              className="mt-4"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>
      
      <PiePagina />
    </div>
  );
}