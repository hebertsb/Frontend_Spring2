





import { destinosEjemplo } from "../destinosData";
import { Navegacion } from "@/components/comunes/navegacion";
import DetalleDestinoCliente from "./DetalleDestinoCliente";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return destinosEjemplo.map((destino: { id: string }) => ({ id: destino.id }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const destino = destinosEjemplo.find((d) => d.id === params.id);
  return (
    <>
      <Navegacion />
      <DetalleDestinoCliente destino={destino} />
	</>
  );
}


