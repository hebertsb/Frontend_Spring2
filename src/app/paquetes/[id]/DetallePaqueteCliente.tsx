"use client";

import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  Heart,
  Share2,
  Clock,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function DetallePaqueteCliente({ paquete }: { paquete: any }) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [imagenActual, setImagenActual] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (paquete) {
      setTitulo(paquete.nombre);
    }
  }, [paquete]);

  const manejarFavorito = () => {
    setEsFavorito(!esFavorito);
    toast({
      title: esFavorito ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: esFavorito 
        ? `${paquete?.nombre} ha sido eliminado de tus favoritos`
        : `${paquete?.nombre} ha sido agregado a tus favoritos`,
    });
  };

  const manejarCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: paquete?.nombre,
          text: paquete?.descripcionCorta,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "URL copiada",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  const manejarReserva = () => {
    if (!paquete) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del paquete",
        variant: "destructive",
      });
      return;
    }

    // Convertir precio de bolivianos a formato esperado por la reserva
    const precioNumerico = paquete.precio.replace(/[^\d]/g, ''); // Extraer solo números
    const precioEnDolares = `$${Math.round(parseInt(precioNumerico) * 0.14)}`; // Conversión aproximada Bs a USD

    // Redirigir a la página de reserva con los parámetros del paquete
    const params = new URLSearchParams({
      nombre: paquete.nombre,
      precio: precioEnDolares,
      id: paquete.id,
    });
    
    router.push(`/reserva?${params.toString()}`);
  };

  if (!paquete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paquete no encontrado</h2>
          <p className="text-gray-600 mb-4">El paquete que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push('/paquetes')}>
            Volver a Paquetes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <DetailBreadcrumbs 
        parentPage="Paquetes" 
        parentHref="/paquetes" 
        currentPageTitle={titulo || "Detalle del Paquete"} 
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={paquete.imagenes?.[imagenActual] || "/placeholder.svg"}
                alt={paquete.nombre}
                width={600}
                height={400}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                priority
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={manejarFavorito}
                  className="bg-white/80 hover:bg-white"
                >
                  <Heart className={`h-4 w-4 ${esFavorito ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={manejarCompartir}
                  className="bg-white/80 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {paquete.descuento > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white font-bold">
                    -{paquete.descuento}%
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {paquete.imagenes && paquete.imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {paquete.imagenes.map((imagen: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      imagenActual === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={imagen}
                      alt={`${paquete.nombre} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del paquete */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {paquete.categoria}
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  {paquete.dificultad}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{paquete.calificacion}</span>
                  <span className="text-gray-500 text-sm">({paquete.numeroReseñas} reseñas)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{paquete.nombre}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{paquete.ubicacion}</span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {paquete.descripcionCorta}
            </p>

            {/* Detalles rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">{paquete.duracion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Máx. personas</p>
                  <p className="font-medium">{paquete.maxPersonas}</p>
                </div>
              </div>
            </div>

            {/* Precio y reserva */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {paquete.precioOriginal && (
                      <span className="text-lg text-gray-500 line-through">{paquete.precioOriginal}</span>
                    )}
                    {paquete.descuento > 0 && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Precio por persona</p>
                  <p className="text-3xl font-bold text-purple-700">{paquete.precio}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <Button 
                onClick={manejarReserva}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                Reservar Paquete
              </Button>
            </Card>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Qué incluye este paquete
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Transporte privado ida y vuelta
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Guía especializado bilingüe
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Alojamiento según categoría
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Desayunos incluidos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Entradas a todos los sitios
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Seguro de viaje completo
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              No incluye
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Vuelos internacionales
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Almuerzos y cenas
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Bebidas alcohólicas
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Gastos personales
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Propinas
              </li>
            </ul>
          </Card>
        </div>
      </div>
      
      <PiePagina />
    </div>
  );
}
