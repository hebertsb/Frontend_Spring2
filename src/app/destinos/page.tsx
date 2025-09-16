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

import { destinosEjemplo } from "./destinosData";

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
      const coincidePrecio = destino.precioNumerico >= filtros.rangoPrecios[0] && destino.precioNumerico <= filtros.rangoPrecios[1];



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
