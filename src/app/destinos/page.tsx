"use client";

import { Button } from "@/components/ui/button";
import { Navegacion } from "@/components/comunes/navegacion";
import { Breadcrumbs } from "@/components/comunes/breadcrumbs";
import { PiePagina } from "@/components/comunes/pie-pagina";
import { FiltrosBusqueda } from "@/components/destinos/filtros-busqueda";
import { EncabezadoResultados } from "@/components/destinos/encabezado-resultados";
import { TarjetaDestino } from "@/components/inicio/tarjeta-destino";
import { ItemListaDestino } from "@/components/destinos/item-lista-destino";

import { useState, useEffect } from "react";

export default function PaginaDestinos() {
  const [filtros, setFiltros] = useState({
    rangoPrecios: [20, 500] as [number, number],
    categorias: [] as string[],
    calificacion: 1,
    duracion: [] as string[],
  });

  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [Servicios, setServicios] = useState<Servicio[]>([]); // Estado tipado como Servicio[]

  const manejarLimpiarFiltros = () => {
    setFiltros({
      rangoPrecios: [20, 500],
      categorias: [],
      calificacion: 1,
      duracion: [],
    });
  };

  // Fetch de servicios desde la API
  useEffect(() => {
    const fetchServicios = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/servicios/`
      );
      const data: Servicio[] = await response.json(); // Tipado correcto de la respuesta
      setServicios(data);
    };

    fetchServicios();
  }, []); // Solo ejecuta una vez al montar el componente

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
              totalResultados={Servicios.length}
              vistaActual={vistaActual}
              alCambiarVista={setVistaActual}
              alAlternarFiltros={() => setMostrarFiltros(!mostrarFiltros)}
              ordenarPor={ordenarPor}
              alCambiarOrden={setOrdenarPor}
            />

            {/* Resultados */}
            <div
              className={
                vistaActual === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {Servicios.map((servicio) =>
                vistaActual === "grid" ? (
                  <TarjetaDestino
                    datos={servicio} // <-- aquí pasas todo el objeto
                    key={servicio.id}
                    id={servicio.id}
                    nombre={servicio.titulo}
                    ubicacion={servicio.categoria?.nombre || "Sin ubicación"}
                    descripcion={servicio.descripcion_servicio}
                    calificacion={servicio.calificacion || 0}
                    urlImagen={servicio.imagenes?.[0] || "/placeholder.svg"}
                    precio={servicio.costo.toString()}
                    duracion={servicio.dias.toString()}
                  />
                ) : (
                  <ItemListaDestino
          
                    datos={servicio} 
                    key={servicio.id}
                    id={servicio.id}
                    titulo={servicio.titulo}
                    descripcion={servicio.descripcion_servicio}
                    calificacion={servicio.calificacion || 0}
                    imagenes={servicio.imagenes?.[0] || "/placeholder.svg"}
                    costo={servicio.costo.toString()}
                    duracion={servicio.dias.toString()}
                    categoria={servicio.categoria?.nombre || "Sin categoría"}
                    maxPersonas={servicio.max_personas}
                  />
                )
              )}
            </div>

            {/* Sin resultados */}
            {Servicios.length === 0 && (
              <div className="py-16 text-center bg-white border shadow-sm rounded-xl border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="mb-3 text-2xl font-bold text-gray-800 font-heading">
                    No se encontraron servicios
                  </h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Intenta ajustar tus filtros para ver más resultados
                  </p>
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
  );
}
