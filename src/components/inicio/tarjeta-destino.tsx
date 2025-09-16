import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { LoadingLink } from "../EfectoCarga/vista-cargando";
import Image from "next/image";

interface PropsTarjetaDestino {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  calificacion: number;
  urlImagen: string;
  precio?: string;
  reseñas?: number;
  duracion?: string; // Nueva propiedad agregada
}

export function TarjetaDestino({
  id,
  nombre,
  ubicacion,
  descripcion,
  calificacion,
  urlImagen,
  precio,
  reseñas
}: PropsTarjetaDestino) {
  const calificacionSegura = calificacion || 0;
  const calificacionRedondeada = Math.max(0, Math.min(5, calificacionSegura));

  return (
    <Card className="overflow-hidden transition-all duration-300 bg-white border-0 shadow-lg group hover:shadow-xl hover:-translate-y-1 animate-fade-in">
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={urlImagen || "/placeholder.svg?height=256&width=400&query=destino turístico boliviano"}
          alt={nombre}
          layout="fill"
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {precio && (
          <div className="absolute px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg top-4 right-4 bg-amber-500">
            {precio}
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Ubicación */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {ubicacion}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold transition-colors font-heading text-foreground group-hover:text-amber-600">
          {nombre}
        </h3>

        {/* Descripción */}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {descripcion}
        </p>

        {/* Calificación */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(calificacionRedondeada)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {calificacionRedondeada.toFixed(1)} ({reseñas ?? 0} reseñas)
          </span>
        </div>

        {/* Botón de acción */}
        <LoadingLink className="text-white " href={`/destinos/${id}`}>
          <Button className="w-full font-semibold text-white transition-all duration-200 transform cursor-pointer bg-amber-500 hover:bg-amber-600 hover:scale-105">
            Ver detalles
          </Button>
        </LoadingLink>
      </CardContent>
    </Card>
  );
}
