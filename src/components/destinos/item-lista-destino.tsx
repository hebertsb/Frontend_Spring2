import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users } from "lucide-react"
import Link from "next/link"
import { LoadingLink } from "../EfectoCarga/vista-cargando"
import Image from "next/image"

interface PropiedadesItemListaDestino {
  id: string
  nombre: string
  ubicacion: string
  descripcion: string
  calificacion: number
  urlImagen: string
  precio: string
  duracion: string
  categoria: string
  maxPersonas?: number
}

export function ItemListaDestino({
  id,
  nombre,
  ubicacion,
  descripcion,
  calificacion,
  urlImagen,
  precio,
  duracion,
  categoria,
  maxPersonas,
}: PropiedadesItemListaDestino) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full h-48 overflow-hidden sm:w-80 sm:h-auto">
            <Image
              src={urlImagen || "/placeholder.svg"}
              alt={nombre}
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute px-2 py-1 text-xs font-semibold rounded top-3 left-3 bg-primary text-primary-foreground">
              {categoria}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 p-6">
            <div className="space-y-3">
              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {ubicacion}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold transition-colors font-heading text-foreground hover:text-primary">
                <Link href={`/destinos/${id}`}>{nombre}</Link>
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{descripcion}</p>

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
                    className={`h-4 w-4 ${i < Math.floor(calificacion || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {(calificacion || 0).toFixed(1)} ({Math.floor(Math.random() * 500) + 100} reseñas)
                </span>
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="text-right">
                <div className="text-2xl font-bold font-heading text-primary">{precio}</div>
                <div className="text-xs text-muted-foreground">por persona</div>
              </div>
              <LoadingLink href={`/destinos/${id}`}>
                <Button className="font-semibold transition-all duration-200 bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-md">
                  Ver detalles
                </Button>
              </LoadingLink>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
