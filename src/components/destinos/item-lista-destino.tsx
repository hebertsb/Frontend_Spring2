import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users } from "lucide-react";
import Link from "next/link";
// import { LoadingLink } from "../EfectoCarga/vista-cargando";
import Image from "next/image";
import {Servicio} from "@/lib/servicios"


export function ItemListaDestino({
  id,
  titulo,
  costo,
  imagenes,
  descripcion,
  calificacion,
  categoria,
}: Servicio) {

  const duracion = "Variable"; // Puedes ajustar esto según tus datos
  const maxPersonas =  5; // Puedes ajustar esto según tus datos
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Imagen */}
          <div className="relative w-full h-48 overflow-hidden sm:w-80 sm:h-auto">
            <Image
              src={imagenes?.[0] || "/placeholder.svg"}
              alt={titulo || 'imagen-destino'}
              fill
              className="object-cover w-full h-full"
            />
            <div className="absolute px-2 py-1 text-xs font-semibold rounded top-3 left-3 bg-primary text-primary-foreground">
              {typeof categoria === 'string' ? categoria : categoria?.nombre}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 p-6">
            <div className="space-y-3">
              {/* Location */}
              {/* <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {ubicacion}
              </div> */}

              {/* Title */}
              <h3 className="text-xl font-bold transition-colors font-heading text-foreground hover:text-primary">
                <Link href={`/destinos/${id}`}>{titulo}</Link>
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {descripcion}
              </p>

              {/* Meta Info */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {duracion}
                </div>
                {maxPersonas && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Hasta {maxPersonas} personas
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(calificacion || 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {(Number(calificacion) || 0).toFixed(1)} (
                  {Math.floor(Math.random() * 500) + 100} reseñas)
                </span>
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="text-right">
                <div className="text-2xl font-bold font-heading text-primary">
                  {costo}
                </div>
                <div className="text-xs text-muted-foreground">por persona</div>
              </div>
              <Link href={`/destinos/${id}`} className="w-full">
                <Button className="w-full mt-2 bg-blue-500 text-white">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
