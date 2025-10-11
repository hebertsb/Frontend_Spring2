"use client";

import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

import { Servicio } from "@/lib/servicios";

export default function DetalleDestinoCliente({
  destino,
}: {
  destino: Servicio;
}) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [titulo, setTitulo] = useState<string>("",
  );
  const router = useRouter();

  useEffect(() => {
    if (destino) {
      setTitulo(destino.titulo);
    }
  }, [destino]);

  const manejarFavorito = () => {
    setEsFavorito(!esFavorito);
    toast({
      title: esFavorito ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: esFavorito
        ? `${destino?.titulo} ha sido eliminado de tus favoritos`
        : `${destino?.titulo} ha sido agregado a tus favoritos`,
    });
  };

  const manejarCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: destino?.titulo,
          text: destino?.descripcion || destino?.descripcion,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error al compartir:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "URL copiada",
        description: "El enlace ha sido copiado al portapapeles",
      });
    }
  };

  const manejarReserva = () => {
    if (!destino) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del destino",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams({
      servicio: destino.id?.toString() || "",
      nombre: destino.titulo || "",
      precio: destino.precio_usd !== undefined ? destino.precio_usd.toString() : "0",
    });
    // console.log(params)
     router.push(`/reserva?${params.toString()}`);
  };

  if (!destino) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Destino no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            El destino que buscas no existe o ha sido eliminado.
          </p>
          <Button onClick={() => router.push("/destinos")}>
            Volver a Destinos
          </Button>
        </Card>
      </div>
    );
  }

  const imagenPrincipal =
     destino.imagen_url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <DetailBreadcrumbs
        parentPage="Destinos"
        parentHref="/destinos"
        currentPageTitle={titulo || "Detalle del Destino"}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Imagen principal */}
          <div className="relative">
            <Image
              src={imagenPrincipal}
                    alt={destino.titulo || 'imagen-destino'}
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
                <Heart
                  className={`h-4 w-4 ${
                    esFavorito ? "fill-red-500 text-red-500" : ""
                  }`}
                />
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
          </div>

          {/* Información del destino */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
<<<<<<< HEAD
                  {typeof destino.categoria === 'string' ? destino.categoria : destino.categoria?.nombre || "Turismo"}
=======
                  {destino.categoria.nombre ||  "Turismo"}
>>>>>>> ccd9dbaa0be98fccf965db056758010d33d44e97
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    { 4.5}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {destino.titulo}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{destino.punto_encuentro || "Destino turístico"}</span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {destino.descripcion}
            </p>

            {/* Detalles rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">
                    {destino.duracion} 
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium">{destino.categoria.nombre || "General"}</p>
                </div>
              </div>
            </div>

            {/* Precio y reserva */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Precio por persona</p>
                  <p className="text-3xl font-bold text-blue-700">
<<<<<<< HEAD
                    USD{" "}
            {typeof destino.precio_usd === "string"
              ? destino.precio_usd
              : (destino.precio_usd ?? 0).toFixed(2)}
=======
                    USD {destino.precio_usd?.toString() || "0.00"}
>>>>>>> ccd9dbaa0be98fccf965db056758010d33d44e97
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <Button
                onClick={manejarReserva}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                Reservar Ahora
              </Button>
            </Card>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Qué incluye
            </h3>
            <ul className="space-y-2 text-gray-700">
              {destino.servicios_incluidos && destino.servicios_incluidos.length > 0 ? (
                destino.servicios_incluidos.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {item}
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Guía especializado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Transporte básico
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Entradas incluidas
                  </li>
                </>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Descripción adicional
            </h3>
            <div className="text-gray-700">
              {destino.descripcion ? (
                <p>{destino.categoria.nombre}</p>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Alimentación no incluida
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Gastos personales
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Propinas opcionales
                  </li>
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
      {/* <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
        {JSON.stringify(destino, null, 2)}
      </pre> */}
      <PiePagina />
    </div>
  );
}
