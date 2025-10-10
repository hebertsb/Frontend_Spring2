export async function generateStaticParams() {
  // Agrega aquí todos los IDs de tus destinos
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
    { id: "7" },
    { id: "8" },
    { id: "9" },
  ];
}

import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";
import DetalleDestinoCliente from "./DetalleDestinoCliente";
import { Servicio } from "@/lib/servicios";
import { serviciosFallback } from "@/lib/servicios-fallback";

export default async function Page({ params }: { params: { id: string } }) {
  let destino: Servicio | null = null;
  let error: string | null = null;

  try {
    console.log("🔍 Buscando destino con ID:", params.id);
    // Fetch de datos del destino
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/servicios/${params.id}`, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("La respuesta no es JSON válido");
    }
    
    destino = await res.json();
    console.log("✅ Destino encontrado:", destino?.titulo);
  } catch (err) {
    console.warn('⚠️ Error al cargar destino desde API, buscando en datos de fallback:', err);
    // Buscar en datos de fallback
    destino = serviciosFallback.find(s => s.id === params.id) || null;
    if (destino) {
      console.log("📦 Destino encontrado en fallback:", destino.titulo);
    } else {
      error = "Destino no encontrado";
      console.error("❌ Destino no encontrado ni en API ni en fallback");
    }
  }

  if (error || !destino) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <Navegacion />
        <div className="max-w-4xl px-4 py-16 mx-auto text-center animate-fade-in">
          <h1 className="mb-4 text-2xl font-bold font-heading text-foreground">
            Destino no encontrado
          </h1>
          {error && (
            <p className="text-red-600 mb-4">Error: {error}</p>
          )}
          <PiePagina />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <DetalleDestinoCliente destino={destino}/>
      <PiePagina />
    </div>
  );
}