"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DetalleDestinoCliente({ destino }: { destino: any }) {
  const router = useRouter();

  const handleReservar = () => {
    router.push("/reserva");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-amber-200">
        <h1 className="text-4xl font-bold mb-4 text-amber-700">
          {destino.titulo}
        </h1>

        <div className="mb-6 flex justify-center">
          <Image
            src={destino.imagenes?.[0] || "/placeholder.svg"}
            alt={destino.titulo}
            width={600}
            height={350}
            className="rounded-xl object-cover shadow-lg border-4 border-amber-100 hover:scale-105 transition-all duration-300"
          />
        </div>

        <p className="mb-6 text-lg text-gray-700 font-medium leading-relaxed">
          {destino.descripcion_servicio}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-semibold text-blue-700">Tipo:</span>
            <span className="ml-2 text-gray-600">{destino.tipo}</span>
          </div>

          <div>
            <span className="font-semibold text-blue-700">Costo:</span>
            <span className="ml-2 text-amber-600 font-bold">
              Bs. {destino.costo}
            </span>
          </div>

          <div>
            <span className="font-semibold text-blue-700">Duración:</span>
            <span className="ml-2 text-gray-600">{destino.dias} días</span>
          </div>

          <div>
            <span className="font-semibold text-blue-700">Calificación:</span>
            <span className="ml-2 text-gray-600">{destino.calificacion}</span>
          </div>
        </div>

        <div className="mb-6">
          <span className="font-semibold text-blue-700">Incluido:</span>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
            {destino.incluido?.map((item: string, idx: number) => (
              <li key={idx} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <span className="font-semibold text-blue-700">Categoría:</span>
          <span className="ml-2 text-gray-600">{destino.categoria}</span>
        </div>

        <Button
          className="w-full py-3 font-semibold text-white rounded-lg bg-amber-500 hover:bg-blue-600 transition-colors text-lg mt-4 shadow-md hover:scale-105"
          onClick={handleReservar}
        >
          Reservar
        </Button>

        <div className="mt-8 text-xs text-gray-400 text-right">
          <p>Creado: {new Date(destino.created_at).toLocaleDateString()}</p>
          <p>Actualizado: {new Date(destino.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
