





import { paquetesData } from "../paquetesData";
import { Navegacion } from "@/components/comunes/navegacion";
import DetallePaqueteCliente from "./DetallePaqueteCliente";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return paquetesData.map((paquete: { id: string }) => ({ id: paquete.id }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const paquete = paquetesData.find((p) => p.id === params.id);
  return (
    <>
      <Navegacion />
      <DetallePaqueteCliente paquete={paquete} />
    </>
  );
}
