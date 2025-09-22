"use client"

import type React from "react"
import { Navegacion } from "@/components/comunes/navegacion"
import { Breadcrumbs } from "@/components/comunes/breadcrumbs"
import { PiePagina } from "@/components/comunes/pie-pagina"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import FlujoReservaModerno from "@/components/flujo-reserva-moderno"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const SERVICIOS_DISPONIBLES = [
  { id: 1, titulo: "Salar de Uyuni", costo: 250.00 },
  { id: 2, titulo: "Isla del Sol", costo: 180.00 },
  { id: 3, titulo: "Tiwanaku", costo: 90.00 },
  { id: 4, titulo: "Cristo de la Concordia", costo: 60.00 },
  { id: 5, titulo: "Laguna Colorada", costo: 210.00 },
  { id: 6, titulo: "Camino de la Muerte", costo: 150.00 },
  { id: 7, titulo: "Coroico", costo: 120.00 },
  { id: 8, titulo: "Samaipata", costo: 170.00 },
  { id: 9, titulo: "Parque Nacional Madidi", costo: 300.00 }
];

export default function PaginaReserva() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [servicioSeleccionado, setServicioSeleccionado] = useState<{
    id: number;
    nombre: string;
    precio: number;
  } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const servicioId = searchParams.get('servicio');
    const nombre = searchParams.get('nombre');
    const precio = searchParams.get('precio');

    console.log('🔍 Parámetros URL:', { servicioId, nombre, precio });

    if (!servicioId) {
      setError('No se especificó un servicio para reservar');
      setCargando(false);
      return;
    }

    // Priorizar siempre los parámetros de la URL que vienen del paquete/destino seleccionado
    if (nombre && precio) {
      // DEBUGGING: Mostrar el precio original
      console.log('💰 DEBUGGING PRECIO COMPLETO:');
      console.log('- Precio original:', precio, typeof precio);
      
      // Método alternativo más seguro para procesar precios
      let precioNumerico;
      
      // Si ya es un número, usarlo directamente
      if (typeof precio === 'number') {
        precioNumerico = precio;
      } else {
        // NUEVO ENFOQUE: Mejor parseado de precios
        console.log('💰 DEBUGGING PRECIO COMPLETO:');
        console.log('- Precio original:', precio, typeof precio);
        
        // Extraer solo los números, manteniendo el formato correcto
        let numerosSolo = precio.replace(/[^0-9]/g, ''); // Solo números
        console.log('- Solo números extraídos:', numerosSolo);
        
        if (numerosSolo) {
          precioNumerico = parseFloat(numerosSolo);
          console.log('- ParseFloat resultado:', precioNumerico);
        } else {
          precioNumerico = 0;
        }
        
        // Verificación adicional
        if (isNaN(precioNumerico) || precioNumerico <= 0) {
          console.error('❌ PRECIO INVÁLIDO DETECTADO:', precioNumerico);
        }
      }
      
      console.log('💰 PRECIO FINAL CALCULADO:', precioNumerico);
      console.log('💰 TIPO FINAL:', typeof precioNumerico);
      
      // Verificación de cordura para precios específicos
      if (precioNumerico < 1 && precio.includes('1200')) {
        console.error('🚨 ERROR CRÍTICO: Precio 1200 convertido a', precioNumerico);
        console.error('🚨 Forzando corrección...');
        precioNumerico = 1200; // Corrección temporal
      }
      
      if (precioNumerico < 1 && precio.includes('2400')) {
        console.error('🚨 ERROR CRÍTICO: Precio 2400 convertido a', precioNumerico);
        console.error('🚨 Forzando corrección...');
        precioNumerico = 2400; // Corrección temporal
      }
      
      setServicioSeleccionado({
        id: parseInt(servicioId),
        nombre: nombre,
        precio: precioNumerico
      });
      console.log('✅ Servicio cargado desde URL:', { 
        id: servicioId, 
        nombre, 
        precio: precioNumerico,
        precio_formateado: `Bs. ${precioNumerico.toFixed(2)}`
      });
    } else {
      // Fallback: buscar en la lista de servicios disponibles solo si no hay parámetros completos
      const servicio = SERVICIOS_DISPONIBLES.find(s => s.id === parseInt(servicioId));
      
      if (servicio) {
        setServicioSeleccionado({
          id: servicio.id,
          nombre: servicio.titulo,
          precio: servicio.costo
        });
        console.log('✅ Servicio cargado desde lista:', servicio);
      } else {
        setError('Servicio no encontrado');
      }
    }
    
    setCargando(false);
  }, [searchParams]);

  const manejarReservaCompleta = (numeroReserva: string) => {
    console.log('🎉 Reserva completada:', numeroReserva);
    router.push('/cliente?tab=reservas');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información del servicio...</p>
          </div>
        </div>
        <PiePagina />
      </div>
    );
  }

  if (error || !servicioSeleccionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Error cargando servicio'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Para realizar una reserva, primero selecciona un paquete o destino.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/paquetes')}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Ver Paquetes
                </button>
                <button
                  onClick={() => router.push('/destinos')}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Ver Destinos
                </button>
              </div>
            </div>
          </div>
        </div>
        <PiePagina />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navegacion />
        
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="mt-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Reservar: {servicioSeleccionado.nombre}
              </h1>
              <p className="text-gray-600 mt-2">
                Experiencia Individual en Bolivia
              </p>
            </div>

            <FlujoReservaModerno
              servicioSeleccionado={servicioSeleccionado}
              onReservaCompleta={manejarReservaCompleta}
            />
          </div>
        </div>

        <PiePagina />
      </div>
    </ProtectedRoute>
  );
}
