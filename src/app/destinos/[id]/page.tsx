// Importamos el router de Next.js
import { destinosEjemplo } from "../destinosData";
import { Navegacion } from "@/components/comunes/navegacion";
import { DetailBreadcrumbs } from "@/components/comunes/breadcrumbs";
import DetalleDestinoCliente from "./DetalleDestinoCliente";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" }
    // Puedes agregar más ids aquí si tienes más destinos
  ];
}

export default async function Page({ params }: { params: { id: string } }) {
  // Hacemos el fetch usando el id recibido por la URL
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/servicios/${params.id}`, {
    // Next.js recomienda usar cache: "no-store" para datos dinámicos
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <>
        <Navegacion />
        <div className="p-8 text-center text-red-600">
          Destino no encontrado.
        </div>
      </>
    );
  }

  const destino = await res.json();
  console.log(destino)
  return (
    <>
      <Navegacion />
      <DetailBreadcrumbs
        parentPage="Destinos"
        parentHref="/destinos"
        currentPageTitle={destino.titulo || "Detalle del Destino"}
      />
      <DetalleDestinoCliente destino={destino} />
    </>
  );
}
