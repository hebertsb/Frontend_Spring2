"use client"

import { Button } from "@/components/ui/button"
import { Navegacion } from "@/components/comunes/navegacion"
import { Breadcrumbs } from "@/components/comunes/breadcrumbs"
import { PiePagina } from "@/components/comunes/pie-pagina"
import { FiltrosBusqueda } from "@/components/destinos/filtros-busqueda"
import { EncabezadoResultados } from "@/components/destinos/encabezado-resultados"
import { TarjetaDestino } from "@/components/inicio/tarjeta-destino"
import { ItemListaDestino } from "@/components/destinos/item-lista-destino"

import { useState, useMemo } from "react"

// Datos de ejemplo - en una app real vendría de una API
const destinosEjemplo = [
  {
    id: "salar-de-uyuni",
    nombre: "Salar de Uyuni",
    ubicacion: "Potosí, Bolivia",
    descripcion:
      "El desierto de sal más grande del mundo, un espejo natural que refleja el cielo creando paisajes surrealistas únicos en el planeta.",
    calificacion: 4.9,
    imagen: "https://unsplash.com/es/fotos/una-vista-de-una-ciudad-con-una-montana-al-fondo-zYi1Y3GIDyA",
    precio: "$120",
    duracion: "3 días",
    categoria: "naturaleza",
    maxPersonas: 12,
    precioNumerico: 120,
    duracionId: "2-3-dias",
  },
  {
    id: "lago-titicaca",
    nombre: "Lago Titicaca",
    ubicacion: "La Paz, Bolivia",
    descripcion:
      "El lago navegable más alto del mundo, hogar de las místicas Islas del Sol y la Luna, cuna de la civilización inca.",
    calificacion: 4.8,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$85",
    duracion: "2 días",
    categoria: "cultural",
    maxPersonas: 15,
    precioNumerico: 85,
    duracionId: "2-3-dias",
  },
  {
    id: "la-paz-city-tour",
    nombre: "Tour por La Paz",
    ubicacion: "La Paz, Bolivia",
    descripcion:
      "Explora la capital más alta del mundo con sus mercados coloridos, arquitectura colonial y teleféricos únicos.",
    calificacion: 4.7,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$60",
    duracion: "Día completo",
    categoria: "cultural",
    maxPersonas: 20,
    precioNumerico: 60,
    duracionId: "dia-completo",
  },
  {
    id: "potosi-minas",
    nombre: "Minas de Potosí",
    ubicacion: "Potosí, Bolivia",
    descripcion:
      "Descubre la historia de las famosas minas de plata que financiaron el imperio español durante siglos.",
    calificacion: 4.6,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$45",
    duracion: "Medio día",
    categoria: "historia",
    maxPersonas: 10,
    precioNumerico: 45,
    duracionId: "medio-dia",
  },
  {
    id: "sucre-colonial",
    nombre: "Sucre Colonial",
    ubicacion: "Chuquisaca, Bolivia",
    descripcion:
      "Recorre la ciudad blanca de Bolivia, capital constitucional con hermosa arquitectura colonial perfectamente conservada.",
    calificacion: 4.7,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$55",
    duracion: "Día completo",
    categoria: "cultural",
    maxPersonas: 18,
    precioNumerico: 55,
    duracionId: "dia-completo",
  },
  {
    id: "cochabamba-gastronomia",
    nombre: "Tour Gastronómico Cochabamba",
    ubicacion: "Cochabamba, Bolivia",
    descripcion: "Descubre los sabores únicos de la cocina boliviana en la ciudad de la eterna primavera.",
    calificacion: 4.5,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$50",
    duracion: "Medio día",
    categoria: "gastronomia",
    maxPersonas: 12,
    precioNumerico: 50,
    duracionId: "medio-dia",
  },
  {
    id: "madidi-adventure",
    nombre: "Parque Nacional Madidi",
    ubicacion: "La Paz, Bolivia",
    descripcion: "Aventura en uno de los parques más biodiversos del mundo con selva amazónica y vida silvestre única.",
    calificacion: 4.8,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$180",
    duracion: "5 días",
    categoria: "aventura",
    maxPersonas: 8,
    precioNumerico: 180,
    duracionId: "mas-semana",
  },
  {
    id: "copacabana-pilgrimage",
    nombre: "Copacabana Religiosa",
    ubicacion: "La Paz, Bolivia",
    descripcion:
      "Visita el santuario de la Virgen de Copacabana, uno de los centros de peregrinación más importantes de Bolivia.",
    calificacion: 4.4,
    imagen: "/placeholder.svg?height=400&width=600",
    precio: "$40",
    duracion: "Día completo",
    categoria: "religioso",
    maxPersonas: 25,
    precioNumerico: 40,
    duracionId: "dia-completo",
  },
]

export default function PaginaDestinos() {
  const [filtros, setFiltros] = useState({
    rangoPrecios: [20, 500] as [number, number],
    categorias: [] as string[],
    calificacion: 1,
    duracion: [] as string[],
  })

  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid")
  const [ordenarPor, setOrdenarPor] = useState("relevancia")
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const manejarLimpiarFiltros = () => {
    setFiltros({
      rangoPrecios: [20, 500],
      categorias: [],
      calificacion: 1,
      duracion: [],
    })
  }

  const destinosFiltrados = useMemo(() => {
    const resultados = destinosEjemplo.filter((destino) => {
      // Filtro por precio
      const coincidePrecio =
        destino.precioNumerico >= filtros.rangoPrecios[0] && destino.precioNumerico <= filtros.rangoPrecios[1]

      // Filtro por categoría
      const coincideCategoria = filtros.categorias.length === 0 || filtros.categorias.includes(destino.categoria)

      // Filtro por calificación
      const coincideCalificacion = destino.calificacion >= filtros.calificacion

      // Filtro por duración
      const coincideDuracion = filtros.duracion.length === 0 || filtros.duracion.includes(destino.duracionId)

      return coincidePrecio && coincideCategoria && coincideCalificacion && coincideDuracion
    })

    switch (ordenarPor) {
      case "precio-menor":
        resultados.sort((a, b) => a.precioNumerico - b.precioNumerico)
        break
      case "precio-mayor":
        resultados.sort((a, b) => b.precioNumerico - a.precioNumerico)
        break
      case "calificacion":
        resultados.sort((a, b) => b.calificacion - a.calificacion)
        break
      case "nombre":
        resultados.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      default:
        // Mantener orden por relevancia (orden original)
        break
    }

    return resultados
  }, [filtros, ordenarPor])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <Navegacion />
      <Breadcrumbs />
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Barra lateral de filtros */}
          <div className="lg:w-80">
            <FiltrosBusqueda
              filtros={filtros}
              alCambiarFiltros={setFiltros}
              alLimpiarFiltros={manejarLimpiarFiltros}
              estaAbierto={mostrarFiltros}
              alCerrar={() => setMostrarFiltros(false)}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <EncabezadoResultados
              totalResultados={destinosFiltrados.length}
              vistaActual={vistaActual}
              alCambiarVista={setVistaActual}
              alAlternarFiltros={() => setMostrarFiltros(!mostrarFiltros)}
              ordenarPor={ordenarPor}
              alCambiarOrden={setOrdenarPor}
            />

            {/* Resultados */}
            <div
              className={vistaActual === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}
            >
              {destinosFiltrados.map((destino) =>
                vistaActual === "grid" ? (
                  
                  <TarjetaDestino
                    key={destino.id}
                    id={destino.id}
                    nombre={destino.nombre}
                    ubicacion={destino.ubicacion}
                    descripcion={destino.descripcion}
                    calificacion={destino.calificacion}
                    urlImagen={destino.imagen}
                    precio={destino.precio}
                    duracion={destino.duracion}
                  />                 ) : (
                  <ItemListaDestino
                    key={destino.id}
                    id={destino.id}
                    nombre={destino.nombre}
                    ubicacion={destino.ubicacion}
                    descripcion={destino.descripcion}
                    calificacion={destino.calificacion}
                    urlImagen={destino.imagen}
                    precio={destino.precio}
                    duracion={destino.duracion}
                    categoria={destino.categoria}
                    maxPersonas={destino.maxPersonas}
                  />
                ),
              )}
            </div>

            {/* Sin resultados */}
            {destinosFiltrados.length === 0 && (
              <div className="py-16 text-center bg-white border shadow-sm rounded-xl border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="mb-3 text-2xl font-bold text-gray-800 font-heading">No se encontraron destinos</h3>
                  <p className="mb-6 text-lg text-gray-600">Intenta ajustar tus filtros para ver más resultados</p>
                  <Button
                    onClick={manejarLimpiarFiltros}
                    className="px-6 py-3 font-semibold text-white rounded-lg bg-amber-500 hover:bg-amber-600"
                  >
                    Limpiar todos los filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PiePagina />
    </div>
  )
}
