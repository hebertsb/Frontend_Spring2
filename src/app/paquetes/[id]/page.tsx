"use client";

import { Navegacion } from "@/components/comunes/navegacion";
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Definimos un tipo específico para los paquetes
interface Paquete {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  calificacion: number;
  numeroReseñas: number;
  precio: string;
  precioOriginal: string;
  duracion: string;
  maxPersonas: number;
  dificultad: string;
  categoria: string;
  imagenes: string[];
  destinos: {
    nombre: string;
    dias: number;
    descripcion: string;
  }[];
  itinerario: {
    dia: number;
    titulo: string;
    actividades: string[];
  }[];
  incluido: string[];
  noIncluido: string[];
  fechasDisponibles: string[];
  descuento?: number;
}

// Mock data para paquetes detallados (rellena tu mock aquí)
const obtenerDatosPaquete = (id: string): Paquete | undefined => {
  const paquetes: Record<string, Paquete> = {
    // "1": { ... },
    // "2": { ... },
  };
  return paquetes[id];
};

export default function PaginaDetallePaquete() {
  // Normalizamos el id para garantizar string
  const p = useParams();
  const id = Array.isArray((p as any).id) ? (p as any).id[0] : (p as any).id as string;

  const paquete = obtenerDatosPaquete(id);

  const [esFavorito, setEsFavorito] = useState(false);
  const [titulo, setTitulo] = useState("");

  useEffect(() => {
    if (paquete) setTitulo(paquete.nombre);
  }, [paquete]);

  const alternarFavorito = () => {
    setEsFavorito((prev) => !prev);
    const agregado = !esFavorito;

    toast({
      title: agregado ? "Agregado a favoritos" : "Eliminado de favoritos",
      description: agregado
        ? `${titulo} ha sido agregado a tus favoritos`
        : `${titulo} ha sido eliminado de tus favoritos`,
    });
  };

  const compartir = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: `¡Mira este increíble destino en Bolivia: ${titulo}!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Enlace copiado",
          description: "El enlace ha sido copiado al portapapeles",
        });
      }
    } catch (error) {
      console.log("Error al compartir:", error);
    }
  };

  if (!paquete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <Navegacion />
        <div className="max-w-4xl px-4 py-16 mx-auto text-center animate-fade-in">
          <h1 className="mb-4 text-2xl font-bold font-heading text-foreground">
            Paquete no encontrado
          </h1>
          <p className="text-muted-foreground">
            El paquete que buscas no existe o ha sido movido.
          </p>
          <Button className="mt-6" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </div>
        <PiePagina />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <DetailBreadcrumbs 
        parentPage="Paquetes" 
        parentHref="/paquetes" 
        currentPageTitle={titulo || "Detalle del Paquete"} 
      />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 animate-bounce-in">
                  {paquete.categoria}
                </Badge>
                <Badge
                  variant="outline"
                  className="animate-bounce-in animation-delay-100"
                >
                  {paquete.dificultad}
                </Badge>
                {paquete.descuento && (
                  <Badge className="text-white bg-red-500 animate-bounce-in animation-delay-200">
                    -{paquete.descuento}% OFF
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-black font-heading lg:text-4xl text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text">
                {paquete.nombre}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center space-x-1 transition-colors hover:text-primary">
                  <MapPin className="w-4 h-4" />
                  <span>{paquete.ubicacion}</span>
                </div>
                <div className="flex items-center space-x-1 transition-colors hover:text-accent">
                  <Clock className="w-4 h-4" />
                  <span>{paquete.duracion}</span>
                </div>
                <div className="flex items-center space-x-1 transition-colors hover:text-primary">
                  <Users className="w-4 h-4" />
                  <span>Hasta {paquete.maxPersonas} personas</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 animate-fade-in-up animation-delay-200">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-200 hover:scale-110 ${
                        i < Math.floor(paquete.calificacion)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {paquete.calificacion}
                </span>
                <span className="text-muted-foreground">
                  ({paquete.numeroReseñas} reseñas)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 animate-fade-in-up animation-delay-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={alternarFavorito}
                className="
               text-gray-700 border-0 bg-white/90
               shadow-md active:scale-95
               md:shadow-lg
               transition-all duration-200
               hover:bg-white hover:scale-105
               focus-visible:ring-2 focus-visible:ring-amber-400
             "
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    esFavorito ? "fill-red-500 text-red-500 animate-heartBeat" : ""
                  }`}
                />
                {" "}Guardar
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="
               text-gray-700 border-0 bg-white/90
               shadow-md active:scale-95
               md:shadow-lg
               transition-all duration-200
               hover:bg-white hover:scale-105
               focus-visible:ring-2 focus-visible:ring-amber-400
             "
                onClick={compartir}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 animate-slide-up animation-delay-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 h-96">
            <div className="lg:col-span-2 lg:row-span-2 relative">
              <Image
                src={paquete.imagenes[0] || "/placeholder.svg"}
                alt={paquete.nombre}
                fill
                className="object-cover w-full h-full transition-transform duration-300 rounded-lg hover:scale-105"
              />
            </div>
            {paquete.imagenes.slice(1, 5).map((imagen: string, index: number) => (
              <div
                key={index}
                className="animate-fade-in-up relative"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <Image
                  src={imagen || "/placeholder.svg"}
                  alt={`${paquete.nombre} ${index + 2}`}
                  className="object-cover w-full h-full transition-transform duration-300 rounded-lg hover:scale-105"
                  width={600}
                  height={400}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-300 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Sobre este paquete
                </h2>
                <div className="prose prose-gray max-w-none">
                  {paquete.descripcionCompleta
                    .split("\n\n")
                    .map((parrafo: string, index: number) => (
                      <p
                        key={index}
                        className="mb-4 leading-relaxed text-muted-foreground animate-fade-in-up"
                        style={{ animationDelay: `${400 + index * 100}ms` }}
                      >
                        {parrafo}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Destinos incluidos */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-400 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Destinos incluidos
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {paquete.destinos.map(
                    (destino: Paquete["destinos"][number], index: number) => (
                      <div
                        key={index}
                        className="p-4 transition-shadow border rounded-lg border-border hover:shadow-md animate-fade-in-up"
                        style={{ animationDelay: `${500 + index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {destino.nombre}
                          </h3>
                          <Badge variant="secondary">{destino.dias} días</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {destino.descripcion}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Itinerario */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-500 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Itinerario detallado
                </h2>
                <div className="space-y-4">
                  {paquete.itinerario.map(
                    (dia: Paquete["itinerario"][number], index: number) => (
                      <div
                        key={index}
                        className="pl-4 border-l-4 border-primary/20 animate-fade-in-up"
                        style={{ animationDelay: `${600 + index * 50}ms` }}
                      >
                        <div className="flex items-center mb-2 space-x-2">
                          <Badge className="bg-primary text-primary-foreground">
                            Día {dia.dia}
                          </Badge>
                          <h3 className="font-semibold text-foreground">
                            {dia.titulo}
                          </h3>
                        </div>
                        <ul className="space-y-1">
                          {dia.actividades.map(
                            (actividad: string, actIndex: number) => (
                              <li
                                key={actIndex}
                                className="flex items-center text-sm text-muted-foreground"
                              >
                                <CheckCircle className="flex-shrink-0 w-3 h-3 mr-2 text-green-500" />
                                {actividad}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-600 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Qué incluye
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="animate-slide-right">
                    <h3 className="flex items-center mb-3 font-semibold text-green-700">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Incluido
                    </h3>
                    <ul className="space-y-2">
                      {paquete.incluido.map((item: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-muted-foreground animate-fade-in-up"
                          style={{ animationDelay: `${700 + index * 50}ms` }}
                        >
                          <CheckCircle className="flex-shrink-0 w-4 h-4 mr-3 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="animate-slide-left">
                    <h3 className="flex items-center mb-3 font-semibold text-red-700">
                      <XCircle className="w-5 h-5 mr-2" />
                      No incluido
                    </h3>
                    <ul className="space-y-2">
                      {paquete.noIncluido.map((item: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-muted-foreground animate-fade-in-up"
                          style={{ animationDelay: `${800 + index * 50}ms` }}
                        >
                          <XCircle className="flex-shrink-0 w-4 h-4 mr-3 text-red-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="z-10 transition-all duration-300 border-2 lg:sticky lg:top-6 bg-white/95 backdrop-blur-sm animate-fade-in-up animation-delay-400 hover:shadow-xl border-primary/10">
              <CardContent className="p-6">
                <div className="mb-6 text-center">
                  {paquete.precioOriginal && (
                    <div className="mb-1 text-lg line-through text-muted-foreground">
                      {paquete.precioOriginal}
                    </div>
                  )}
                  <div className="mb-1 text-3xl font-black text-transparent font-heading text-primary bg-gradient-to-r from-primary to-accent bg-clip-text animate-pulse-gentle">
                    {paquete.precio}
                  </div>
                  <div className="text-sm text-muted-foreground">por persona</div>
                  {paquete.descuento && (
                    <Badge className="mt-2 text-white bg-red-500">
                      ¡Ahorra {paquete.descuento}%!
                    </Badge>
                  )}
                </div>

                <div className="mb-6 space-y-4">
                  <div className="animate-slide-right">
                    <label className="text-sm font-medium text-muted-foreground">
                      Fecha de salida
                    </label>
                    <select className="w-full px-3 py-2 mt-1 transition-all duration-200 border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option>Seleccionar fecha</option>
                      {paquete.fechasDisponibles.map((fecha: string) => (
                        <option key={fecha} value={fecha}>
                          {new Date(fecha).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="animate-slide-left">
                    <label className="text-sm font-medium text-muted-foreground">
                      Número de personas
                    </label>
                    <select className="w-full px-3 py-2 mt-1 transition-all duration-200 border rounded-lg border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option>1 persona</option>
                      <option>2 personas</option>
                      <option>3 personas</option>
                      <option>4 personas</option>
                    </select>
                  </div>
                </div>

                <Button
                  className="w-full py-3 mb-3 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-105 hover:shadow-xl"
                  onClick={() =>
                    (window.location.href = `/reserva?paquete=${paquete.id}&nombre=${encodeURIComponent(
                      paquete.nombre
                    )}&precio=${encodeURIComponent(paquete.precio)}`)
                  }
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar paquete
                </Button>

                <div className="text-xs text-center text-muted-foreground animate-fade-in-up animation-delay-600">
                  Reserva con solo $100. Paga el resto 30 días antes del viaje.
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-500 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 font-semibold">¿Necesitas ayuda?</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Nuestros expertos están listos para ayudarte a planificar tu
                  viaje perfecto.
                </p>
                <Button
                  variant="outline"
                  className="w-full transition-all duration-200 bg-transparent hover:scale-105"
                >
                  Contactar asesor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PiePagina />
    </div>
  );
}
