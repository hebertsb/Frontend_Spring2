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
import { Servicio } from "@/lib/servicios";
import { serviciosFallback } from "@/lib/servicios-fallback";

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
  const [cargando, setCargando] = useState(true);

  const manejarLimpiarFiltros = () => {
    setFiltros({
      rangoPrecios: [20, 500],
      categorias: [],
      calificacion: 1,
      duracion: [],
    });
  };

  // Fetch de servicios desde la API con fallback
  useEffect(() => {
    const fetchServicios = async () => {
      setCargando(true);
      try {
        console.log("🌍 Intentando cargar servicios desde API...");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/servicios/`,
          {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La respuesta no es JSON válido");
        }
        
        const data: Servicio[] = await response.json();
        console.log(`✅ Servicios cargados desde API: ${data.length} elementos`);
        setServicios(data);
      } catch (error) {
        console.warn('⚠️ Error al cargar servicios desde API, usando datos de fallback:', error);
        // En caso de error, usar datos de fallback
        console.log(`📦 Usando datos de fallback: ${serviciosFallback.length} servicios`);
        setServicios(serviciosFallback);
      } finally {
        setCargando(false);
      }
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
            {cargando ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando destinos...</p>
                </div>
              </div>
            ) : (
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
                      // datos={servicio} // <-- aquí pasas todo el objeto
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
                      key={servicio.id}
                      {...servicio}
                    />
                  )
                )}
              </div>
            )}

            {/* Sin resultados */}
            {!cargando && Servicios.length === 0 && (
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
