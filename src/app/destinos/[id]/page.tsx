export async function generateStaticParams() {
  // Agrega aquí todos los IDs de tus destinos
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

import { Navegacion } from "@/components/comunes/navegacion";
import { PiePagina } from "@/components/comunes/pie-pagina";
import DetalleDestinoCliente from "./DetalleDestinoCliente";
import { Servicio } from "@/lib/servicios";

export default async function Page({ params }: { params: { id: string } }) {
  // Fetch de datos del destino
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/servicios/${params.id}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <Navegacion />
        <div className="max-w-4xl px-4 py-16 mx-auto text-center animate-fade-in">
          <h1 className="mb-4 text-2xl font-bold font-heading text-foreground">
            Destino no encontrado
          </h1>
          <PiePagina />
        </div>
      </div>
    );
  }
  const destino: Servicio = await res.json();

return (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
 

    {/* <pre className="p-4 m-4 bg-white rounded-lg shadow-md overflow-x-auto">
      {JSON.stringify(destino, null, 2)}
    </pre> */}

    <DetalleDestinoCliente destino={destino}/>

    <PiePagina />
  </div>
);

}