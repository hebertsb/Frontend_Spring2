"use client";

import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { GaleriaImagenes } from "@/components/detalle/galeria-imagenes";
import { MapaDestino } from "@/components/detalle/mapa-destino";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Heart,
  Share2,
  Clock,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

import { Servicio } from "@/lib/servicios";

export default function DetalleDestinoCliente({
  destino,
}: {
  destino: Servicio;
}) {
  const router = useRouter();
  const [esFavorito, setEsFavorito] = useState(false);

  if (!destino) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <Navegacion />
        <div className="max-w-4xl px-4 py-16 mx-auto text-center animate-fade-in">
          <h1 className="mb-4 text-2xl font-bold font-heading text-foreground">
            Destino no encontrado
          </h1>
          <PiePagina />
        </div>
      </div>
    );
  }

  const alternarFavorito = () => {
    setEsFavorito(!esFavorito);
    toast({
      title: esFavorito ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: esFavorito
        ? `${destino.titulo} ha sido eliminado de tus favoritos`
        : `${destino.titulo} ha sido agregado a tus favoritos`,
    });
  };

  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: destino.titulo,
          text: `¡Mira este increíble destino en Bolivia: ${destino.titulo}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error al compartir:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center mb-4 space-x-2 text-sm text-muted-foreground">
            <span className="transition-colors cursor-pointer hover:text-primary">
              Inicio
            </span>
            <span>/</span>
            <span className="transition-colors cursor-pointer hover:text-primary">
              Destinos
            </span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {destino.titulo}
            </span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center space-x-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 animate-bounce-in">
                  {destino.tipo}
                </Badge>
                <Badge
                  variant="outline"
                  className="animate-bounce-in animation-delay-100"
                >
                  {destino.dias} días
                </Badge>
              </div>

              <h1 className="text-3xl font-black font-heading lg:text-4xl text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text">
                {destino.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center space-x-1 transition-colors hover:text-primary">
                  <MapPin className="w-4 h-4" />
                  <span>Bolivia</span>
                </div>
                <div className="flex items-center space-x-1 transition-colors hover:text-accent">
                  <Clock className="w-4 h-4" />
                  <span>{destino.dias} días</span>
                </div>
                <div className="flex items-center space-x-1 transition-colors hover:text-primary">
                  <Users className="w-4 h-4" />
                  <span>Incluido: {destino.incluido.length} servicios</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 animate-fade-in-up animation-delay-200">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-200 hover:scale-110 ${
                        i < Math.floor(Number(destino.calificacion))
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {destino.calificacion}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 animate-fade-in-up animation-delay-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={alternarFavorito}
                className="text-gray-700 border-0 bg-white/90 shadow-md active:scale-95 md:shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    esFavorito
                      ? "fill-red-500 text-red-500 animate-heartBeat"
                      : ""
                  }`}
                />
                Guardar
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="text-gray-700 border-0 bg-white/90 shadow-md active:scale-95 md:shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-400"
                onClick={compartir}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 animate-slide-up animation-delay-200">
          <GaleriaImagenes
            imagenes={destino.imagenes}
            titulo={destino.titulo}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-300 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Sobre esta experiencia
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4 leading-relaxed text-muted-foreground animate-fade-in-up">
                    {destino.descripcion_servicio}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Qué incluye */}
            <Card className="transition-shadow duration-300 animate-fade-in-up animation-delay-600 hover:shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold font-heading text-primary">
                  Qué incluye
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="animate-slide-right">
                    <h3 className="flex items-center mb-3 font-semibold text-green-700">
                      <span className="flex items-center justify-center w-6 h-6 mr-2 bg-green-100 rounded-full">
                        ✓
                      </span>
                      Incluido
                    </h3>
                    <ul className="space-y-2">
                      {destino.incluido.map((item: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-muted-foreground animate-fade-in-up"
                        >
                          <span className="w-2 h-2 mr-3 bg-green-500 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="z-10 transition-all duration-300 border-2 lg:sticky lg:top-6 animate-fade-in-up animation-delay-400 hover:shadow-xl border-primary/10 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-6 text-center animate-pulse-gentle">
                  <div className="mb-1 text-3xl font-black font-heading text-primary bg-gradient-to-r from-primary to-accent bg-clip-text">
                    Bs. {destino.costo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    por persona
                  </div>
                </div>

                <Button
                  className="w-full py-3 mb-3 font-semibold text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-105 hover:shadow-xl"
                  onClick={() => router.push(`/reserva?id=${destino.id}`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservar ahora
                </Button>

                <div className="text-xs text-center text-muted-foreground animate-fade-in-up animation-delay-600">
                  Reserva sin costo. Cancela hasta 24h antes.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <PiePagina />
    </div>
  );
}
